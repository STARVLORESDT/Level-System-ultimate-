const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const UserXP = require('../models/UserXP');
const GuildConfig = require('../models/GuildConfig');
const { createRankCard } = require('../utils/artsUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('عرض رانك العضو')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(false)),
  prefix: { name: 'rank', aliases: ['r'] },
  cooldown: 5,
  async execute({ client, interaction }) {
    const target = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild ? await interaction.guild.members.fetch(target.id).catch(() => null) : null;
    const doc = await UserXP.findOne({ guildId: interaction.guildId, userId: target.id }) || { textXP: 0, voiceXP: 0, badges: [] };
    const total = (doc.textXP || 0) + (doc.voiceXP || 0);
    const rank = await UserXP.getRank(interaction.guildId, target.id);
    const buffer = await createRankCard({ user: target, member, totalXP: total, guildId: interaction.guildId, rankPosition: rank });
    const att = new AttachmentBuilder(buffer, { name: 'rank-card.png' });
    await interaction.reply({ files: [att] });
  },
  async executePrefix({ client, message, args }) {
    const mention = message.mentions.users.first();
    const target = mention || message.author;
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    const doc = await UserXP.findOne({ guildId: message.guild.id, userId: target.id }) || { textXP: 0, voiceXP: 0, badges: [] };
    const total = (doc.textXP || 0) + (doc.voiceXP || 0);
    const rank = await UserXP.getRank(message.guild.id, target.id);
    const buffer = await createRankCard({ user: target, member, totalXP: total, guildId: message.guild.id, rankPosition: rank });
    const att = new AttachmentBuilder(buffer, { name: 'rank-card.png' });
    await message.channel.send({ files: [att] });
  }
};
