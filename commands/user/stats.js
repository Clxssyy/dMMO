const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('@napi-rs/canvas');
const { join } = require('path');
const { AttachmentBuilder } = require('discord.js');
const serverSchema = require('../../schemas/server');

async function createdataCanvas(user, data) {
  const canvas = Canvas.createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  Canvas.GlobalFonts.registerFromPath(
    join(__dirname, '..', '..', 'fonts', 'MouldyCheese-Regular.ttf'),
    'Mouldy Cheese'
  );
  console.info(Canvas.GlobalFonts.families);

  // Background
  // TODO: Add background color customization
  let hue1 = Math.floor(Math.random() * 360);
  let hue2 = Math.floor(Math.random() * 360);

  if (Math.abs(hue1 - hue2) < 50) {
    hue2 = (hue1 + 180) % 360;
  }

  let color = `hsl(${hue1}, 100%, 50%)`;
  let color2 = `hsl(${hue2}, 100%, 50%)`;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // TODO: Add border color customization
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(400, 300, 200, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();

  // Username and title
  // TODO: Add text color customization
  // TODO: Add titles to user's name
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 10;
  ctx.font = '40px Mouldy Cheese';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(`${user.displayName}`, canvas.width / 2, 50);
  ctx.shadowBlur = 0;

  // User avatar
  const avatar = await Canvas.loadImage(
    user.displayAvatarURL({ format: 'png' })
  );
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 140, 70, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, canvas.width / 2 - 70, 70, 140, 140);
  ctx.restore();

  ctx.shadowBlur = 10;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 140, 70, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Stats
  // TODO: Add some indication of when users are in the top 10 of a skill
  const statCategories = [
    { name: 'Messaging', value: data.messagingLevel, color: '#FF6B6B' },
    { name: 'Editing', value: data.editingLevel, color: '#4ECDC4' },
    { name: 'Reacting', value: data.reactingLevel, color: '#45B7D1' },
    { name: 'Cleaning', value: data.cleaningLevel, color: '#98D8C8' },
    { name: 'Discussion', value: data.discussingLevel, color: '#F7B801' },
    { name: 'Hosting', value: data.hostingLevel, color: '#7B68EE' },
  ];

  const startY = 250;
  const barHeight = 30;
  const gap = 25;
  const maxBarWidth = 500;
  const labelWidth = 120;

  statCategories.forEach((stat, index) => {
    const y = startY + (barHeight + gap) * index;

    ctx.font = '20px Mouldy Cheese';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';
    ctx.fillText(stat.name, labelWidth, y + barHeight / 2 + 6);

    // Stat Bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(labelWidth + 20, y, maxBarWidth, barHeight);

    const level = Math.floor(stat.value);
    const progress = Math.round(
      stat.value - level < 0.01 ? 0 : (stat.value - level) * 100
    );
    const barWidth = maxBarWidth * progress * 0.01;
    ctx.fillStyle = stat.color;
    ctx.fillRect(labelWidth + 20, y, barWidth, barHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(labelWidth + 20, y, maxBarWidth, barHeight);

    // Actions remaining till next level
    // const actions =
    //   level === 0
    //     ? 1
    //     : data.value - level >= 0.01
    //     ? 0
    //     : Math.round((1 - (stat.value - level)) * (level * 10));
    ctx.shadowBlur = 10;
    ctx.font = '16px Mouldy Cheese';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(`${progress}%`, canvas.width / 2, y + barHeight / 2 + 6);
    ctx.shadowBlur = 0;

    ctx.font = '20px Mouldy Cheese';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Lvl ${stat.value}`,
      labelWidth + maxBarWidth + 30,
      y + barHeight / 2 + 6
    );
  });

  // Total Level
  ctx.shadowBlur = 10;
  ctx.font = '30px Mouldy Cheese';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(`Total Level: ${data.totalLevel}`, canvas.width / 2, 590);
  ctx.shadowBlur = 0;

  return canvas;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription("Shows the user's data")
    .addUserOption((option) =>
      option.setName('user').setDescription("The user's data you want to see")
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    if (user.bot)
      return interaction.reply({
        content: 'Bots have no data!',
        ephemeral: true,
      });

    const server = interaction.guild;
    let serverData = await serverSchema.findOne({ serverID: server.id });

    if (!serverData) {
      console.log(`Creating new server in database: ${server.id}`);
      await serverSchema.create({
        serverID: server.id,
        users: [],
      });

      serverData = await serverSchema.findOne({ serverID: server.id });
    }

    let userdata = await serverData.users.find(
      (foundUser) => foundUser.userID == String(user.id)
    );

    if (!userdata) {
      console.log(`Creating new user in database: ${user.id} in ${server.id}`);
      await serverSchema.updateOne(
        { serverID: server.id },
        {
          $push: {
            users: {
              userID: user.id,
              messagingLevel: 0,
              reactingLevel: 0,
              discussingLevel: 0,
              hostingLevel: 0,
              editingLevel: 0,
              cleaningLevel: 0,
              totalLevel: 0,
              messagingCD: new Date(0),
              reactingCD: new Date(0),
              discussingCD: new Date(0),
              hostingCD: new Date(0),
              editingCD: new Date(0),
              cleaningCD: new Date(0),
              reputation: 0,
              profileViews: 0,
              cooldowns: [],
              settings: {
                color: 'white',
              },
            },
          },
        }
      );

      serverData = await serverSchema.findOne({ serverID: server.id });

      userdata = await serverData.users.find(
        (foundUser) => foundUser.userID == String(user.id)
      );
    }

    const canvas = await createdataCanvas(user, userdata);
    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
      name: `${user.id}-${server.id}-data.png`,
    });

    await interaction.reply({ files: [attachment] });
  },
};
