const { SlashCommandBuilder } = require('discord.js');
const UserXP = require('../models/UserXP');
const GuildConfig = require('../models/GuildConfig');
const { createRankCard } = require('../utils/artsUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('rank').setDescription('Show rank card for a user').addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(false)),
  prefix: { name: 'rank', aliases: ['r'] },
  cooldown: 5,
  async execute({ client, interaction }) {
    const target = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild ? await interaction.guild.members.fetch(target.id).catch(() => null) : null;
    const doc = await UserXP.findOne({ guildId: interaction.guildId, userId: target.id }) || { xpText: 0, xpVoice: 0 };
    const totalXP = (doc.xpText || 0) + (doc.xpVoice || 0);
    const all = await UserXP.find({ guildId: interaction.guildId }).lean();
    all.sort((a,b) => (b.xpText + b.xpVoice) - (a.xpText + a.xpVoice));
    const rankPosition = all.findIndex(u => u.userId === target.id) + 1 || null;
    const guildCfg = await GuildConfig.getForGuild(interaction.guildId);
    const { attachment } = await createRankCard({
      user: target,
      member,
      totalXP,
      guildConfig: guildCfg,
      extraBadges: [],
      botOwnerId: process.env.BOT_OWNER_ID || null,
      rankPosition
    });
    await interaction.reply({ files: [attachment] });
  },
  async executePrefix({ client, message, args }) {
    const target = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    const doc = await UserXP.findOne({ guildId: message.guild.id, userId: target.id }) || { xpText: 0, xpVoice: 0 };
    const totalXP = (doc.xpText || 0) + (doc.xpVoice || 0);
    const all = await UserXP.find({ guildId: message.guild.id }).lean();
    all.sort((a,b) => (b.xpText + b.xpVoice) - (a.xpText + a.xpVoice));
    const rankPosition = all.findIndex(u => u.userId === target.id) + 1 || null;
    const guildCfg = await GuildConfig.getForGuild(message.guild.id);
    const { attachment } = await createRankCard({
      user: target,
      member,
      totalXP,
      guildConfig: guildCfg,
      extraBadges: [],
      botOwnerId: process.env.BOT_OWNER_ID || null,
      rankPosition
    });
    await message.channel.send({ files: [attachment] });
  }
};
