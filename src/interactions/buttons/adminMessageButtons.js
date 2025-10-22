const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'admin_set_message') return;
  const modal = new ModalBuilder().setCustomId('modal_set_level_message').setTitle('Set Level Message');
  const input = new TextInputBuilder().setCustomId('levelMessage').setLabel('Template').setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder('🎉 [user] reached level [level] in [type]!');
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return interaction.showModal(modal);
};
