const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const serverSchema = require('../../schemas/server');

async function createStatsCanvas(user, stats) {
  const canvas = Canvas.createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  // Background gradient
  let color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
  let color2 = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;

  // If the colors are too similar, change the second color
  if (Math.abs(color.charCodeAt(0) - color2.charCodeAt(0)) < 20) {
    color2 = `hsl(${(color.charCodeAt(0) + 180) % 360}, 100%, 50%)`;
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`${user.displayName}'s Stats`, canvas.width / 2, 50);

  // Avatar
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

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 140, 70, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.stroke();

  // Stats
  const statCategories = [
    { name: 'Messaging', value: stats.messagingLevel, color: '#FF6B6B' },
    { name: 'Editing', value: stats.editingLevel, color: '#4ECDC4' },
    { name: 'Reacting', value: stats.reactingLevel, color: '#45B7D1' },
    { name: 'Cleaning', value: stats.cleaningLevel, color: '#98D8C8' },
    { name: 'Discussion', value: stats.discussingLevel, color: '#F7B801' },
    { name: 'Hosting', value: stats.hostingLevel, color: '#7B68EE' },
  ];

  const startY = 250;
  const barHeight = 30;
  const gap = 25;
  const maxBarWidth = 500;
  const labelWidth = 120;

  ctx.font = '20px Arial';

  statCategories.forEach((stat, index) => {
    const y = startY + (barHeight + gap) * index;

    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';
    ctx.fillText(stat.name, labelWidth, y + barHeight / 2 + 6);

    // Stat Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(labelWidth + 20, y, maxBarWidth, barHeight);

    const level = Math.floor(stat.value);
    const progress = Math.round(
      stat.value - level < 0.01 ? 0 : (stat.value - level) * 100
    );
    const barWidth = maxBarWidth * progress * 0.01;
    ctx.fillStyle = stat.color;
    ctx.fillRect(labelWidth + 20, y, barWidth, barHeight);

    // Bar border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(labelWidth + 20, y, maxBarWidth, barHeight);

    const actions =
      level === 0
        ? 1
        : stats.value - level >= 0.01
        ? 0
        : Math.round((1 - (stat.value - level)) * (level * 10));
    ctx.fillStyle = 'black';
    ctx.fillText(
      `${actions} remaining`,
      (canvas.width + labelWidth) / 2,
      y + barHeight / 2 + 6
    );

    // Level and progress
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Lvl ${stat.value} (${progress}%)`,
      labelWidth + maxBarWidth + 30,
      y + barHeight / 2 + 6
    );
  });

  // Total Level
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`Total Level: ${stats.totalLevel}`, canvas.width / 2, 590);

  return canvas;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription("Shows the user's stats")
    .addUserOption((option) =>
      option.setName('user').setDescription("The user's stats you want to see")
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    if (user.bot)
      return interaction.reply({
        content: 'Bots have no stats!',
        ephemeral: true,
      });

    const server = interaction.guild;
    let serverData = await serverSchema.findOne({ serverID: server.id });

    if (!serverData) {
      // Create new server in database
      await serverSchema.create({
        serverID: server.id,
        users: [],
      });

      serverData = await serverSchema.findOne({ serverID: server.id });
    }

    let userStats = await serverData.users.find(
      (foundUser) => foundUser.userID == String(user.id)
    );

    if (!userStats) {
      // Create new user in database
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
            },
          },
        }
      );

      serverData = await serverSchema.findOne({ serverID: server.id });

      userStats = await serverData.users.find(
        (foundUser) => foundUser.userID == String(user.id)
      );
    }

    const canvas = await createStatsCanvas(user, userStats);
    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
      name: 'stats.png',
    });

    await interaction.reply({ files: [attachment] });
  },
};
