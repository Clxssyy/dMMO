const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const userSchema = require('../../schemas/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the stats leaderboard for users in the server.')
    .addStringOption((option) =>
      option
        .setName('skill')
        .setDescription('The type of leaderboard you want to see.')
        .addChoices(
          { name: 'Total Level', value: 'totalLevel' },
          { name: 'Messaging', value: 'messagingLevel' },
          { name: 'Reacting', value: 'reactingLevel' },
          { name: 'Discussing', value: 'discussingLevel' },
          { name: 'Hosting', value: 'hostingLevel' },
          { name: 'Editing', value: 'editingLevel' },
          { name: 'Cleaning', value: 'cleaningLevel' }
        )
    ),
  async execute(interaction) {
    const guild = interaction.guild;
    let choice = interaction.options.getString('skill') || 'totalLevel';

    const userIDs = (await guild.members.fetch())
      .filter((member) => !member.user.bot)
      .map((member) => String(member.user.id));

    const userStats = await userSchema
      .find({ userID: { $in: userIDs } })
      .sort({ [choice]: -1 })
      .limit(10);

    const usernames = [];

    for (let i = 0; i < userStats.length; i++) {
      usernames.push(
        interaction.client.users.cache.get(String(userStats[i].userID))
      );
    }

    const fields = [];

    for (let i = 0; i < userStats.length; i++) {
      fields.push({
        name: `${i + 1}. ${usernames[i].username}`,
        value: `${userStats[i][choice]}`,
      });
    }

    choice = choice.charAt(0).toUpperCase() + choice.slice(1);
    choice = choice.replace('Level', '');

    const embed = new EmbedBuilder()
      .setTitle(`dMMO ${choice} Leaderboard`)
      .setDescription(`Top 10 players in the server.`)
      .setColor(0x5662f6)
      .setFields(fields);

    await interaction.reply({ embeds: [embed] });
  },
};
