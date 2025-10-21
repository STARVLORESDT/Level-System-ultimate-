const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder().setName('remove-level-channel').setDescription('Remove level announce channel'),
  prefix: { name: 'remove-level-channel' },
  async execute({ client, interaction }) {
    const cfg = await GuildConfig.getForGuild(interaction.guildId);
    cfg.levelChannel = null;
    await cfg.save();
    await interaction.reply({ content: 'Level channel removed', ephemeral: true });
  },
  async executePrefix({ client, message }) {
    const cfg = await GuildConfig.getForGuild(message.guild.id);
    cfg.levelChannel = null;
    await cfg.save();
    await message.reply('Level channel removed');
  }
};
