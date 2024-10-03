const serverSchema = require('../schemas/server');

const levelSkill = async (server, user, skill) => {
  let serverData = await serverSchema.findOne({ serverID: server.id });

  if (!serverData) {
    // Create new server in database
    await serverSchema.create({
      serverID: server.id,
      users: [],
    });

    serverData = await serverSchema.findOne({ serverID: server.id });
  }

  let data = await serverData.users.find(
    (foundUser) => foundUser.userID == String(user.id)
  );

  if (!data) {
    // Create new user in database
    await serverSchema.updateOne(
      { serverID: server.id },
      {
        $push: {
          users: {
            userID: user.id,
            messagingLevel: 0,
            reactingLevel: 0,
            discussingLevel: 0,
            hostingLevel: 0,
            editingLevel: 0,
            cleaningLevel: 0,
            totalLevel: 0,
            messagingCD: new Date(0),
            reactingCD: new Date(0),
            discussingCD: new Date(0),
            hostingCD: new Date(0),
            editingCD: new Date(0),
            cleaningCD: new Date(0),
            reputation: 0,
            profileViews: 0,
            cooldowns: [],
          },
        },
      }
    );

    serverData = await serverSchema.findOne({ serverID: server.id });

    data = await serverData.users.find(
      (foundUser) => foundUser.userID == String(user.id)
    );
  }
  // Anti-spam
  if (Date.parse(data[skill.toLowerCase() + 'CD']) + 60000 > Date.now()) {
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
  await serverSchema.findOneAndUpdate(
    { serverID: server.id, 'users.userID': user.id },
    {
      ['users.$.' + skill.toLowerCase() + 'Level']: level.toFixed(4),
      ['users.$.' + skill.toLowerCase() + 'CD']: Date.now(),
      ['users.$.totalLevel']: (data.totalLevel + level - oldLevel).toFixed(4),
    }
  );

  // Send message to user if they leveled up
  if (oldLevel < Math.floor(level)) {
    user.send(
      `You leveled up ${skill} to level ${Math.floor(level)} in ${server.name}!`
    );
  }
};

module.exports = levelSkill;
