const rolesMenu = require('./rolesMenu');
const badgeMenu = require('./badgeMenu');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId === 'roles_page_1' || interaction.customId === 'roles_page_2') return rolesMenu(interaction);
  if (interaction.customId === 'panel_badge_select') return badgeMenu(interaction);
  return interaction.reply({ content: 'Unknown menu', ephemeral: true });
};
