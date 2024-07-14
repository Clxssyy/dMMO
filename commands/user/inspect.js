const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const serverSchema = require('../../schemas/server');

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
      console.log('Creating new server in database');
      await serverSchema.create({
        serverID: interaction.guild.id,
        users: [],
      });

      serverData = await serverSchema.findOne({
        serverID: interaction.guild.id,
      });
    }

    const data = await serverData.users.find(
      (foundUser) => foundUser.userID == String(user.id)
    );
    if (!data) {
      return await interaction.reply({
        content: "User doesn't have a profile yet",
        ephemeral: true,
      });
    }

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    // Gradient Background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, '#1a2a6c');
    gradient.addColorStop(0.5, '#b21f1f');
    gradient.addColorStop(1, '#fdbb2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    const borderColor = '#ffffff';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Nameplate for Name
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 20, 400, 40);

    // Name
    const nameColor = '#EC3F41';
    const prefix = '';
    const suffix = '';
    const name = prefix + ' ' + user.displayName + ' ' + suffix;
    ctx.fillStyle = nameColor;
    ctx.font = '30px Arial';
    ctx.fillText(name, 20, 50);

    // Nameplate for Info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 70, 400, 70);

    // Info
    const infoColor = '#ffffff';
    ctx.fillStyle = infoColor;
    ctx.font = '20px Arial';
    ctx.fillText('Quests: ', 20, 90);
    ctx.fillText('Level: ' + data.totalLevel, 20, 110);
    ctx.fillText('Streak: ', 20, 130);

    // Nameplate for footer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 150, 400, 70);

    // Footer
    ctx.fillStyle = infoColor;
    ctx.font = '20px Arial';
    ctx.fillText('Joined: ' + member.joinedAt.toDateString(), 20, 170);
    ctx.fillText('Rep: 0', 20, 200);
    ctx.fillText('Views: 0', 300, 200);

    // Avatar
    const avatar = await Canvas.loadImage(
      user.displayAvatarURL({ format: 'jpg' })
    );
    ctx.save();
    ctx.beginPath();
    ctx.arc(575, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 475, 25, 200, 200);
    ctx.restore();

    // Avatar Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(575, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();

    // Adding Shadow Effects
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
      name: 'inspect.png',
    });

    await interaction.reply({ files: [attachment] });

    //   const user = interaction.options.getUser('user');
    //   let userStats;
    //   let embed;
    //   const playerPrefix = '';
    //   const playerSuffix = '';
    //   if (!user.bot) {
    //     userStats = await userSchema.findOne({ userID: String(user.id) });
    //     if (!userStats) {
    //       await userSchema.create({
    //         userID: String(user.id),
    //         messagingLevel: 0,
    //         reactingLevel: 0,
    //         discussingLevel: 0,
    //         hostingLevel: 0,
    //         editingLevel: 0,
    //         cleaningLevel: 0,
    //         totalLevel: 0,
    //       });
    //       userStats = await userSchema.findOne({ userID: String(user.id) });
    //     }
    //     embed = new EmbedBuilder()
    //       .setColor(0x5662f6)
    //       .setTitle(playerPrefix + ' ' + user.displayName + ' ' + playerSuffix)
    //       .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    //       .addFields(
    //         {
    //           name: 'Name',
    //           value: user.displayName,
    //         },
    //         {
    //           name: 'Quests Completed',
    //           value: '0',
    //         },
    //         {
    //           name: 'Level',
    //           value: String(userStats.totalLevel),
    //         },
    //         {
    //           name: 'Streak',
    //           value: '0',
    //         }
    //       );
    //   } else {
    //     embed = new EmbedBuilder()
    //       .setColor(0x5662f6)
    //       .setTitle(`Player Inspection`)
    //       .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    //       .addFields({
    //         name: 'Role',
    //         value: 'Bot',
    //       });
    //   }
    //   await interaction.reply({ embeds: [embed] });
  },
};
