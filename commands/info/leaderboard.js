const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const userSchema = require('../../schemas/user');

// @param {Array} userStats - Array of user stats objects.
// @param {String} skill - Selected skill for the leaderboard.
// @param {Interaction} interaction - The interaction object.
// @returns {Array} - Array of field objects for embed.
function getFields(userStats, skill, interaction) {
  return userStats.map((userStat, index) => ({
    name: `${index + 1}. ${
      interaction.client.users.cache.get(String(userStat.userID)).username
    }`,
    value: `${userStat[skill]}`,
  }));
}

// @param {Array} fields - Array of field objects for embed.
// @param {String} skill - The type of leaderboard to show.
// @returns {EmbedBuilder} - The formatted embed to send.
function formatLeaderboard(fields, skill) {
  skill = skill.charAt(0).toUpperCase() + skill.slice(1);
  skill = skill.replace('Level', '');

  return new EmbedBuilder()
    .setTitle(`dMMO ${skill} Leaderboard`)
    .setDescription(`Top 10 players in the server.`)
    .setColor(0x5662f6)
    .setFields(fields);
}

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
    const selectedSkill =
      interaction.options.getString('skill') || 'totalLevel';

    const userIDs = (await guild.members.fetch())
      .filter((member) => !member.user.bot)
      .map((member) => String(member.user.id));

    const userStats = await userSchema
      .find({ userID: { $in: userIDs } })
      .sort({ [selectedSkill]: -1 })
      .limit(10);

    const fields = getFields(userStats, selectedSkill, interaction);

    const embed = formatLeaderboard(fields, selectedSkill);

    await interaction.reply({ embeds: [embed] });
  },
};
