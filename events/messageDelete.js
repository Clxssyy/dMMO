const { Events } = require('discord.js');
const level = require('../utils/levelSkill');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    const user = message.author;
    const server = message.guild;

    if (user.bot) return;

    level(server, user, 'Cleaning');
  },
};
