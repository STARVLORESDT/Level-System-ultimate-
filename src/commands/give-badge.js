const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give-badge')
    .setDescription('Give a badge role to a user (owner only)')
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(opt => opt.setName('badge').setDescription('Badge key: vip,bug-hunter,partner,premium,staff,owner').setRequired(true))
    .addRoleOption(opt => opt.setName('role').setDescription('Role to assign for this badge').setRequired(true)),
  prefix: { name: 'give-badge' },
  cooldown: 1,
  async execute({ client, interaction }) {
    if (!process.env.BOT_OWNER_ID || interaction.user.id !== process.env.BOT_OWNER_ID) {
      await interaction.reply({ content: 'Unauthorized', ephemeral: true });
      return;
    }
    const target = interaction.options.getUser('user');
    const badge = interaction.options.getString('badge');
    const role = interaction.options.getRole('role');
    const guildCfg = await GuildConfig.getForGuild(interaction.guildId);
    const existing = guildCfg.badgeRoleMap.find(m => m.roleId === role.id);
    if (!existing) {
      guildCfg.badgeRoleMap.push({ roleId: role.id, badgeKey: badge });
    } else {
      existing.badgeKey = badge;
    }
    await guildCfg.save();
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      await member.roles.add(role).catch(() => {});
    }
    await interaction.reply({ content: `Badge ${badge} assigned to ${target.tag} with role ${role.name}`, ephemeral: true });
  },
  async executePrefix({ client, message, args }) {
    if (!process.env.BOT_OWNER_ID || message.author.id !== process.env.BOT_OWNER_ID) {
      await message.reply('Unauthorized');
      return;
    }
    const target = message.mentions.users.first();
    const badge = args[1];
    const role = message.mentions.roles.first();
    if (!target || !badge || !role) {
      await message.reply('Usage: !give-badge @user badgeKey @role');
      return;
    }
    const guildCfg = await GuildConfig.getForGuild(message.guild.id);
    const existing = guildCfg.badgeRoleMap.find(m => m.roleId === role.id);
    if (!existing) {
      guildCfg.badgeRoleMap.push({ roleId: role.id, badgeKey: badge });
    } else {
      existing.badgeKey = badge;
    }
    await guildCfg.save();
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      await member.roles.add(role).catch(() => {});
    }
    await message.reply(`Badge ${badge} assigned to ${target.tag} with role ${role.name}`);
  }
};
