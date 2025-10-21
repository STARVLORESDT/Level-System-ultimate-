const UserXP = require('../models/UserXP');
const PREFIX_MESSAGE_COOLDOWN = 10 * 1000;
const lastMessageTimestamps = new Map();

async function handleMessage({ client, message }) {
  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  const last = lastMessageTimestamps.get(key) || 0;
  if (now - last < PREFIX_MESSAGE_COOLDOWN) return;
  lastMessageTimestamps.set(key, now);
  const xp = 10;
  await UserXP.addTextXP(message.guild.id, message.author.id, xp);
}

async function handleVoiceJoin({ client, state }) {
  const key = `${state.guild.id}:${state.id}`;
  client.voiceSessions.set(key, { channelId: state.channelId, joinedAt: Date.now() });
}

async function handleVoiceLeave({ client, state }) {
  const key = `${state.guild.id}:${state.id}`;
  const session = client.voiceSessions.get(key);
  if (!session) return;
  const durationMs = Date.now() - session.joinedAt;
  const minutes = Math.floor(durationMs / 60000);
  if (minutes <= 0) {
    client.voiceSessions.delete(key);
    return;
  }
  const xpPerMinute = 2;
  const totalXP = minutes * xpPerMinute;
  await UserXP.addVoiceXP(state.guild.id, state.id, totalXP);
  client.voiceSessions.delete(key);
}

module.exports = { handleMessage, handleVoiceJoin, handleVoiceLeave };
