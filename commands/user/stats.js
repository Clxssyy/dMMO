const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const serverSchema = require('../../schemas/server');

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
            },
          },
        }
      );

      serverData = await serverSchema.findOne({ serverID: server.id });

      userStats = await serverData.users.find(
        (foundUser) => foundUser.userID == String(user.id)
      );
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
