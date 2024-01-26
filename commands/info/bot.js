const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot')
    .setDescription('Displays information about the bot.'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('dMMO')
      .setColor(0x5662f6)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription('Keep track of user interactions in a MMO format.')
      .addFields(
        { name: 'Creator', value: 'clxssy.' },
        {
          name: 'Skills',
          value: 'Messaging\nReacting\nDiscussing\nHosting\nEditing\nCleaning',
        },
        {
          name: 'Commands',
          value: 'Type `/` to see all commands.',
        }
      );

    const botInviteButton = new ButtonBuilder()
      .setStyle(5)
      .setLabel('Invite')
      .setURL(
        'https://discord.com/api/oauth2/authorize?client_id=1046864165387649024&permissions=8&scope=bot%20applications.commands'
      );

    const botDiscordButton = new ButtonBuilder()
      .setStyle(5)
      .setLabel('Discord')
      .setURL('https://discord.gg/ATUud59GrU');

    const botGitHubButton = new ButtonBuilder()
      .setStyle(5)
      .setLabel('GitHub')
      .setURL('https://github.com/Clxssyy/dMMO');

    const actionRow = new ActionRowBuilder().addComponents(
      botInviteButton,
      botDiscordButton,
      botGitHubButton
    );

    await interaction.reply({ components: [actionRow], embeds: [embed] });
  },
};
