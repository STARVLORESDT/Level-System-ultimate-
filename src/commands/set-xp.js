const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-xp')
    .setDescription('Set XP for a user')
    .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('text or voice').setRequired(true))
    .addIntegerOption(o => o.setName('xp').setDescription('XP amount').setRequired(true)),
  prefix: { name: 'set-xp' },
  async execute({ client, interaction }) {
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
