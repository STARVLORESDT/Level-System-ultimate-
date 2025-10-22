const badgesButtons = require('./badgesButtons');
const rankButtons = require('./rankButtons');
const profileButtons = require('./profileButtons');
const panelButtons = require('./panelButtons');
const adminBadgeButtons = require('./adminBadgeButtons');
const adminLevelButtons = require('./adminLevelButtons');
const adminMessageButtons = require('./adminMessageButtons');
const adminViewRoles = require('./adminViewRoles');
const adminSendTest = require('./adminSendTest');
const adminResetDaily = require('./adminResetDaily');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  const id = interaction.customId || '';
  if (id.startsWith('give_') || id.startsWith('remove_') || id.startsWith('info_') || id.startsWith('list_')) return badgesButtons({ client, interaction });
  if (id.startsWith('rank_') || id.startsWith('rank|')) return rankButtons({ client, interaction });
  if (id.startsWith('profile_')) return profileButtons({ client, interaction });
  if (id === 'panel_setup') return panelButtons({ client, interaction });
  if (id === 'admin_badge_panel') return adminBadgeButtons({ client, interaction });
  if (id === 'admin_edit_levels') return adminLevelButtons({ client, interaction });
  if (id === 'admin_set_message') return adminMessageButtons({ client, interaction });
  if (id === 'admin_view_roles') return adminViewRoles({ client, interaction });
  if (id === 'admin_send_test') return adminSendTest({ client, interaction });
  if (id === 'admin_reset_daily') return adminResetDaily({ client, interaction });
  return interaction.reply({ content: 'Unknown button action', ephemeral: true });
};
