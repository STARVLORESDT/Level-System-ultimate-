const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('level-panel').setDescription('إرسال لوحة إعدادات اللفل'),
  prefix: { name: 'level-panel' },
  cooldown: 5,
  async execute({ client, interaction }) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('panel_setup').setLabel('Setup').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('panel_settings').setLabel('Settings').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('panel_send_test').setLabel('Send Test').setStyle(ButtonStyle.Success)
    );
    await interaction.reply({ content: 'Level Panel', components: [row] });
  },
  async executePrefix({ client, message }) {
    const row = [
      {
        type: 1,
        components: [
          { type: 2, custom_id: 'panel_setup', style: 1, label: 'Setup' },
          { type: 2, custom_id: 'panel_settings', style: 2, label: 'Settings' },
          { type: 2, custom_id: 'panel_send_test', style: 3, label: 'Send Test' }
        ]
      }
    ];
    await message.channel.send({ content: 'Level Panel', components: row });
  }
};
