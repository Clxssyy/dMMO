const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    const userID = user.id;
    var level = 0;
    var newLevel = level;

    if (level == 0) {
      newLevel = 1;
    } else {
      newLevel += 1 / (Math.floor(level) * 10);
    }

    if (newLevel > level) {
      reaction.message.channel.send(
        `${user.username} has leveled up Reacting to level ${Math.floor(
          newLevel
        )}!`
      );
    }
  },
};
