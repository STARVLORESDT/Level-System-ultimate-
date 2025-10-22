const GuildConfig = require('../../models/GuildConfig');
const { EmbedBuilder } = require('discord.js');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'admin_view_roles') return;
  const cfg = await GuildConfig.getForGuild(interaction.guildId);
  const textRoles = (cfg.rolesByTextLevel || []).map(r => `<@&${r.roleId}> → Lvl ${r.level}`).join('\n') || 'No text roles set';
  const voiceRoles = (cfg.rolesByVoiceLevel || []).map(r => `<@&${r.roleId}> → Lvl ${r.level}`).join('\n') || 'No voice roles set';
  const e = new EmbedBuilder().setTitle('Role Configuration').addFields({ name: 'Text Roles', value: textRoles }, { name: 'Voice Roles', value: voiceRoles }).setColor(0x2b2d31);
  return interaction.reply({ embeds: [e], ephemeral: true });
};
