const { Events } = require('discord.js');
const level = require('../utils/levelSkill');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    const user = message.author;
    const server = message.guild;

    // Bot actions are not tracked
    if (user.bot) return;

    // TODO: Change this to only level up when the user deletes their own message.
    // For example, if someone is moderating and deletes a message,
    // the user who posted the message should not gain a level.
    // In a way, this promotes people to send messages that will be deleted.
    // Through audit logs?

    level(server, user, 'Cleaning');
  },
};
