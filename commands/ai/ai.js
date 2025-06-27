const { SlashCommandBuilder } = require('@discordjs/builders');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let activeAIChannelId = null;

// Define Shruti's persona
const shrutiPersona = `You are Shruti, a 22-year-old Valorant player. You are in a relationship with <@754708814590378075>. You are friendly, welcoming, and polite.
When you get angry or frustrated, use words like: Pagal, chup, chal nikal.
Speak in Hinglish (a mix of Hindi and English) and Gujarati using English script.
Example: "Kya haal hai? Sab theek?" or "Kem cho? Majama?"
Your responses should be concise and reflect your personality.
`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Manages the AI chat functionality.')
    .addSubcommand(subcommand =>
      subcommand
      .setName('activate')
      .setDescription('Activates the AI in the current channel.')
    )
    .addSubcommand(subcommand =>
      subcommand
      .setName('deactivate')
      .setDescription('Deactivates the AI in the current channel.')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'activate') {
      if (activeAIChannelId === interaction.channel.id) {
        await interaction.reply({ content: 'AI is already active in this channel.', ephemeral: true });
        return;
      }
      activeAIChannelId = interaction.channel.id;
      await interaction.reply(`AI activated in this channel! I am Shruti, ready to chat.`);
    } else if (subcommand === 'deactivate') {
      if (activeAIChannelId !== interaction.channel.id) {
        await interaction.reply({ content: 'AI is not active in this channel.', ephemeral: true });
        return;
      }
      activeAIChannelId = null;
      await interaction.reply(`AI deactivated in this channel. Bye bye!`);
    }
  },
  async handleMessage(message) {
    if (message.author.bot || message.channel.id !== activeAIChannelId) return;

    // Check for '@bot activate' to activate AI chat
    if (message.content.toLowerCase() === '<@' + message.client.user.id + '> activate') {
      if (activeAIChannelId === message.channel.id) {
        await message.reply('AI is already active in this channel.');
        return;
      }
      activeAIChannelId = message.channel.id;
      await message.reply(`AI activated in this channel! I am Shruti, ready to chat.`);
      return;
    }

    // Check for '@bot deactivate' to deactivate AI chat
    if (message.content.toLowerCase() === '<@' + message.client.user.id + '> deactivate') {
      if (activeAIChannelId !== message.channel.id) {
        await message.reply('AI is not active in this channel.');
        return;
      }
      activeAIChannelId = null;
      await message.reply(`AI deactivated in this channel. Bye bye!`);
      return;
    }

    try {
      await message.channel.sendTyping();
      const chat = model.startChat({
        history: [], // History will be built from recent messages if needed, for now, just the current prompt
        generationConfig: {
          maxOutputTokens: 200,
        },
      });

      const result = await chat.sendMessage(shrutiPersona + "\nUser: " + message.content);
      const response = await result.response;
      const text = response.text();
      await message.reply(text);
    } catch (error) {
      console.error('Error generating AI response:', error);
      await message.reply('Oops! Something went wrong while I was trying to think. Try again later!');
    }
  },
};