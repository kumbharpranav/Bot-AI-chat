const { SlashCommandBuilder } = require('@discordjs/builders');

// This could be stored in a database for persistence
const relationships = new Map(); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('relationship')
    .setDescription('Manages Shruti's relationships with members.')
    .addSubcommand(subcommand =>
      subcommand
      .setName('set')
      .setDescription('Sets Shruti's relationship with a member.')
      .addUserOption(option =>
        option.setName('member')
        .setDescription('The member to set the relationship with.')
        .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('type')
        .setDescription('The type of relationship (e.g., friend, rival, family, partner).')
        .setRequired(true)
      )
    )
    .addSubcommand(subcommand =>
      subcommand
      .setName('view')
      .setDescription('Views Shruti's relationship with a member or all relationships.')
      .addUserOption(option =>
        option.setName('member')
        .setDescription('The member to view the relationship with (leave empty to view all).')
        .setRequired(false)
      )
    )
    .addSubcommand(subcommand =>
      subcommand
      .setName('clear')
      .setDescription('Clears Shruti's relationship with a member.')
      .addUserOption(option =>
        option.setName('member')
        .setDescription('The member to clear the relationship with.')
        .setRequired(true)
      )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const member = interaction.options.getUser('member');
      const type = interaction.options.getString('type');
      relationships.set(member.id, type);
      await interaction.reply(`Shruti's relationship with ${member.username} has been set to: ${type}.`);
    } else if (subcommand === 'view') {
      const member = interaction.options.getUser('member');
      if (member) {
        const type = relationships.get(member.id);
        if (type) {
          await interaction.reply(`Shruti's relationship with ${member.username} is: ${type}.`);
        } else {
          await interaction.reply(`Shruti has no defined relationship with ${member.username}.`);
        }
      } else {
        if (relationships.size === 0) {
          await interaction.reply('Shruti has no defined relationships with anyone yet.');
          return;
        }
        let response = 'Shruti's Relationships:\n';
        for (const [memberId, type] of relationships) {
          const user = await interaction.client.users.fetch(memberId);
          response += `\n**${user.username}:** ${type}\n`;
        }
        await interaction.reply(response);
      }
    } else if (subcommand === 'clear') {
      const member = interaction.options.getUser('member');
      if (relationships.delete(member.id)) {
        await interaction.reply(`Shruti's relationship with ${member.username} has been cleared.`);
      } else {
        await interaction.reply(`Shruti had no defined relationship with ${member.username}.`);
      }
    }
  },
};