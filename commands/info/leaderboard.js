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
      .filter((user) => userIDs.includes(user.userID) && user[skill] > 0)
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
  if (userStats.length === 0) {
    return [
      {
        name: 'No users found',
        value: 'Be the first to level up!',
        inline: true,
      },
    ];
  }

  const userFields = userStats.map((userStat) => ({
    name: `${client.users.cache.get(String(userStat.userID)).username}`,
    value: '** **',
    inline: true,
  }));

  const levelFields = userStats.map((userStat) => ({
    name: `${userStat[skill]}`,
    value: '** **',
    inline: true,
  }));

  const fields = [
    {
      name: 'Rank',
      value: '** **',
      inline: true,
    },
    {
      name: 'User',
      value: '** **',
      inline: true,
    },

    {
      name: 'Level',
      value: '** **',
      inline: true,
    },
  ];

  for (let i = 0; i < userFields.length; i++) {
    fields.push({
      name: `${i + 1}.`,
      value: '** **',
      inline: true,
    });
    fields.push(userFields[i]);

    fields.push(levelFields[i]);
  }

  return fields;
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

  // TODO: Add dynamic image for each skill. (Custom images)
  return new EmbedBuilder()
    .setTitle(`Top 10 ${skill} Level`)
    .setThumbnail(
      'https://www.netflix.com/tudum/top10/images/big_numbers/10.png'
    )
    .setColor(LEADERBOARD_COLOR)
    .setFields(fields)
    .setFooter({
      text: 'Complete events and quests to level up!',
    })
    .setTimestamp();
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
