const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');
const UserXP = require('../models/UserXP');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give-badge')
    .setDescription('Give badge role and badge image to user (owner only)')
    .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true))
    .addStringOption(o => o.setName('badge').setDescription('badgeKey').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true)),
  prefix: { name: 'give-badge' },
  async execute({ client, interaction }) {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const target = interaction.options.getUser('user');
    const badgeKey = interaction.options.getString('badge');
    const role = interaction.options.getRole('role');
    const cfg = await GuildConfig.getForGuild(interaction.guildId);
    const existing = cfg.badgeRoleMap.find(m => m.roleId === role.id);
    if (!existing) cfg.badgeRoleMap.push({ roleId: role.id, badgeKey });
    else existing.badgeKey = badgeKey;
    await cfg.save();
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) await member.roles.add(role).catch(() => {});
    const data = await UserXP.findOne({ guildId: interaction.guildId, userId: target.id }) || new UserXP({ guildId: interaction.guildId, userId: target.id });
    const badgeUrl = (cfg.customBadges && cfg.customBadges.find(b => b.key === badgeKey)) ? cfg.customBadges.find(b => b.key === badgeKey).url : null;
    await data.updateOne({ $addToSet: { badges: badgeUrl || badgeKey } }, { upsert: true });
    await interaction.reply({ content: 'Badge assigned', ephemeral: true });
  },
  async executePrefix({ client, message, args }) {
    if (message.author.id !== process.env.OWNER_ID) return message.reply('Unauthorized');
    const target = message.mentions.users.first();
    const badgeKey = args[1];
    const role = message.mentions.roles.first();
    if (!target || !badgeKey || !role) return message.reply('Usage: !give-badge @user badgeKey @role');
    const cfg = await GuildConfig.getForGuild(message.guild.id);
    const existing = cfg.badgeRoleMap.find(m => m.roleId === role.id);
    if (!existing) cfg.badgeRoleMap.push({ roleId: role.id, badgeKey });
    else existing.badgeKey = badgeKey;
    await cfg.save();
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (member) await member.roles.add(role).catch(() => {});
    const data = await UserXP.findOne({ guildId: message.guild.id, userId: target.id }) || new UserXP({ guildId: message.guild.id, userId: target.id });
    const badgeUrl = (cfg.customBadges && cfg.customBadges.find(b => b.key === badgeKey)) ? cfg.customBadges.find(b => b.key === badgeKey).url : null;
    await data.updateOne({ $addToSet: { badges: badgeUrl || badgeKey } }, { upsert: true });
    await message.reply('Badge assigned');
  }
};
