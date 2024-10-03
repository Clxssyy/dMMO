const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const serverSchema = require('../../schemas/server');
const { join } = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inspect')
    .setDescription('Inspect the user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user you want to inspect')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (user.bot) {
      return await interaction.reply({
        content: "Bots don't have custom profiles!",
        ephemeral: true,
      });
    }

    let serverData = await serverSchema.findOne({
      serverID: interaction.guild.id,
    });
    if (!serverData) {
      console.log(`Creating new server in database: ${interaction.guild.id}`);
      await serverSchema.create({
        serverID: interaction.guild.id,
        users: [],
      });

      serverData = await serverSchema.findOne({
        serverID: interaction.guild.id,
      });
    }

    const stats = await serverData.users.find(
      (foundUser) => foundUser.userID == String(user.id)
    );
    if (!stats) {
      console.log(
        `Creating new user in database: ${user.id} in ${interaction.guild.id}`
      );
      await serverSchema.updateOne(
        { serverID: interaction.guild.id },
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

      serverData = await serverSchema.findOne({
        serverID: interaction.guild.id,
      });

      stats = await serverData.users.find(
        (foundUser) => foundUser.userID == String(user.id)
      );
    }

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    Canvas.GlobalFonts.registerFromPath(
      join(__dirname, '..', '..', 'fonts', 'MouldyCheese-Regular.ttf'),
      'Mouldy Cheese'
    );

    // Background gradient
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, '#4158D0');
    gradient.addColorStop(0.5, '#C850C0');
    gradient.addColorStop(1, '#FFCC70');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 15);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 680, 230, 15);
    ctx.fill();

    // User info section
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'black';
    ctx.fillStyle = stats.settings.color || 'white';
    ctx.font = '32px Mouldy Cheese';
    ctx.fillText(user.displayName, 30, 50);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '18px Mouldy Cheese';
    ctx.fillText(`Level: ${stats.totalLevel}`, 45, 105);
    ctx.fillText(`Joined: ${member.joinedAt.toDateString()}`, 45, 145);
    ctx.fillText(`Rep: ${stats.reputation || 0}`, 45, 185);
    ctx.fillText(
      `Views: ${stats.profileViews ? stats.profileViews + 1 : 1}`,
      45,
      225
    );

    // Avatar
    const avatar = await Canvas.loadImage(
      user.displayAvatarURL({ format: 'png' })
    );
    ctx.save();
    ctx.beginPath();
    ctx.arc(587.5, 112.5, 87.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 500, 25, 175, 175);
    ctx.restore();

    // Avatar border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(587.5, 112.5, 87.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();

    // Username badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(500, 210, 175, 30, 15);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '16px Mouldy Cheese';
    ctx.textAlign = 'center';
    ctx.fillText(user.username, 587.5, 230);

    // Icons
    const iconPositions = [
      { x: 32, y: 100 },
      { x: 32, y: 138 },
      { x: 32, y: 178 },
      { x: 32, y: 218 },
    ];

    iconPositions.forEach((pos) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2, true);
      ctx.fillStyle = 'white';
      ctx.fill();
    });

    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
      name: `${user.username}-${interaction.guild.id}-profile.png`,
    });

    if (interaction.user.id !== user.id) {
      await serverSchema.findOneAndUpdate(
        { serverID: interaction.guild.id, 'users.userID': user.id },
        {
          ['users.$.profileViews']: stats.profileViews
            ? stats.profileViews + 1
            : 1,
        }
      );
    }

    await interaction.reply({ files: [attachment] });
  },
};
