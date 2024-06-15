const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const serverSchema = require('../../schemas/server');

const LEADERBOARD_COLOR = 0x5662f6;

/**
 * Gets the top 10 users in the server for the selected skill.
 * @param {Guild} guild - Guild where the interaction was sent from.
 * @param {String} skill - Selected skill for the leaderboard.
 * @returns {Promise<Array>} - Array of user stats objects.
 */
async function getUserStats(guild, skill) {
  const userIDs = (await guild.members.fetch())
    .filter((member) => !member.user.bot)
    .map((member) => String(member.user.id));

  try {
    if (serverSchema.find({ serverID: guild.id }).count() === 0) {
      serverSchema.create({
        serverID: guild.id,
        users: [],
      });
    }

    const serverData = await serverSchema.findOne({ serverID: guild.id });
    const userStats = serverData.users
      .filter((user) => userIDs.includes(user.userID))
      .sort((a, b) => b[skill] - a[skill])
      .slice(0, 10);

    return userStats;
  } catch (err) {
    console.log(err);
  }
}

/**
 * Gets the fields for the embed.
 * @param {Array} userStats - Array of user stats objects.
 * @param {String} skill - Selected skill for the leaderboard.
 * @param {Client} client - The client / bot.
 * @returns {Array} - Array of field objects for embed.
 */
function getFields(userStats, skill, client) {
  return userStats.map((userStat, index) => ({
    name: `${index + 1}. ${
      client.users.cache.get(String(userStat.userID)).username
    }`,
    value: `${userStat[skill]}`,
  }));
}

/**
 * Formats the embed for the leaderboard response.
 * @param {Array} fields - Array of field objects for embed.
 * @param {String} skill - Selected skill for the leaderboard.
 * @returns {EmbedBuilder} - Embed object.
 */
function formatLeaderboard(fields, skill) {
  skill = skill.charAt(0).toUpperCase() + skill.slice(1);
  skill = skill.replace('Level', '');

  return new EmbedBuilder()
    .setTitle(`dMMO ${skill} Leaderboard`)
    .setDescription(`Top 10 players in the server.`)
    .setColor(LEADERBOARD_COLOR)
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
    const client = interaction.client;
    const selectedSkill =
      interaction.options.getString('skill') || 'totalLevel';

    const userStats = await getUserStats(guild, selectedSkill);

    const fields = getFields(userStats, selectedSkill, client);

    const embed = formatLeaderboard(fields, selectedSkill);

    await interaction.reply({ embeds: [embed] });
  },
};
