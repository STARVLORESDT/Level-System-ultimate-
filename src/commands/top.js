const { SlashCommandBuilder } = require('discord.js');
const { getTop } = require('../utils/topManager');

module.exports = {
  data: new SlashCommandBuilder().setName('top').setDescription('Show top users'),
  prefix: { name: 'top', aliases: ['t'] },
  async execute({ client, interaction }) {
    const top = await getTop(interaction.guildId, 10);
    const lines = top.map((u, i) => `#${i + 1} <@${u.userId}> - Text: ${u.xpText} | Voice: ${u.xpVoice}`);
    await interaction.reply({ content: lines.join('\n') || 'No data.' });
  },
  async executePrefix({ client, message }) {
    const top = await getTop(message.guild.id, 10);
    const lines = top.map((u, i) => `#${i + 1} <@${u.userId}> - Text: ${u.xpText} | Voice: ${u.xpVoice}`);
    await message.channel.send({ content: lines.join('\n') || 'No data.' });
  }
};
