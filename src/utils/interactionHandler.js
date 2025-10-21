const { ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');
const UserXP = require('../models/UserXP');
const { getRequiredXP } = require('./artsUtils');

module.exports = async function ({ client, interaction }) {
  try {
    if (interaction.isButton()) {
      const id = interaction.customId;
      if (id === 'panel_setup') {
        const rolesArr = Array.from(interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id).values());
        const page1 = rolesArr.slice(0, 25).map(r => ({ label: r.name.slice(0, 100), value: r.id }));
        const page2 = rolesArr.slice(25, 50).map(r => ({ label: r.name.slice(0, 100), value: r.id }));
        if (!page1.length) return interaction.reply({ content: 'No roles available', ephemeral: true });
        const menu1 = new StringSelectMenuBuilder().setCustomId('roles_page_1').setPlaceholder('Select role (page 1)').addOptions(page1);
        const components = [new ActionRowBuilder().addComponents(menu1)];
        if (page2.length) {
          const menu2 = new StringSelectMenuBuilder().setCustomId('roles_page_2').setPlaceholder('Select role (page 2)').addOptions(page2);
          components.push(new ActionRowBuilder().addComponents(menu2));
        }
        return interaction.reply({ content: 'Select a role to map levels', components, ephemeral: true });
      }
      if (id === 'panel_settings') {
        const cfg = await GuildConfig.getForGuild(interaction.guildId);
        const mappings = [];
        if (Array.isArray(cfg.rolesByTextLevel)) for (const m of cfg.rolesByTextLevel) mappings.push({ name: `Text → ${m.level}`, value: `text|${m.roleId}` });
        if (Array.isArray(cfg.rolesByVoiceLevel)) for (const m of cfg.rolesByVoiceLevel) mappings.push({ name: `Voice → ${m.level}`, value: `voice|${m.roleId}` });
        if (!mappings.length) return interaction.reply({ content: 'No mappings set', ephemeral: true });
        const options = mappings.slice(0, 25).map(o => ({ label: o.name.slice(0, 100), value: o.value }));
        const menu = new StringSelectMenuBuilder().setCustomId('panel_select_edit').setPlaceholder('Edit mapping').addOptions(options);
        return interaction.reply({ content: 'Choose mapping to edit', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
      }
      if (id === 'panel_send_test') {
        const cfg = await GuildConfig.getForGuild(interaction.guildId);
        if (!cfg.levelChannel) return interaction.reply({ content: 'Level channel not set', ephemeral: true });
        const ch = interaction.guild.channels.cache.get(cfg.levelChannel);
        if (!ch) return interaction.reply({ content: 'Channel not found', ephemeral: true });
        await ch.send({ content: cfg.levelMessageTemplate.replace('[user]', `<@${interaction.user.id}>`).replace('[level]', '1') });
        return interaction.reply({ content: 'Test message sent', ephemeral: true });
      }
      if (id.startsWith('confirm_set_level|')) {
        const parts = id.split('|');
        const guildId = parts[1];
        const userId = parts[2];
        const type = parts[3];
        const level = parseInt(parts[4], 10);
        if (interaction.guildId !== guildId) return interaction.update({ content: 'Guild mismatch', components: [], ephemeral: true });
        const req = getRequiredXP(level);
        if (type === 'text') await UserXP.setTextXP(guildId, userId, req);
        else await UserXP.setVoiceXP(guildId, userId, req);
        return interaction.update({ content: `Level set to ${level}`, components: [], ephemeral: true });
      }
      if (id.startsWith('cancel_set_level|')) {
        return interaction.update({ content: 'Cancelled', components: [], ephemeral: true });
      }
      if (id.startsWith('confirm_set_xp|')) {
        const parts = id.split('|');
        const guildId = parts[1];
        const userId = parts[2];
        const type = parts[3];
        const xp = parseInt(parts[4], 10);
        if (interaction.guildId !== guildId) return interaction.update({ content: 'Guild mismatch', components: [], ephemeral: true });
        if (type === 'text') await UserXP.setTextXP(guildId, userId, xp);
        else await UserXP.setVoiceXP(guildId, userId, xp);
        return interaction.update({ content: `XP set to ${xp}`, components: [], ephemeral: true });
      }
      if (id.startsWith('cancel_set_xp|')) {
        return interaction.update({ content: 'Cancelled', components: [], ephemeral: true });
      }
      if (id.startsWith('panel_role_action|')) {
        const parts = id.split('|');
        const action = parts[1];
        const roleId = parts[2];
        const cfg = await GuildConfig.getForGuild(interaction.guildId);
        if (action === 'remove') {
          cfg.rolesByTextLevel = cfg.rolesByTextLevel.filter(r => r.roleId !== roleId);
          cfg.rolesByVoiceLevel = cfg.rolesByVoiceLevel.filter(r => r.roleId !== roleId);
          await cfg.save();
          return interaction.update({ content: 'Mapping removed', components: [], ephemeral: true });
        }
        if (action === 'edit') {
          const modal = new ModalBuilder().setCustomId(`modal_edit_mapping|${roleId}`).setTitle('Edit Role Mapping');
          const tInput = new TextInputBuilder().setCustomId('textLevel').setLabel('Text Level').setStyle(TextInputStyle.Short).setRequired(true);
          const vInput = new TextInputBuilder().setCustomId('voiceLevel').setLabel('Voice Level').setStyle(TextInputStyle.Short).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(tInput), new ActionRowBuilder().addComponents(vInput));
          return interaction.showModal(modal);
        }
      }
    }

    if (interaction.isStringSelectMenu()) {
      const id = interaction.customId;
      if (id === 'roles_page_1' || id === 'roles_page_2') {
        const roleId = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_role_level|${roleId}`).setTitle('Set Level Mapping');
        const inputText = new TextInputBuilder().setCustomId('textLevel').setLabel('Text Level (number)').setStyle(TextInputStyle.Short).setRequired(true);
        const inputVoice = new TextInputBuilder().setCustomId('voiceLevel').setLabel('Voice Level (number)').setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(inputText), new ActionRowBuilder().addComponents(inputVoice));
        return interaction.showModal(modal);
      }
      if (id === 'panel_select_edit') {
        const val = interaction.values[0];
        const [type, roleId] = val.split('|');
        const cfg = await GuildConfig.getForGuild(interaction.guildId);
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return interaction.reply({ content: 'Role not found', ephemeral: true });
        const components = [
          new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`panel_role_action|edit|${roleId}`).setLabel('Edit').setStyle(ButtonStyle.Primary)),
          new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`panel_role_action|remove|${roleId}`).setLabel('Remove').setStyle(ButtonStyle.Danger))
        ];
        return interaction.reply({ content: `Role: ${role.name} | Type: ${type}`, components, ephemeral: true });
      }
    }

    if (interaction.isModalSubmit()) {
      const cid = interaction.customId;
      if (cid.startsWith('modal_role_level|')) {
        const roleId = cid.split('|')[1];
        const textLevel = parseInt(interaction.fields.getTextInputValue('textLevel'), 10);
        const voiceLevel = parseInt(interaction.fields.getTextInputValue('voiceLevel'), 10);
        if (isNaN(textLevel) || isNaN(voiceLevel)) return interaction.reply({ content: 'Invalid levels', ephemeral: true });
        const cfg = await GuildConfig.getForGuild(interaction.guildId);
        const existT = cfg.rolesByTextLevel.find(r => r.roleId === roleId);
        if (existT) existT.level = textLevel;
        else cfg.rolesByTextLevel.push({ roleId, level: textLevel });
        const existV = cfg.rolesByVoiceLevel.find(r => r.roleId === roleId);
        if (existV) existV.level = voiceLevel;
        else cfg.rolesByVoiceLevel.push({ roleId, level: voiceLevel });
        await cfg.save();
        return interaction.reply({ content: 'Mapping saved', ephemeral: true });
      }
      if (cid === 'modal_set_level_message') {
        const msg = interaction.fields.getTextInputValue('levelMessage');
        const cfg = await GuildConfig.getForGuild(interaction.guildId);
        cfg.levelMessageTemplate = msg;
        await cfg.save();
        return interaction.reply({ content: 'Level message saved', ephemeral: true });
      }
      if (cid.startsWith('modal_edit_mapping|')) {
        const roleId = cid.split('|')[1];
        const textLevel = parseInt(interaction.fields.getTextInputValue('textLevel'), 10);
        const voiceLevel = parseInt(interaction.fields.getTextInputValue('voiceLevel'), 10);
        if (isNaN(textLevel) || isNaN(voiceLevel)) return interaction.reply({ content: 'Invalid levels', ephemeral: true });
        const cfg = await GuildConfig.getForGuild(interaction.guildId);
        const et = cfg.rolesByTextLevel.find(r => r.roleId === roleId);
        if (et) et.level = textLevel;
        else cfg.rolesByTextLevel.push({ roleId, level: textLevel });
        const ev = cfg.rolesByVoiceLevel.find(r => r.roleId === roleId);
        if (ev) ev.level = voiceLevel;
        else cfg.rolesByVoiceLevel.push({ roleId, level: voiceLevel });
        await cfg.save();
        return interaction.reply({ content: 'Mapping updated', ephemeral: true });
      }
    }
  } catch (err) {
    try { await interaction.reply({ content: 'Error', ephemeral: true }); } catch (e) {}
  }
};
