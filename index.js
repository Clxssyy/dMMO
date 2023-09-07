const { Client, Collection, GatewayIntentBits } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();

const commandDir = path.join(__dirname, 'commands');
const commandCategories = fs.readdirSync(commandDir);

for (const category of commandCategories) {
  const commandFiles = fs
    .readdirSync(path.join(commandDir, category))
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandDir, category, file));
    client.commands.set(command.data.name, command);
  }
}

const eventDir = path.join(__dirname, 'events');
const eventFiles = fs
  .readdirSync(eventDir)
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventDir, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.BOT_TOKEN);
