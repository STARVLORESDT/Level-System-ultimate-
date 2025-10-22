const GuildConfig = require('../../models/GuildConfig');

module.exports = async function (interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'panel_badge_select') return;
  const badgeKey = interaction.values[0];
  const cfg = await GuildConfig.getForGuild(interaction.guildId);
  const badge = (cfg.customBadges || []).find(b => b.key === badgeKey);
  const embed = {
    title: `Badge ${badgeKey}`,
    description: badge ? `URL: ${badge.url}` : 'No details available',
    color: 0x2b2d31
  };
  return interaction.reply({ embeds: [embed], ephemeral: true });
};
