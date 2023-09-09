const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const userSchema = require('../../schemas/user');

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

    let userStats = await userSchema.findOne({ userID: String(user.id) });

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

    const embed = new EmbedBuilder()
      .setColor(0x5662f6)
      .setTitle(`${user.username}'s stats`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: 'Messaging',
          value: String(userStats.messagingLevel),
          inline: true,
        },
        {
          name: 'Editing',
          value: String(userStats.editingLevel),
          inline: true,
        },
        {
          name: 'Reacting',
          value: String(userStats.reactingLevel),
          inline: true,
        },
        {
          name: 'Cleaning',
          value: String(userStats.cleaningLevel),
          inline: true,
        },
        {
          name: 'Discussion',
          value: String(userStats.discussingLevel),
          inline: true,
        },
        {
          name: 'Hosting',
          value: String(userStats.hostingLevel),
          inline: true,
        },
        { name: 'Total Level', value: String(userStats.totalLevel) }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
