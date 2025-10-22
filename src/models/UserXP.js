const mongoose = require('mongoose');

const userXPSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  textXP: { type: Number, default: 0 },
  voiceXP: { type: Number, default: 0 },
  textLevel: { type: Number, default: 1 },
  voiceLevel: { type: Number, default: 1 },
  dailyTextXP: { type: Number, default: 0 },
  dailyVoiceXP: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  badges: { type: [String], default: [] }
}, { timestamps: true });

userXPSchema.index({ guildId: 1, userId: 1 }, { unique: true });

userXPSchema.statics.addTextXP = async function (guildId, userId, amount) {
  const upd = await this.findOneAndUpdate({ guildId, userId }, {
    $inc: { textXP: amount, dailyTextXP: amount },
    $set: { totalXP: { $add: ['$textXP', '$voiceXP'] } }
  }, { upsert: true, new: true });
  let doc = await this.findOne({ guildId, userId });
  doc.totalXP = (doc.textXP || 0) + (doc.voiceXP || 0);
  await doc.save();
  return doc;
};

userXPSchema.statics.addVoiceXP = async function (guildId, userId, amount) {
  const upd = await this.findOneAndUpdate({ guildId, userId }, {
    $inc: { voiceXP: amount, dailyVoiceXP: amount },
    $set: { totalXP: { $add: ['$textXP', '$voiceXP'] } }
  }, { upsert: true, new: true });
  let doc = await this.findOne({ guildId, userId });
  doc.totalXP = (doc.textXP || 0) + (doc.voiceXP || 0);
  await doc.save();
  return doc;
};

userXPSchema.statics.setTextXP = async function (guildId, userId, value) {
  const doc = await this.findOneAndUpdate({ guildId, userId }, { $set: { textXP: value } }, { upsert: true, new: true });
  doc.totalXP = (doc.textXP || 0) + (doc.voiceXP || 0);
  await doc.save();
  return doc;
};

userXPSchema.statics.setVoiceXP = async function (guildId, userId, value) {
  const doc = await this.findOneAndUpdate({ guildId, userId }, { $set: { voiceXP: value } }, { upsert: true, new: true });
  doc.totalXP = (doc.textXP || 0) + (doc.voiceXP || 0);
  await doc.save();
  return doc;
};

userXPSchema.statics.addBadge = async function (guildId, userId, badgeKeyOrUrl) {
  const doc = await this.findOneAndUpdate({ guildId, userId }, { $addToSet: { badges: badgeKeyOrUrl } }, { upsert: true, new: true });
  return doc;
};

userXPSchema.statics.removeBadge = async function (guildId, userId, badgeKeyOrUrl) {
  const doc = await this.findOneAndUpdate({ guildId, userId }, { $pull: { badges: badgeKeyOrUrl } }, { new: true });
  return doc;
};

userXPSchema.statics.getRank = async function (guildId, userId) {
  const all = await this.find({ guildId }).lean();
  all.sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0));
  const pos = all.findIndex(u => u.userId === userId);
  return pos >= 0 ? pos + 1 : null;
};

module.exports = mongoose.model('UserXP', userXPSchema);
