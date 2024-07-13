const { Events } = require('discord.js');
const level = require('../utils/levelSkill');

module.exports = {
  name: Events.GuildScheduledEventUserAdd,
  async execute(event, user) {
    if (user.bot) return;

    const eventCreator = event.creator;
    const server = event.guild;

    if (eventCreator.id == user.id) return;

    level(server, event, 'Hosting');
  },
};
