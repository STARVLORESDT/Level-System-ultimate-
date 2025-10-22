const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = async function (interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'roles_page_1' && interaction.customId !== 'roles_page_2') return;
  const roleId = interaction.values[0];
  const modal = new ModalBuilder().setCustomId(`modal_role_level|${roleId}`).setTitle('Set Level Mapping');
  const tInput = new TextInputBuilder().setCustomId('textLevel').setLabel('Text Level').setStyle(TextInputStyle.Short).setRequired(true);
  const vInput = new TextInputBuilder().setCustomId('voiceLevel').setLabel('Voice Level').setStyle(TextInputStyle.Short).setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(tInput), new ActionRowBuilder().addComponents(vInput));
  return interaction.showModal(modal);
};
