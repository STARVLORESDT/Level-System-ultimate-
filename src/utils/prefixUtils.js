const GuildConfig = require('../models/GuildConfig');

async function setPrefix(guildId, prefix) {
  const cfg = await GuildConfig.getForGuild(guildId);
  cfg.prefix = prefix;
  await cfg.save();
  return cfg;
}

async function getPrefix(guildId) {
  const cfg = await GuildConfig.getForGuild(guildId);
  return cfg.prefix || '!';
}

module.exports = { setPrefix, getPrefix };
