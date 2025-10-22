const { resetDailyTops } = require('../../utils/topManager');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'admin_reset_daily') return;
  if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
  await resetDailyTops();
  return interaction.reply({ content: 'Daily tops reset', ephemeral: true });
};
