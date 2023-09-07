const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Servers (${client.guilds.cache.size}):`);
    console.log(
      client.guilds.cache.forEach((guild) => console.log(guild.name))
    );
  },
};
