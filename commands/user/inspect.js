const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const userSchema = require('../../schemas/user');

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

    let userStats;
    let embed;
    const playerPrefix = 'Test';
    const playerSuffix = 'Player';

    if (!user.bot) {
      userStats = await userSchema.findOne({ userID: String(user.id) });

      if (!userStats) {
        await userSchema.create({
          userID: String(user.id),
          messagingLevel: 0,
          reactingLevel: 0,
          discussingLevel: 0,
          hostingLevel: 0,
          editingLevel: 0,
          cleaningLevel: 0,
          totalLevel: 0,
        });
        userStats = await userSchema.findOne({ userID: String(user.id) });
      }

      embed = new EmbedBuilder()
        .setColor(0x5662f6)
        .setTitle(playerPrefix + ' ' + user.displayName + ' ' + playerSuffix)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: 'Name',
            value: user.displayName,
          },
          {
            name: 'Quests Completed',
            value: '0',
          },
          {
            name: 'Level',
            value: String(userStats.totalLevel),
          },
          {
            name: 'Streak',
            value: '0',
          }
        );
    } else {
      embed = new EmbedBuilder()
        .setColor(0x5662f6)
        .setTitle(`Player Inspection`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields({
          name: 'Role',
          value: 'Bot',
        });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
