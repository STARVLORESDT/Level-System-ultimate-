const UserXP = require('../models/UserXP');
const GuildConfig = require('../models/GuildConfig');
const { giveLevelUpMessage } = require('./levelNotifier');

const MESSAGE_COOLDOWN = 10 * 1000;
const lastMessageTimestamps = new Map();

async function handleMessage({ client, message }) {
  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  const last = lastMessageTimestamps.get(key) || 0;
  if (now - last < MESSAGE_COOLDOWN) return;
  lastMessageTimestamps.set(key, now);
  const xp = Math.floor(Math.random() * 11) + 5;
  const doc = await UserXP.addTextXP(message.guild.id, message.author.id, xp);
  const total = (doc.textXP || 0);
  const level = Math.floor(Math.sqrt(total / 100)) + 1;
  const required = 100 * level * level;
  if (doc.textXP >= required) {
    await UserXP.setTextXP(message.guild.id, message.author.id, required);
    await giveLevelUpMessage({ client, guildId: message.guild.id, userId: message.author.id, level, type: 'text' });
  }
}

async function handleVoiceJoin({ client, state }) {
  const key = `${state.guild.id}:${state.id}`;
  client.voiceSessions.set(key, { joinedAt: Date.now(), channelId: state.channelId });
}

async function handleVoiceLeave({ client, state }) {
  const key = `${state.guild.id}:${state.id}`;
  const session = client.voiceSessions.get(key);
  if (!session) return;
  const durationMs = Date.now() - session.joinedAt;
  const minutes = Math.floor(durationMs / 60000);
  client.voiceSessions.delete(key);
  if (minutes <= 0) return;
  const xpPerMinute = 2;
  const xp = minutes * xpPerMinute;
  const doc = await UserXP.addVoiceXP(state.guild.id, state.id, xp);
  const total = (doc.voiceXP || 0);
  const level = Math.floor(Math.sqrt(total / 100)) + 1;
  const required = 100 * level * level;
  if (doc.voiceXP >= required) {
    await UserXP.setVoiceXP(state.guild.id, state.id, required);
    await giveLevelUpMessage({ client, guildId: state.guild.id, userId: state.id, level, type: 'voice' });
  }
}

module.exports = { handleMessage, handleVoiceJoin, handleVoiceLeave };
