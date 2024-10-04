const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const serverSchema = require('../../schemas/server');
const createProfile = require('../../utils/createProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inspect')
    .setDescription('Inspect the user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user you want to inspect')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (user.bot) {
      return await interaction.reply({
        content: "Bots don't have custom profiles!",
        ephemeral: true,
      });
    }

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

    const data = await serverData.users.find(
      (foundUser) => foundUser.userID == String(user.id)
    );
    if (!data) {
      console.log(
        `Creating new user in database: ${user.id} in ${interaction.guild.id}`
      );
      await serverSchema.updateOne(
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

      data = await serverData.users.find(
        (foundUser) => foundUser.userID == String(user.id)
      );
    }

    const profileImage = await createProfile(data, user, member);

    const attachment = new AttachmentBuilder(profileImage, {
      name: `${user.username}-${interaction.guild.id}-profile.png`,
    });

    if (interaction.user.id !== user.id) {
      await serverSchema.findOneAndUpdate(
        { serverID: interaction.guild.id, 'users.userID': user.id },
        {
          ['users.$.profileViews']: data.profileViews
            ? data.profileViews + 1
            : 1,
        }
      );
    }

    await interaction.reply({ files: [attachment] });
  },
};
