const { Events } = require('discord.js');
const level = require('../utils/levelSkill');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, message) {
    const user = message.author;
    const server = message.guild;

    // Bot actions are not tracked
    if (user.bot) return;

    // This causes messaging and editing to gain levels at the same time
    if (oldMessage.hasThread !== message.hasThread) return;

    level(server, user, 'Editing');
  },
};
