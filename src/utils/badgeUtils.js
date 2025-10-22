const UserXP = require('../models/UserXP');

async function giveBadge(guildId, userId, badgeKeyOrUrl) {
  const doc = await UserXP.addBadge(guildId, userId, badgeKeyOrUrl);
  return doc;
}

async function removeBadge(guildId, userId, badgeKeyOrUrl) {
  const doc = await UserXP.removeBadge(guildId, userId, badgeKeyOrUrl);
  return doc;
}

async function hasBadge(guildId, userId, badgeKeyOrUrl) {
  const doc = await UserXP.findOne({ guildId, userId });
  if (!doc) return false;
  return (doc.badges || []).includes(badgeKeyOrUrl);
}

module.exports = { giveBadge, removeBadge, hasBadge };
