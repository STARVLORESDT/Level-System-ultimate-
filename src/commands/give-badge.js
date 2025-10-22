const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');
const UserXP = require('../models/UserXP');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give-badge')
    .setDescription('إعطاء شارة (مالك البوت فقط)')
    .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true))
    .addStringOption(o => o.setName('badge').setDescription('Badge key').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(false)),
  prefix: { name: 'give-badge' },
  cooldown: 5,
  async execute({ client, interaction }) {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: 'Unauthorized', ephemeral: true });
    const target = interaction.options.getUser('user');
    const badge = interaction.options.getString('badge');
    const role = interaction.options.getRole('role');
    const cfg = await GuildConfig.getForGuild(interaction.guildId);
    const existing = (cfg.badgeRoleMap || []).find(m => m.roleId === (role && role.id));
    if (role && !existing) cfg.badgeRoleMap.push({ roleId: role.id, badgeKey: badge });
    await cfg.save();
    await UserXP.addBadge(interaction.guildId, target.id, badge);
    if (role) {
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (member) await member.roles.add(role).catch(() => {});
    }
    await interaction.reply({ content: `Badge ${badge} assigned to ${target.tag}`, ephemeral: true });
  },
  async executePrefix({ client, message, args }) {
    if (message.author.id !== process.env.OWNER_ID) return message.reply('Unauthorized');
    const target = message.mentions.users.first();
    const badge = args[1];
    const role = message.mentions.roles.first();
    if (!target || !badge) return message.reply('Usage: !give-badge @user badgeKey [@role]');
    const cfg = await GuildConfig.getForGuild(message.guild.id);
    if (role) {
      const existing = (cfg.badgeRoleMap || []).find(m => m.roleId === role.id);
      if (!existing) cfg.badgeRoleMap.push({ roleId: role.id, badgeKey: badge });
      await cfg.save();
      const member = await message.guild.members.fetch(target.id).catch(() => null);
      if (member) await member.roles.add(role).catch(() => {});
    }
    await UserXP.addBadge(message.guild.id, target.id, badge);
    await message.reply('Badge assigned');
  }
};
