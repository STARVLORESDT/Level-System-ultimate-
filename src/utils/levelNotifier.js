const GuildConfig = require('../models/GuildConfig');

async function giveLevelUpMessage({ client, guildId, userId, level, type = 'text' }) {
  const cfg = await GuildConfig.getForGuild(guildId);
  if (!cfg.levelChannel) return;
  const ch = await client.channels.fetch(cfg.levelChannel).catch(() => null);
  if (!ch) return;
  const userMention = `<@${userId}>`;
  const msg = cfg.levelMessageTemplate.replace('[user]', userMention).replace('[level]', `${level}`).replace('[type]', type);
  await ch.send({ content: msg }).catch(() => {});
}

module.exports = { giveLevelUpMessage };
