const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const UserXP = require('../../models/UserXP');
const GuildConfig = require('../../models/GuildConfig');
const { createRankCard } = require('../../utils/artsUtils');

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  const [action, userId] = interaction.customId.split('|');
  const guildId = interaction.guildId;
  if (action === 'profile_view') {
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (!member) return interaction.reply({ content: 'User not found', ephemeral: true });
    const data = await UserXP.findOne({ guildId, userId }) || { textXP: 0, voiceXP: 0, badges: [] };
    const buffer = await createRankCard({ user: member.user, member, totalXP: (data.textXP || 0) + (data.voiceXP || 0), guildId, rankPosition: await UserXP.getRank(guildId, userId) });
    const att = new AttachmentBuilder(buffer, { name: 'profile.png' });
    return interaction.reply({ files: [att], ephemeral: true });
  }
  if (action === 'profile_test') {
    const buffer = await createRankCard({ user: interaction.user, member: interaction.member, totalXP: 1200, guildId, rankPosition: 5 });
    const att = new AttachmentBuilder(buffer, { name: 'test.png' });
    return interaction.reply({ files: [att], ephemeral: true });
  }
  if (action === 'profile_embed') {
    const data = await UserXP.findOne({ guildId, userId }) || { textXP: 0, voiceXP: 0, badges: [] };
    const e = new EmbedBuilder().setTitle('Profile Info').setDescription([
      `User: <@${userId}>`,
      `Text XP: ${data.textXP || 0}`,
      `Voice XP: ${data.voiceXP || 0}`,
      `Total XP: ${(data.textXP||0)+(data.voiceXP||0)}`,
      `Badges: ${(data.badges||[]).length}`
    ].join('\n')).setColor(0x5865F2);
    return interaction.reply({ embeds: [e], ephemeral: true });
  }
  return interaction.reply({ content: 'Unknown profile action', ephemeral: true });
};
