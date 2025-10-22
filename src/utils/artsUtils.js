const { RankCard } = require('discord-arts');
const { AttachmentBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

const DEFAULT_BADGES = {
  'bug-hunter': 'https://i.postimg.cc/3xGGwRDH/1305893530492862616.png',
  'vip': 'https://i.postimg.cc/GmDDp2T7/1389990857209413707.png',
  'owner': 'https://i.postimg.cc/13FFztN9/1400551945902493826.png',
  'staff': 'https://i.postimg.cc/BnFFv6Py/1426554933502804049.png',
  'partner': 'https://i.postimg.cc/htw1v6jS/47-20251021134341.png',
  'premium': 'https://i.postimg.cc/x1btvnBq/1332343919283015905.png'
};

function getLevelFromXP(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getRequiredXP(level) {
  if (level <= 1) return 100;
  return 100 * level * level;
}

async function resolveBadges({ guildConfig, member, extra = [], botOwnerId = null }) {
  const badges = [];
  try {
    if (botOwnerId && member && member.id === botOwnerId) badges.push(DEFAULT_BADGES['owner']);
  } catch (e) {}
  if (guildConfig && Array.isArray(guildConfig.badgeRoleMap) && member) {
    for (const m of guildConfig.badgeRoleMap) {
      try {
        if (member.roles && member.roles.cache && member.roles.cache.has(m.roleId)) {
          const custom = Array.isArray(guildConfig.customBadges) && guildConfig.customBadges.find(b => b.key === m.badgeKey);
          if (custom && custom.url) badges.push(custom.url);
          else if (DEFAULT_BADGES[m.badgeKey]) badges.push(DEFAULT_BADGES[m.badgeKey]);
        }
      } catch (e) {}
    }
  }
  for (const k of extra) {
    const custom = Array.isArray(guildConfig?.customBadges) && guildConfig.customBadges.find(b => b.key === k);
    if (custom && custom.url) badges.push(custom.url);
    else if (DEFAULT_BADGES[k]) badges.push(DEFAULT_BADGES[k]);
  }
  return [...new Set(badges)].slice(0, 6);
}

async function createRankCard({ user, member = null, totalXP = 0, guildId = null, extraBadges = [], botOwnerId = null, rankPosition = null }) {
  const level = getLevelFromXP(totalXP);
  const required = getRequiredXP(level);
  const guildConfig = guildId ? await GuildConfig.getForGuild(guildId) : null;
  const badges = await resolveBadges({ guildConfig, member, extra: extraBadges, botOwnerId });
  const card = new RankCard()
    .setUsername(user.username)
    .setDiscriminator(user.discriminator)
    .setAvatar(user.displayAvatarURL ? user.displayAvatarURL({ extension: 'png', size: 512 }) : user.displayAvatarURL)
    .setLevel(level)
    .setXP(totalXP)
    .setRequiredXP(required)
    .setProgressBar({ color: '#00FFC8', round: true })
    .setBadges(badges)
    .setStatus('online')
    .setTheme('dark')
    .setRank(rankPosition || null)
    .setOverlay({ color: '#000000', opacity: 0.12, blur: true });

  const buffer = await card.build();
  return buffer;
}

module.exports = { createRankCard, getLevelFromXP, getRequiredXP, DEFAULT_BADGES };
