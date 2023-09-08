const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const user = message.author.id;
    var level = 0;
    var newLevel = level;

    if (level == 0) {
      newLevel = 1;
    } else {
      newLevel += 1 / (Math.floor(level) * 10);
    }

    if (newLevel > level) {
      message.channel.send(
        `${
          message.author.username
        } has leveled up Messaging to level ${Math.floor(newLevel)}!`
      );
    }
  },
};
