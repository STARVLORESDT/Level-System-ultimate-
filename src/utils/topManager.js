const UserXP = require('../models/UserXP');

async function getTop(guildId, limit = 5) {
  const all = await UserXP.find({ guildId }).lean();
  all.sort((a,b) => (b.xpText + b.xpVoice) - (a.xpText + a.xpVoice));
  return all.slice(0, limit);
}

async function getTopDaily(guildId, limit = 5) {
  const all = await UserXP.find({ guildId }).lean();
  all.sort((a,b) => (b.dailyText + b.dailyVoice) - (a.dailyText + a.dailyVoice));
  return all.slice(0, limit);
}

async function resetDailyTops() {
  await UserXP.updateMany({}, { $set: { dailyText: 0, dailyVoice: 0 } });
}

module.exports = { getTop, getTopDaily, resetDailyTops };
