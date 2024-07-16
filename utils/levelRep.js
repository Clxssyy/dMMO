const serverSchema = require('../schemas/server');

// Levels reputation of user when someone interacts with them
// Sets cooldown for that specific user
const levelRep = async (server, user, sender) => {
  let serverData = await serverSchema.findOne({ serverID: server.id });

  if (!serverData) {
    await serverSchema.create({
      serverID: server.id,
      users: [],
    });

    serverData = await serverSchema.findOne({ serverID: server.id });
  }

  let userData = await serverData.users.find(
    (foundUser) => foundUser.userID == String(user.id)
  );

  if (!userData) {
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
            cooldowns: [],
          },
        },
      }
    );

    serverData = await serverSchema.findOne({ serverID: server.id });

    userData = await serverData.users.find(
      (foundUser) => foundUser.userID == String(user.id)
    );
  }

  let senderData = await serverData.users.find(
    (foundUser) => foundUser.userID == String(sender.id)
  );

  if (!senderData) {
    await serverSchema.updateOne(
      { serverID: server.id },
      {
        $push: {
          users: {
            userID: sender.id,
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
            cooldowns: [],
          },
        },
      }
    );

    serverData = await serverSchema.findOne({ serverID: server.id });

    senderData = await serverData.users.find(
      (foundUser) => foundUser.userID == String(sender.id)
    );
  }

  let cooldown = senderData.cooldowns.find(
    (cooldown) => cooldown.user == String(user.id)
  );

  if (cooldown && Date.parse(cooldown.time) + 60000 > Date.now()) return;

  let reputation = userData.reputation;

  if (reputation < 1) {
    reputation += 1 / 100;
  } else {
    reputation += 1 / (Math.floor(reputation) * 100);
  }

  await serverSchema.updateOne(
    { serverID: server.id, 'users.userID': user.id },
    {
      $set: {
        'users.$.reputation': reputation,
      },
    }
  );

  await serverSchema.updateOne(
    { serverID: server.id, 'users.userID': sender.id },
    {
      $push: {
        'users.$.cooldowns': {
          user: user.id,
          time: new Date(),
        },
      },
    }
  );

  return;
};

module.exports = levelRep;
