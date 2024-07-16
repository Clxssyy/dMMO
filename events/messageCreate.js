const { Events } = require('discord.js');
const levelSkill = require('../utils/levelSkill');
const levelRep = require('../utils/levelRep');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    const user = message.author;
    const server = message.guild;

    if (user.bot) return;

    if (message.channel.isThread()) {
      const threadStartMessage = await message.channel.fetchStarterMessage();
      const threadCreator = threadStartMessage.author;

      if (user.id == threadCreator.id) return;

      levelSkill(server, user, 'Discussing');
      levelRep(server, threadStartMessage.author, user);
    } else {
      levelSkill(server, user, 'Messaging');

      if (message.type === 19 && !message.author.bot) {
        levelRep(server, message.mentions.users.first(), user);
      }
    }
  },
};
