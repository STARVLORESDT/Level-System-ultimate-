const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder().setName('set-level-channel').setDescription('Set level announce channel').addChannelOption(o => o.setName('channel').setRequired(true)),
  prefix: { name: 'set-level-channel' },
  async execute({ client, interaction }) {
    const channel = interaction.options.getChannel('channel');
    const cfg = await GuildConfig.getForGuild(interaction.guildId);
    cfg.levelChannel = channel.id;
    await cfg.save();
    await interaction.reply({ content: 'Level channel set', ephemeral: true });
  },
  async executePrefix({ client, message }) {
    const channel = message.mentions.channels.first() || message.channel;
    const cfg = await GuildConfig.getForGuild(message.guild.id);
    cfg.levelChannel = channel.id;
    await cfg.save();
    await message.reply('Level channel set');
  }
};
