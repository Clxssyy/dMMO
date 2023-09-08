const { Events } = require('discord.js');
const level = require('../utils/level.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(event, user) {
    const user = message.author;

    if (user.bot) return;

    const eventCreator = event.creator;

    if (eventCreator.id == user.id) return;

    level(eventCreator, 'Hosting');
  },
};
