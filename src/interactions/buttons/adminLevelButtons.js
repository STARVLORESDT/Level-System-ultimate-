const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'admin_edit_levels') return;
  const roles = Array.from(interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id).values()).slice(0, 50);
  const opts1 = roles.slice(0, 25).map(r => ({ label: r.name, value: r.id }));
  const opts2 = roles.slice(25, 50).map(r => ({ label: r.name, value: r.id }));
  const menu1 = new StringSelectMenuBuilder().setCustomId('roles_page_1').setPlaceholder('Select role (page 1)').addOptions(opts1);
  const components = [new ActionRowBuilder().addComponents(menu1)];
  if (opts2.length) components.push(new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('roles_page_2').setPlaceholder('Select role (page 2)').addOptions(opts2)));
  const back = new ButtonBuilder().setCustomId('panel_setup').setLabel('Back').setStyle(ButtonStyle.Secondary);
  components.push(new ActionRowBuilder().addComponents(back));
  return interaction.reply({ content: 'Select a role to map levels', components, ephemeral: true });
};
