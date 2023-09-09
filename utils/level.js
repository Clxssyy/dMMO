const userSchema = require('../schemas/user');

module.exports = async (user, skill) => {
  const data = await userSchema.findOne({ userID: String(user.id) });

  if (!data) {
    // Create new user in database
    await userSchema.create({
      userID: String(user.id),
      messagingLevel: 0,
      reactingLevel: 0,
      discussingLevel: 0,
      hostingLevel: 0,
      editingLevel: 0,
      cleaningLevel: 0,
      totalLevel: 0,
      lastLevel: skill.toLowerCase(),
      lastLevelDate: Date.now(),
    });
  } else {
    // Anti-spam
    if (
      data.lastLevel == skill.toLowerCase() &&
      Date.parse(data.lastLevelDate) + 300000 > Date.now()
    ) {
      return;
    }

    let level = data[skill.toLowerCase() + 'Level'];
    const oldLevel = level;

    if (level == 0) {
      level = 1;
    } else {
      level += 1 / (Math.floor(level) * 10);
    }

    // Update level in database
    await userSchema.updateOne(
      { userID: user.id },
      {
        [skill.toLowerCase() + 'Level']: level.toFixed(4),
        totalLevel: (data.totalLevel + level - oldLevel).toFixed(4),
        lastLevel: skill.toLowerCase(),
        lastLevelDate: Date.now(),
      }
    );

    // Send message to user if they leveled up
    if (oldLevel < Math.floor(level)) {
      user.send(`You leveled up ${skill} to level ${Math.floor(level)}!`);
    }
  }
};
