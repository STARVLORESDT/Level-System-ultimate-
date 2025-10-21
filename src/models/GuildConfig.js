const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuildConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: process.env.DEFAULT_PREFIX || '!' },
  levelChannel: { type: String, default: null },
  levelMessageTemplate: { type: String, default: 'Congratulations [user]\\nYou reached new Level [level]' },
  rolesByTextLevel: [{ level: Number, roleId: String }],
  rolesByVoiceLevel: [{ level: Number, roleId: String }],
  badgeRoleMap: [{ roleId: String, badgeKey: String }],
  customBadges: [{ key: String, url: String }],
  guildOwnerBadgeUserId: { type: String, default: null }
}, { timestamps: true });

GuildConfigSchema.statics.getForGuild = async function (guildId) {
  let cfg = await this.findOne({ guildId });
  if (!cfg) {
    cfg = await this.create({ guildId });
  }
  return cfg;
};

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);
