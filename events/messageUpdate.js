const { Events } = require('discord.js');
const level = require('../utils/levelSkill');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, message) {
    const user = message.author;
    const server = message.guild;

    if (user.bot) return;

    if (oldMessage.hasThread !== message.hasThread) return;

    level(server, user, 'Editing');
  },
};
