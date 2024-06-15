const { Events } = require('discord.js');
const level = require('../utils/level');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    const user = message.author;

    if (user.bot) return;

    if (message.channel.isThread()) {
      const threadStartMessage = await message.channel.fetchStarterMessage();
      const threadCreator = threadStartMessage.author;

      if (user.id == threadCreator.id) return;

      level(message, 'Discussion');
    } else {
      level(message, 'Messaging');
    }
  },
};
