const { SlashCommandBuilder } = require('@discordjs/builders');
const serverSchema = require('../../schemas/server');
const createProfile = require('../../utils/createProfile');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Customize your profile')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Set your profile')
        .addStringOption((option) =>
          option
            .setName('color')
            .setDescription('Set your profile color')
            .addChoices(
              {
                name: 'White',
                value: 'white',
              },
              { name: 'Red', value: 'red' },
              { name: 'Blue', value: 'blue' },
              { name: 'Green', value: 'green' },
              { name: 'Yellow', value: 'yellow' }
            )
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
    const member = interaction.guild.members.cache.get(user.id);

    let serverData = await serverSchema.findOne({
      serverID: interaction.guild.id,
    });

    if (!serverData) {
      console.log(`Creating new server in database: ${interaction.guild.id}`);
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
      console.log(
        `Creating new user in database: ${interaction.user.id} in ${interaction.guild.id}`
      );
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

      switch (color) {
        case 'red':
          if (data.totalLevel < 100) {
            return interaction.reply({
              content: 'You need to reach level 100 to unlock the red color.',
              ephemeral: true,
            });
          }
          break;

        case 'blue':
          if (data.totalLevel < 50) {
            return interaction.reply({
              content: 'You need to reach level 50 to unlock the blue color.',
              ephemeral: true,
            });
          }
          break;

        case 'green':
          if (data.totalLevel < 25) {
            return interaction.reply({
              content: 'You need to reach level 25 to unlock the green color.',
              ephemeral: true,
            });
          }
          break;

        case 'yellow':
          if (data.totalLevel < 10) {
            return interaction.reply({
              content: 'You need to reach level 10 to unlock the yellow color.',
              ephemeral: true,
            });
          }
          break;

        default:
          break;
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

    if (subcommand === 'reset') {
      await serverSchema.updateOne(
        { serverID: interaction.guild.id, 'users.userID': user.id },
        {
          $set: {
            'users.$.settings.color': 'white',
          },
        }
      );

      return interaction.reply({
        content: 'Your profile color has been reset to white.',
        ephemeral: true,
      });
    }

    if (subcommand === 'view') {
      const profileImage = await createProfile(data, user, member);

      const attachment = new AttachmentBuilder(profileImage, {
        name: `${user.username}-${interaction.guild.id}-profile.png`,
      });

      return interaction.reply({
        files: [attachment],
        ephemeral: true,
      });
    }
  },
};
