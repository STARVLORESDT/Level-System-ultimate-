const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserXP = require('../models/UserXP');
const { getRequiredXP } = require('../utils/artsUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-level')
    .setDescription('تحديد لفل لمستخدم (text|voice)')
    .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('text or voice').setRequired(true))
    .addIntegerOption(o => o.setName('level').setDescription('level (1-100)').setRequired(true)),
  prefix: { name: 'set-level' },
  cooldown: 5,
  async execute({ client, interaction }) {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');
    const level = interaction.options.getInteger('level');
    const confirm = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`confirm_set_level|${interaction.guildId}|${user.id}|${type}|${level}`).setLabel('Confirm').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`cancel_set_level|${interaction.guildId}|${user.id}|${type}|${level}`).setLabel('Cancel').setStyle(ButtonStyle.Danger)
    );
    await interaction.reply({ content: `Confirm set ${type} level of ${user.tag} to ${level}?`, components: [confirm], ephemeral: true });
  },
  async executePrefix({ client, message, args }) {
    if (message.author.id !== process.env.OWNER_ID) return message.reply('Unauthorized');
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
