const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserXPSchema = new Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  xpText: { type: Number, default: 0 },
  xpVoice: { type: Number, default: 0 },
  dailyText: { type: Number, default: 0 },
  dailyVoice: { type: Number, default: 0 }
}, { timestamps: true });

UserXPSchema.index({ guildId: 1, userId: 1 }, { unique: true });

UserXPSchema.statics.addTextXP = async function (guildId, userId, amount) {
  const upd = await this.findOneAndUpdate({ guildId, userId }, { $inc: { xpText: amount, dailyText: amount } }, { upsert: true, new: true });
  return upd;
};
UserXPSchema.statics.addVoiceXP = async function (guildId, userId, amount) {
  const upd = await this.findOneAndUpdate({ guildId, userId }, { $inc: { xpVoice: amount, dailyVoice: amount } }, { upsert: true, new: true });
  return upd;
};

module.exports = mongoose.model('UserXP', UserXPSchema);
