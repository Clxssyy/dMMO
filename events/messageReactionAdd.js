const { Events } = require('discord.js');
const levelSkill = require('../utils/levelSkill');
const levelRep = require('../utils/levelRep');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    if (reaction.message.author === user) return;

    const server = reaction.message.guild;

    await levelSkill(server, user, 'Reacting');
    await levelRep(server, reaction.message.author, user);
  },
};
