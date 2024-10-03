const { Events } = require('discord.js');
const levelSkill = require('../utils/levelSkill');
const levelRep = require('../utils/levelRep');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    // Bot actions are not tracked
    if (user.bot) return;

    // Prevent self-rep and self-leveling
    if (reaction.message.author === user) return;

    const server = reaction.message.guild;

    await levelSkill(server, user, 'Reacting');
    await levelRep(server, reaction.message.author, user);
  },
};
