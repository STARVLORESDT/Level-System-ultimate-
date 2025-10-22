const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
  levelChannel: { type: String, default: null },
  levelMessageTemplate: { type: String, default: '🎉 [user] reached level [level] in [type]!' },
  rolesByTextLevel: [{ roleId: String, level: Number }],
  rolesByVoiceLevel: [{ roleId: String, level: Number }],
  badgeRoleMap: [{ roleId: String, badgeKey: String }],
  customBadges: [{ key: String, url: String }]
}, { timestamps: true });

guildConfigSchema.statics.getForGuild = async function (guildId) {
  let cfg = await this.findOne({ guildId });
  if (!cfg) cfg = await this.create({ guildId });
  return cfg;
};

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
