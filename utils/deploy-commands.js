const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();

const deployCommands = async () => {
  const commands = [];

  const commandsFolder = path.join(__dirname, '../commands');
  const categories = fs.readdirSync(commandsFolder);

  for (const category of categories) {
    const categoryFolder = path.join(commandsFolder, category);
    const categoryCommands = fs
      .readdirSync(categoryFolder)
      .filter((file) => file.endsWith('.js'));

    for (const command of categoryCommands) {
      const commandPath = path.join(categoryFolder, command);
      const newCommand = require(commandPath);
      if ('data' in newCommand && 'execute' in newCommand) {
        commands.push(newCommand.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  const rest = new REST().setToken(process.env.BOT_TOKEN);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationCommands(process.env.APP_ID),
      {
        body: commands,
      }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
};

module.exports = deployCommands;
