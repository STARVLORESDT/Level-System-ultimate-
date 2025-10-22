const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getTopDaily } = require('../utils/topManager');
const GuildConfig = require('../models/GuildConfig');
const { generateTopImage } = require('../utils/canvasTop');

module.exports = {
  data: new SlashCommandBuilder().setName('top-day').setDescription('عرض التوب اليومي (كتاب+صوت)'),
  prefix: { name: 'top-day', aliases: ['td'] },
  cooldown: 10,
  async execute({ client, interaction }) {
    const top = await getTopDaily(interaction.guildId, 5);
    const rows = [];
    for (const t of top) {
      const m = await interaction.guild.members.fetch(t.userId).catch(() => null);
      rows.push({ userId: t.userId, tag: m ? `${m.user.username}#${m.user.discriminator}` : null, avatar: m ? m.user.displayAvatarURL({ extension: 'png', size: 128 }) : null, dailyText: t.dailyTextXP || 0, dailyVoice: t.dailyVoiceXP || 0 });
    }
    const buffer = await generateTopImage(interaction.guild, rows, 'Top Today');
    const att = new AttachmentBuilder(buffer, { name: 'top-day.png' });
    await interaction.reply({ files: [att] });
  },
  async executePrefix({ client, message }) {
    const top = await getTopDaily(message.guild.id, 5);
    const rows = [];
    for (const t of top) {
      const m = await message.guild.members.fetch(t.userId).catch(() => null);
      rows.push({ userId: t.userId, tag: m ? `${m.user.username}#${m.user.discriminator}` : null, avatar: m ? m.user.displayAvatarURL({ extension: 'png', size: 128 }) : null, dailyText: t.dailyTextXP || 0, dailyVoice: t.dailyVoiceXP || 0 });
    }
    const buffer = await generateTopImage(message.guild, rows, 'Top Today');
    const att = new AttachmentBuilder(buffer, { name: 'top-day.png' });
    await message.channel.send({ files: [att] });
  }
};
