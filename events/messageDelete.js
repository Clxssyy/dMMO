const { Events } = require('discord.js');
const level = require('../utils/level.js');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    const user = message.author;

    if (user.bot) return;

    level(user, 'Cleaning');
  },
};
