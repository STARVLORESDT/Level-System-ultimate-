const modalRoleLevel = require('./modalRoleLevel');
const modalSetLevelMessage = require('./modalSetLevelMessage');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isModalSubmit()) return;
  const cid = interaction.customId;
  if (cid.startsWith('modal_role_level|')) return modalRoleLevel(interaction);
  if (cid === 'modal_set_level_message') return modalSetLevelMessage(interaction);
  return interaction.reply({ content: 'Unknown modal', ephemeral: true });
};
