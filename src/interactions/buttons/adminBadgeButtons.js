const GuildConfig = require('../../models/GuildConfig');
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'admin_badge_panel') return;
  const cfg = await GuildConfig.getForGuild(interaction.guildId);
  const badges = cfg.customBadges || [];
  const options = badges.length ? badges.map(b => ({ label: b.key, value: b.key, description: b.url })) : [{ label: 'No badges', value: 'none' }];
  const menu = new StringSelectMenuBuilder().setCustomId('panel_badge_select').setPlaceholder('Select badge').addOptions(options);
  const add = new ButtonBuilder().setCustomId('badge_add_new').setLabel('Add New Badge').setStyle(ButtonStyle.Success);
  const remove = new ButtonBuilder().setCustomId('badge_remove').setLabel('Remove Badge').setStyle(ButtonStyle.Danger);
  const row1 = new ActionRowBuilder().addComponents(menu);
  const row2 = new ActionRowBuilder().addComponents(add, remove);
  return interaction.reply({ content: 'Manage badges', components: [row1, row2], ephemeral: true });
};
