const server = require('../schemas/server.js');
const serverSchema = require('../schemas/server.js');

const checkTitle = async (data, serverID) => {
  const serverData = await serverSchema.findOne({ serverID });

  if (!serverData) {
    console.log(`Creating new server in database: ${serverID}`);
    await serverSchema.create({ serverID, users: [] });

    serverData = await serverSchema.findOne({ serverID });
  }

  let topUsers = [];
  switch (data.settings.title) {
    case 'Top Chatter':
      topUsers = serverData.users.sort(
        (a, b) => b.messagingLevel - a.messagingLevel
      );
      if (topUsers[0].userID === data.userID) return 'Top Chatter ';
      break;
    case 'Top Reactor':
      topUsers = serverData.users.sort(
        (a, b) => b.reactingLevel - a.reactingLevel
      );
      if (topUsers[0].userID === data.userID) return 'Top Reactor ';
      break;
    case 'Top Debater':
      topUsers = serverData.users.sort(
        (a, b) => b.discussingLevel - a.discussingLevel
      );
      if (topUsers[0].userID === data.userID) return 'Top Debater ';
      break;
    case 'Top Host':
      topUsers = serverData.users.sort(
        (a, b) => b.hostingLevel - a.hostingLevel
      );
      if (topUsers[0].userID === data.userID) return 'Top Host ';
      break;
    case 'Top Editor':
      topUsers = serverData.users.sort(
        (a, b) => b.editingLevel - a.editingLevel
      );
      if (topUsers[0].userID === data.userID) return 'Top Editor ';
      break;
    case 'Top Cleaner':
      topUsers = serverData.users.sort(
        (a, b) => b.cleaningLevel - a.cleaningLevel
      );
      if (topUsers[0].userID === data.userID) return 'Top Cleaner ';
      break;
    default:
      break;
  }

  await serverSchema.updateOne(
    { serverID: server.id, 'users.userID': data.userID },
    { $set: { 'users.$.settings.title': '' } }
  );

  return '';
};

module.exports = checkTitle;
