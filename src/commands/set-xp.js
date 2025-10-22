const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserXP = require('../models/UserXP');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-xp')
    .setDescription('تعيين XP لمستخدم')
    .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('text or voice').setRequired(true))
    .addIntegerOption(o => o.setName('xp').setDescription('XP amount').setRequired(true)),
  prefix: { name: 'set-xp' },
  cooldown: 5,
  async execute({ client, interaction }) {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');
    const xp = interaction.options.getInteger('xp');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`confirm_set_xp|${interaction.guildId}|${user.id}|${type}|${xp}`).setLabel('Confirm').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`cancel_set_xp|${interaction.guildId}|${user.id}|${type}|${xp}`).setLabel('Cancel').setStyle(ButtonStyle.Danger)
    );
    await interaction.reply({ content: `Confirm set ${type} XP of ${user.tag} to ${xp}?`, components: [row], ephemeral: true });
  },
  async executePrefix({ client, message, args }) {
    if (message.author.id !== process.env.OWNER_ID) return message.reply('Unauthorized');
    const target = message.mentions.users.first();
    const type = args[1];
    const xp = parseInt(args[2], 10);
    if (!target || !type || isNaN(xp)) return message.reply('Usage: !set-xp @user text|voice <xp>');
    const row = [
      {
        type: 1,
        components: [
          { type: 2, style: 3, custom_id: `confirm_set_xp|${message.guild.id}|${target.id}|${type}|${xp}`, label: 'Confirm' },
          { type: 2, style: 4, custom_id: `cancel_set_xp|${message.guild.id}|${target.id}|${type}|${xp}`, label: 'Cancel' }
        ]
      }
    ];
    await message.reply({ content: `Confirm set ${type} XP of ${target.tag} to ${xp}?`, components: row });
  }
};
