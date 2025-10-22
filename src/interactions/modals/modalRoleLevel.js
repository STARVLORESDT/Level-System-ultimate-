const GuildConfig = require('../../models/GuildConfig');

module.exports = async function (interaction) {
  const cid = interaction.customId;
  if (!cid.startsWith('modal_role_level|')) return interaction.reply({ content: 'Invalid modal', ephemeral: true });
  const roleId = cid.split('|')[1];
  const textLevel = parseInt(interaction.fields.getTextInputValue('textLevel'), 10);
  const voiceLevel = parseInt(interaction.fields.getTextInputValue('voiceLevel'), 10);
  if (isNaN(textLevel) || isNaN(voiceLevel)) return interaction.reply({ content: 'Invalid levels', ephemeral: true });
  const cfg = await GuildConfig.getForGuild(interaction.guildId);
  const et = (cfg.rolesByTextLevel || []).find(r => r.roleId === roleId);
  if (et) et.level = textLevel; else cfg.rolesByTextLevel = (cfg.rolesByTextLevel || []).concat({ roleId, level: textLevel });
  const ev = (cfg.rolesByVoiceLevel || []).find(r => r.roleId === roleId);
  if (ev) ev.level = voiceLevel; else cfg.rolesByVoiceLevel = (cfg.rolesByVoiceLevel || []).concat({ roleId, level: voiceLevel });
  await cfg.save();
  return interaction.reply({ content: 'Mapping saved', ephemeral: true });
};
