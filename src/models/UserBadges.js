const mongoose = require('mongoose');

const userBadgesSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  badges: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('UserBadges', userBadgesSchema);
