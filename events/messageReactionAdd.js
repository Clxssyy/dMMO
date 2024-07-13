const { Events } = require('discord.js');
const level = require('../utils/levelSkill');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    if (reaction.message.author === user) return;

    const server = reaction.message.guild;

    level(server, user, 'Reacting');
  },
};
