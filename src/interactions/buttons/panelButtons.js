const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'panel_setup') return;
  if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
  const cfg = await GuildConfig.getForGuild(interaction.guildId);
  const e = new EmbedBuilder().setTitle('Level System Panel').setDescription('Use the buttons below to manage the system.').setColor(0x5865F2);
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('admin_edit_levels').setLabel('Edit Level Roles').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('admin_set_message').setLabel('Set Level Message').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('admin_view_roles').setLabel('View Roles').setStyle(ButtonStyle.Success)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('admin_send_test').setLabel('Send Test').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('admin_reset_daily').setLabel('Reset Daily Tops').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('admin_badge_panel').setLabel('Manage Badges').setStyle(ButtonStyle.Primary)
  );
  return interaction.reply({ embeds: [e], components: [row1, row2], ephemeral: true });
};
