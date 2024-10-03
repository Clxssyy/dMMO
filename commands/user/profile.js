const { SlashCommandBuilder } = require('@discordjs/builders');
const serverSchema = require('../../schemas/server');
const { set } = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Customize your profile')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Set your profile')
        .addStringOption((option) =>
          option.setName('color').setDescription('Set your profile color')
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('view').setDescription('View your profile')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reset')
        .setDescription('Reset your profile to default.')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.user;

    let serverData = await serverSchema.findOne({
      serverID: interaction.guild.id,
    });

    if (!serverData) {
      console.log('Creating new server in database');
      await serverSchema.create({
        serverID: interaction.guild.id,
        users: [],
      });

      serverData = await serverSchema.findOne({
        serverID: interaction.guild.id,
      });
    }

    const data = serverData.users.find(
      (user) => user.userID === interaction.user.id
    );

    if (!data) {
      console.log('Creating new user in database');
      await serverSchema.findOneAndUpdate(
        { serverID: interaction.guild.id },
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
              settings: {
                color: 'white',
              },
            },
          },
        }
      );

      serverData = await serverSchema.findOne({
        serverID: interaction.guild.id,
      });

      data = serverData.users.find(
        (user) => user.userID === interaction.user.id
      );
    }

    if (subcommand === 'set') {
      const color = interaction.options.getString('color');

      if (!color) {
        return interaction.reply({
          content: 'Please provide a color to set your profile to.',
          ephemeral: true,
        });
      }

      if (!['white', 'red', 'blue', 'green', 'yellow'].includes(color)) {
        return interaction.reply({
          content: 'Please provide a valid color.',
          ephemeral: true,
        });
      }

      await serverSchema.updateOne(
        { serverID: interaction.guild.id, 'users.userID': user.id },
        {
          $set: {
            'users.$.settings.color': color,
          },
        }
      );

      return interaction.reply({
        content: `Your profile color has been set to ${color}.`,
        ephemeral: true,
      });
    }
  },
};
