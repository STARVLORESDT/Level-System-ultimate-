const { RankCard } = require('discord-arts');
const { AttachmentBuilder } = require('discord.js');

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
  return 100 * level * level;
}

async function resolveBadgesForUser({ guildConfig, member, extraBadgeKeys = [], botOwnerId = null }) {
  const badges = [];
  try {
    if (botOwnerId && member.id === botOwnerId) {
      badges.push(DEFAULT_BADGES['owner']);
    } else if (guildConfig && guildConfig.guildOwnerBadgeUserId && member.id === guildConfig.guildOwnerBadgeUserId) {
      badges.push(DEFAULT_BADGES['owner']);
    }
  } catch (e) {}
  if (guildConfig && Array.isArray(guildConfig.badgeRoleMap)) {
    for (const mapping of guildConfig.badgeRoleMap) {
      try {
        if (member.roles && member.roles.cache && member.roles.cache.has(mapping.roleId)) {
          const custom = (Array.isArray(guildConfig.customBadges) && guildConfig.customBadges.find(b => b.key === mapping.badgeKey));
          if (custom && custom.url) badges.push(custom.url);
          else if (DEFAULT_BADGES[mapping.badgeKey]) badges.push(DEFAULT_BADGES[mapping.badgeKey]);
        }
      } catch (err) {}
    }
  }
  for (const key of extraBadgeKeys) {
    const custom = (Array.isArray(guildConfig?.customBadges) && guildConfig.customBadges.find(b => b.key === key));
    if (custom && custom.url) badges.push(custom.url);
    else if (DEFAULT_BADGES[key]) badges.push(DEFAULT_BADGES[key]);
  }
  const unique = [...new Set(badges)].slice(0, 6);
  return unique;
}

async function createRankCard({ user, member = null, totalXP = 0, guildConfig = null, extraBadges = [], botOwnerId = null, rankPosition = null }) {
  const level = getLevelFromXP(totalXP);
  const required = getRequiredXP(level);
  const bufferBadges = await resolveBadgesForUser({ guildConfig, member, extraBadgeKeys: extraBadges, botOwnerId });
  const card = new RankCard()
    .setUsername(user.username)
    .setDiscriminator(user.discriminator)
    .setAvatar(user.displayAvatarURL ? user.displayAvatarURL({ extension: 'png', size: 512 }) : user.displayAvatarURL)
    .setLevel(level)
    .setXP(totalXP)
    .setRequiredXP(required)
    .setProgressBar({ color: "#00FFC8", round: true })
    .setBadges(bufferBadges)
    .setStatus('online')
    .setTheme('dark')
    .setRank(rankPosition || null)
    .setOverlay({ color: "#000000", opacity: 0.12, blur: true });
  const buffer = await card.build();
  const attachment = new AttachmentBuilder(buffer, { name: 'rank-card.png' });
  return { attachment, meta: { level, required, badges: bufferBadges } };
}

module.exports = { createRankCard, getLevelFromXP, getRequiredXP, DEFAULT_BADGES };
