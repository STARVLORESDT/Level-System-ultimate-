const { createRankCard } = require('../../utils/artsUtils');
const { AttachmentBuilder } = require('discord.js');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'admin_send_test') return;
  const buffer = await createRankCard({ user: interaction.user, member: interaction.member, totalXP: 1400, guildId: interaction.guildId, rankPosition: 2 });
  const att = new AttachmentBuilder(buffer, { name: 'test-rank.png' });
  return interaction.reply({ files: [att], ephemeral: true });
};
