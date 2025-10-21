const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const UserXP = require('../../models/UserXP');
const GuildConfig = require('../../models/GuildConfig');
const { createRankCard, getLevelFromXP } = require('../../utils/artsUtils');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  const parts = interaction.customId.split('|');
  const action = parts[0];

  if (action === 'rank_view') {
    const targetId = parts[1] || interaction.user.id;
    const guildId = interaction.guildId;
    const member = await interaction.guild.members.fetch(targetId).catch(() => null);
    const user = member ? member.user : await client.users.fetch(targetId).catch(() => null);
    const doc = await UserXP.findOne({ guildId, userId: targetId }) || { xpText: 0, xpVoice: 0, badges: [] };
    const totalXP = (doc.xpText || 0) + (doc.xpVoice || 0);
    const buffer = await createRankCard({ user, member, totalXP, guildConfig: await GuildConfig.getForGuild(guildId), rankPosition: null });
    const attachment = new AttachmentBuilder(buffer, { name: 'rank-card.png' });
    await interaction.reply({ files: [attachment], ephemeral: true });
    return;
  }

  if (action === 'rank_leaderboard') {
    const guildId = interaction.guildId;
    const all = await UserXP.find({ guildId }).lean();
    all.sort((a,b) => (b.xpText + b.xpVoice) - (a.xpText + a.xpVoice));
    const top = all.slice(0, 10);
    const lines = [];
    for (let i = 0; i < top.length; i++) {
      const u = top[i];
      lines.push(`#${i + 1} <@${u.userId}> — Text: ${u.xpText} | Voice: ${u.xpVoice}`);
    }
    const embed = new EmbedBuilder()
      .setTitle('Leaderboard')
      .setDescription(lines.join('\n') || 'No data')
      .setColor(0x2b2d31);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (action === 'rank_reset_daily') {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    await UserXP.updateMany({ guildId: interaction.guildId }, { $set: { dailyText: 0, dailyVoice: 0 } });
    await interaction.reply({ content: 'Daily counters reset', ephemeral: true });
    return;
  }

  if (action === 'rank_give_reward') {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const targetId = parts[1];
    const amount = parseInt(parts[2], 10) || 0;
    if (!targetId) return interaction.reply({ content: 'Target not found', ephemeral: true });
    const doc = await UserXP.findOne({ guildId: interaction.guildId, userId: targetId }) || new UserXP({ guildId: interaction.guildId, userId: targetId });
    await doc.updateOne({ $inc: { xpText: amount } }, { upsert: true });
    await interaction.reply({ content: `Added ${amount} text XP to <@${targetId}>`, ephemeral: true });
    return;
  }

  if (action === 'rank_set_level') {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const targetId = parts[1];
    const type = parts[2];
    const level = parseInt(parts[3], 10);
    if (!targetId || !type || isNaN(level)) return interaction.reply({ content: 'Invalid params', ephemeral: true });
    const required = (level > 0) ? (100 * level * level) : 0;
    if (type === 'text') await UserXP.setTextXP(interaction.guildId, targetId, required);
    else await UserXP.setVoiceXP(interaction.guildId, targetId, required);
    await interaction.reply({ content: `Set ${type} level of <@${targetId}> to ${level}`, ephemeral: true });
    return;
  }

  if (action === 'rank_promote' || action === 'rank_demote') {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const targetId = parts[1];
    const delta = action === 'rank_promote' ? 1 : -1;
    const doc = await UserXP.findOne({ guildId: interaction.guildId, userId: targetId }) || new UserXP({ guildId: interaction.guildId, userId: targetId });
    const total = (doc.xpText || 0) + (doc.xpVoice || 0);
    const currentLevel = getLevelFromXP(total);
    const newLevel = Math.max(1, currentLevel + delta);
    const required = 100 * newLevel * newLevel;
    await doc.updateOne({ $set: { xpText: required, xpVoice: 0 } }, { upsert: true });
    await interaction.reply({ content: `User <@${targetId}> level changed to ${newLevel}`, ephemeral: true });
    return;
  }

  if (action === 'rank_add_badge') {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const targetId = parts[1];
    const badgeKey = parts[2];
    if (!targetId || !badgeKey) return interaction.reply({ content: 'Invalid params', ephemeral: true });
    const doc = await UserXP.findOne({ guildId: interaction.guildId, userId: targetId }) || new UserXP({ guildId: interaction.guildId, userId: targetId });
    const badgeUrl = (await GuildConfig.getForGuild(interaction.guildId)).customBadges?.find(b => b.key === badgeKey)?.url || badgeKey;
    await doc.updateOne({ $addToSet: { badges: badgeUrl } }, { upsert: true });
    await interaction.reply({ content: `Badge ${badgeKey} added to <@${targetId}>`, ephemeral: true });
    return;
  }

  if (action === 'rank_remove_badge') {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const targetId = parts[1];
    const badgeKey = parts[2];
    if (!targetId || !badgeKey) return interaction.reply({ content: 'Invalid params', ephemeral: true });
    const doc = await UserXP.findOne({ guildId: interaction.guildId, userId: targetId });
    if (!doc) return interaction.reply({ content: 'User has no data', ephemeral: true });
    const badgeUrl = (await GuildConfig.getForGuild(interaction.guildId)).customBadges?.find(b => b.key === badgeKey)?.url || badgeKey;
    await doc.updateOne({ $pull: { badges: badgeUrl } });
    await interaction.reply({ content: `Badge ${badgeKey} removed from <@${targetId}>`, ephemeral: true });
    return;
  }

  if (action === 'rank_export') {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const all = await UserXP.find({ guildId: interaction.guildId }).lean();
    const rows = all.map(u => `${u.userId},${u.xpText || 0},${u.xpVoice || 0},${(u.badges||[]).join(';')}`);
    const csv = ['userId,textXP,voiceXP,badges', ...rows].join('\n');
    const buffer = Buffer.from(csv, 'utf8');
    const attachment = new AttachmentBuilder(buffer, { name: 'export.csv' });
    await interaction.reply({ files: [attachment], ephemeral: true });
    return;
  }

  await interaction.reply({ content: 'Unknown action', ephemeral: true });
};
