const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notify')
    .setDescription('Sends a social media post notification.')
    .addStringOption(option =>
      option.setName('platform')
      .setDescription('The social media platform (e.g., YouTube, Instagram, TikTok)')
      .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('link')
      .setDescription('The link to the post/video/story')
      .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
      .setDescription('Your personalized message for the notification')
      .setRequired(true)
    )
    .addMentionableOption(option =>
      option.setName('ping')
      .setDescription('Optional: Mention a user or role')
      .setRequired(false)
    ),
  async execute(interaction) {
    const platform = interaction.options.getString('platform');
    const link = interaction.options.getString('link');
    const message = interaction.options.getString('message');
    const ping = interaction.options.getMentionable('ping');

    let notificationMessage = `**New ${platform} Post!**\n`;
    if (ping) {
      notificationMessage += `${ping} `; // Add ping if provided
    }
    notificationMessage += `${message}\n${link}`;

    await interaction.reply({
      content: notificationMessage,
      allowedMentions: { parse: ['users', 'roles'] }
    });
  },
};