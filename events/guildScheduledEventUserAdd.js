const { Events } = require('discord.js');
const level = require('../utils/level.js');

module.exports = {
  name: Events.GuildScheduledEventUserAdd,
  async execute(event, user) {
    if (user.bot) return;

    const eventCreator = event.creator;

    if (eventCreator.id == user.id) return;

    level(eventCreator, 'Hosting');
  },
};
