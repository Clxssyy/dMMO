const { Events } = require('discord.js');
const level = require('../utils/level.js');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    if (reaction.message.author === user) return;

    level(reaction, 'Reacting');
  },
};
