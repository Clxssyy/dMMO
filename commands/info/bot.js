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
      .setDescription(
        'Keep track of your activity in a MMO format with:\n\n> Skills\n> Quests\n> Events\n> Leaderboards\n\nYou can even collect unique titles and roles!\n\nType `/` to see all the commands.'
      )
      .addFields(
        {
          name: 'Developer',
          value: interaction.client.users.cache.get('168459082242457600')
            ? '<@168459082242457600>'
            : 'clxssy.',
          inline: true,
        },
        {
          name: 'Servers',
          value: String(interaction.client.guilds.cache.size),
          inline: true,
        }
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setColor(0x5662f6)
      .setFooter({
        text: 'Have a suggestion?',
      })
      .setTimestamp();

    const botInviteButton = new ButtonBuilder()
      .setStyle(5)
      .setLabel('Invite')
      .setURL(
        'https://discord.com/oauth2/authorize?client_id=1149368160206737508&permissions=8&integration_type=0&scope=bot+applications.commands'
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
