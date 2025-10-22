const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder().setName('set-level-channel').setDescription('تحديد روم تنبيه اللفل').addChannelOption(o => o.setName('channel').setRequired(true)),
  prefix: { name: 'set-level-channel' },
  cooldown: 5,
  async execute({ client, interaction }) {
    const ch = interaction.options.getChannel('channel');
    const cfg = await GuildConfig.getForGuild(interaction.guildId);
    cfg.levelChannel = ch.id;
    await cfg.save();
    await interaction.reply({ content: 'تم تحديد روم التنبيه.', ephemeral: true });
  },
  async executePrefix({ client, message }) {
    const ch = message.mentions.channels.first() || message.channel;
    const cfg = await GuildConfig.getForGuild(message.guild.id);
    cfg.levelChannel = ch.id;
    await cfg.save();
    await message.reply('تم تحديد روم التنبيه.');
  }
};
