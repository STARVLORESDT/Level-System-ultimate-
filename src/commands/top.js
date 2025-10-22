const { SlashCommandBuilder } = require('discord.js');
const { getTop } = require('../utils/topManager');

module.exports = {
  data: new SlashCommandBuilder().setName('top').setDescription('عرض التوب الشهري (كتاب+صوت)'),
  prefix: { name: 'top', aliases: ['t'] },
  cooldown: 10,
  async execute({ client, interaction }) {
    const top = await getTop(interaction.guildId, 10);
    const lines = top.map((u, i) => `#${i + 1} <@${u.userId}> — Text: ${u.textXP || 0} | Voice: ${u.voiceXP || 0}`);
    await interaction.reply({ content: lines.join('\n') || 'No data.' });
  },
  async executePrefix({ client, message }) {
    const top = await getTop(message.guild.id, 10);
    const lines = top.map((u, i) => `#${i + 1} <@${u.userId}> — Text: ${u.textXP || 0} | Voice: ${u.voiceXP || 0}`);
    await message.channel.send({ content: lines.join('\n') || 'No data.' });
  }
};
