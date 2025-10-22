const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const UserXP = require('../../models/UserXP');
const GuildConfig = require('../../models/GuildConfig');
const { createRankCard } = require('../../utils/artsUtils');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  const parts = interaction.customId.split('|');
  const action = parts[0];
  if (action === 'rank_view') {
    const targetId = parts[1] || interaction.user.id;
    const guildId = interaction.guildId;
    const member = await interaction.guild.members.fetch(targetId).catch(() => null);
    const user = member ? member.user : await client.users.fetch(targetId).catch(() => null);
    const doc = await UserXP.findOne({ guildId, userId: targetId }) || { textXP: 0, voiceXP: 0, badges: [] };
    const total = (doc.textXP || 0) + (doc.voiceXP || 0);
    const buffer = await createRankCard({ user, member, totalXP: total, guildId, rankPosition: await UserXP.getRank(guildId, targetId) });
    const att = new AttachmentBuilder(buffer, { name: 'rank.png' });
    return interaction.reply({ files: [att], ephemeral: true });
  }
  if (action === 'rank_leaderboard') {
    const guildId = interaction.guildId;
    const top = await UserXP.find({ guildId }).sort({ totalXP: -1 }).limit(10).lean();
    const lines = top.map((u, i) => `#${i + 1} <@${u.userId}> — Text: ${u.textXP || 0} | Voice: ${u.voiceXP || 0}`);
    const e = new EmbedBuilder().setTitle('Leaderboard').setDescription(lines.join('\n') || 'No data').setColor(0x2b2d31);
    return interaction.reply({ embeds: [e], ephemeral: true });
  }
  if (action === 'rank_export') {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const all = await UserXP.find({ guildId: interaction.guildId }).lean();
    const csv = ['userId,textXP,voiceXP,badges', ...all.map(a => `${a.userId},${a.textXP||0},${a.voiceXP||0},${(a.badges||[]).join(';')}`)].join('\n');
    const att = Buffer.from(csv, 'utf8');
    const attachment = new AttachmentBuilder(att, { name: 'export.csv' });
    return interaction.reply({ files: [attachment], ephemeral: true });
  }
  return interaction.reply({ content: 'Unknown rank action', ephemeral: true });
};
