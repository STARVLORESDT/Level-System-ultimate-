const { SlashCommandBuilder } = require('discord.js');
const { getTopDaily } = require('../utils/topManager');

module.exports = {
  data: new SlashCommandBuilder().setName('top-day').setDescription('Show today top'),
  prefix: { name: 'top-day', aliases: ['td'] },
  async execute({ client, interaction }) {
    const top = await getTopDaily(interaction.guildId, 10);
    const lines = top.map((u, i) => `#${i + 1} <@${u.userId}> - Text: ${u.dailyText} | Voice: ${u.dailyVoice}`);
    await interaction.reply({ content: lines.join('\n') || 'No data.' });
  },
  async executePrefix({ client, message }) {
    const top = await getTopDaily(message.guild.id, 10);
    const lines = top.map((u, i) => `#${i + 1} <@${u.userId}> - Text: ${u.dailyText} | Voice: ${u.dailyVoice}`);
    await message.channel.send({ content: lines.join('\n') || 'No data.' });
  }
};
