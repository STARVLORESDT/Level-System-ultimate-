const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder().setName('remove-level-channel').setDescription('حذف روم التنبيه'),
  prefix: { name: 'remove-level-channel' },
  cooldown: 5,
  async execute({ client, interaction }) {
    const cfg = await GuildConfig.getForGuild(interaction.guildId);
    cfg.levelChannel = null;
    await cfg.save();
    await interaction.reply({ content: 'تمت إزالة روم التنبيه.', ephemeral: true });
  },
  async executePrefix({ client, message }) {
    const cfg = await GuildConfig.getForGuild(message.guild.id);
    cfg.levelChannel = null;
    await cfg.save();
    await message.reply('تمت إزالة روم التنبيه.');
  }
};
