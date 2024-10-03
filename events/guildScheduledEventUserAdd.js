const { Events } = require('discord.js');
const levelSkill = require('../utils/levelSkill');
const levelRep = require('../utils/levelRep');

module.exports = {
  name: Events.GuildScheduledEventUserAdd,
  async execute(event, user) {
    // Bot actions are not tracked
    if (user.bot) return;

    const eventCreator = event.creator;
    const server = event.guild;

    // Prevent self-leveling
    if (eventCreator.id == user.id) return;

    levelSkill(server, eventCreator, 'Hosting');
    levelRep(server, eventCreator, user);
  },
};
