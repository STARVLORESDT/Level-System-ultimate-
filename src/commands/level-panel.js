const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('level-panel').setDescription('Open level panel'),
  prefix: { name: 'level-panel' },
  async execute({ client, interaction }) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('panel_setup').setLabel('Setup').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('panel_settings').setLabel('Settings').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('panel_send_test').setLabel('Send Test').setStyle(ButtonStyle.Success)
    );
    await interaction.reply({ content: 'Level Panel', components: [row] });
  },
  async executePrefix({ client, message }) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('panel_setup').setLabel('Setup').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('panel_settings').setLabel('Settings').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('panel_send_test').setLabel('Send Test').setStyle(ButtonStyle.Success)
    );
    await message.channel.send({ content: 'Level Panel', components: [row] });
  }
};
