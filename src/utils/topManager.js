const UserXP = require('../models/UserXP');

async function resetDailyTops() {
  const users = await UserXP.find();
  for (const user of users) {
    user.dailyTextXP = 0;
    user.dailyVoiceXP = 0;
    await user.save();
  }
}

async function getTop(guildId, type, daily = false, limit = 5) {
  const field = daily
    ? type === 'voice'
      ? 'dailyVoiceXP'
      : 'dailyTextXP'
    : type === 'voice'
    ? 'voiceXP'
    : 'textXP';
  return await UserXP.find({ guildId }).sort({ [field]: -1 }).limit(limit);
}

module.exports = { resetDailyTops, getTop };
