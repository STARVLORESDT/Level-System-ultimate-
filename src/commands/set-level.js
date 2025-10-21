const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getRequiredXP } = require('../utils/artsUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-level')
    .setDescription('Set a user level')
    .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('text or voice').setRequired(true))
    .addIntegerOption(o => o.setName('level').setDescription('level (1-100)').setRequired(true)),
  prefix: { name: 'set-level' },
  async execute({ client, interaction }) {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');
    const level = interaction.options.getInteger('level');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`confirm_set_level|${interaction.guildId}|${user.id}|${type}|${level}`).setLabel('Confirm').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`cancel_set_level|${interaction.guildId}|${user.id}|${type}|${level}`).setLabel('Cancel').setStyle(ButtonStyle.Danger)
    );
    await interaction.reply({ content: `Confirm set ${type} level of ${user.tag} to ${level}?`, components: [row], ephemeral: true });
  },
  async executePrefix({ client, message, args }) {
    const target = message.mentions.users.first();
    const type = args[1];
    const level = parseInt(args[2], 10);
    if (!target || !type || isNaN(level)) return message.reply('Usage: !set-level @user text|voice <level>');
    const row = [
      {
        type: 1,
        components: [
          { type: 2, style: 3, custom_id: `confirm_set_level|${message.guild.id}|${target.id}|${type}|${level}`, label: 'Confirm' },
          { type: 2, style: 4, custom_id: `cancel_set_level|${message.guild.id}|${target.id}|${type}|${level}`, label: 'Cancel' }
        ]
      }
    ];
    await message.reply({ content: `Confirm set ${type} level of ${target.tag} to ${level}?`, components: row });
  }
};
