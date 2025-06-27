const { SlashCommandBuilder } = require('@discordjs/builders');

const autoresponders = new Map(); // Stores autoresponder triggers and responses

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoresponder')
    .setDescription('Manages custom autoresponder messages.')
    .addSubcommand(subcommand =>
      subcommand
      .setName('set')
      .setDescription('Sets an autoresponder.')
      .addStringOption(option =>
        option.setName('trigger')
        .setDescription('The word or phrase that triggers the autoresponder.')
        .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('response')
        .setDescription('The message the bot will send in response.')
        .setRequired(true)
      )
    )
    .addSubcommand(subcommand =>
      subcommand
      .setName('view')
      .setDescription('Views all active autoresponders.')
    )
    .addSubcommand(subcommand =>
      subcommand
      .setName('clear')
      .setDescription('Clears a specific autoresponder or all.')
      .addStringOption(option =>
        option.setName('trigger')
        .setDescription('The trigger of the autoresponder to clear (leave empty to clear all).')
        .setRequired(false)
      )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const trigger = interaction.options.getString('trigger').toLowerCase();
      const response = interaction.options.getString('response');
      autoresponders.set(trigger, response);
      await interaction.reply(`Autoresponder set: When someone says "${trigger}", I will respond with "${response}".`);
    } else if (subcommand === 'view') {
      if (autoresponders.size === 0) {
        await interaction.reply('No autoresponders currently set.');
        return;
      }
      let response = 'Current Autoresponders:\n';
      for (const [trigger, res] of autoresponders) {
        response += `\n**Trigger:** ${trigger}\n**Response:** ${res}\n`;
      }
      await interaction.reply(response);
    } else if (subcommand === 'clear') {
      const trigger = interaction.options.getString('trigger');
      if (trigger) {
        if (autoresponders.delete(trigger.toLowerCase())) {
          await interaction.reply(`Autoresponder for "${trigger}" cleared.`);
        } else {
          await interaction.reply(`No autoresponder found for "${trigger}".`);
        }
      } else {
        autoresponders.clear();
        await interaction.reply('All autoresponders cleared.');
      }
    }
  },
  // Function to handle messages and check for autoresponder triggers
  async handleMessage(message) {
    if (message.author.bot) return;

    for (const [trigger, response] of autoresponders) {
      if (message.content.toLowerCase().includes(trigger)) {
        await message.reply(response);
        break;
      }
    }
  },
};