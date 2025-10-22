const { EmbedBuilder } = require('discord.js');
const UserBadges = require('../../models/UserBadges');
const UserXP = require('../../models/UserXP');

const ICONS = {
  vip: 'https://i.postimg.cc/GmDDp2T7/1389990857209413707.png',
  bughunter: 'https://i.postimg.cc/3xGGwRDH/1305893530492862616.png',
  partner: 'https://i.postimg.cc/htw1v6jS/47-20251021134341.png',
  premium: 'https://i.postimg.cc/x1btvnBq/1332343919283015905.png',
  staff: 'https://i.postimg.cc/BnFFv6Py/1426554933502804049.png',
  owner: 'https://i.postimg.cc/13FFztN9/1400551945902493826.png'
};

module.exports = async ({ client, interaction }) => {
  if (!interaction.isButton()) return;
  const parts = interaction.customId.split('_');
  const action = parts[0];
  const badge = parts[1];
  const targetId = parts[2] || interaction.user.id;
  const isOwner = interaction.user.id === process.env.OWNER_ID;
  const member = await interaction.guild.members.fetch(targetId).catch(() => null);
  if (!member) return interaction.reply({ content: 'User not found', ephemeral: true });
  let ub = await UserBadges.findOne({ userId: targetId });
  if (!ub) ub = await UserBadges.create({ userId: targetId });
  if (action === 'give') {
    if (!isOwner) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    if (ub.badges.includes(badge)) return interaction.reply({ content: 'User already has this badge', ephemeral: true });
    ub.badges.push(badge);
    await ub.save();
    await UserXP.addBadge(interaction.guildId, targetId, badge);
    const e = new EmbedBuilder().setColor(0x2b2d31).setDescription(`Badge **${badge}** given to <@${targetId}>`).setThumbnail(ICONS[badge]);
    return interaction.reply({ embeds: [e], ephemeral: true });
  }
  if (action === 'remove') {
    if (!isOwner) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    if (!ub.badges.includes(badge)) return interaction.reply({ content: 'User does not have this badge', ephemeral: true });
    ub.badges = ub.badges.filter(b => b !== badge);
    await ub.save();
    await UserXP.removeBadge(interaction.guildId, targetId, badge);
    const e = new EmbedBuilder().setColor(0x2b2d31).setDescription(`Badge **${badge}** removed from <@${targetId}>`).setThumbnail(ICONS[badge]);
    return interaction.reply({ embeds: [e], ephemeral: true });
  }
  if (action === 'info') {
    const e = new EmbedBuilder().setTitle(`Badge ${badge}`).setDescription(`Badge key: ${badge}`).setThumbnail(ICONS[badge]).setColor(0x2b2d31);
    return interaction.reply({ embeds: [e], ephemeral: true });
  }
  if (action === 'list') {
    const list = ub.badges.length ? ub.badges.map(b => `• ${b}`).join('\n') : 'No badges';
    const e = new EmbedBuilder().setTitle(`${member.user.username} badges`).setDescription(list).setThumbnail(member.user.displayAvatarURL()).setColor(0x2b2d31);
    return interaction.reply({ embeds: [e], ephemeral: true });
  }
  return interaction.reply({ content: 'Unknown badge action', ephemeral: true });
};
