const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('set-level-message').setDescription('تعيين قالب رسالة الترقية'),
  prefix: { name: 'set-level-message' },
  cooldown: 5,
  async execute({ client, interaction }) {
    const modal = new ModalBuilder().setCustomId('modal_set_level_message').setTitle('Set Level Message');
    const input = new TextInputBuilder().setCustomId('levelMessage').setLabel('Template').setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder('Congratulations [user]\\nYou reached new Level [level]');
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
  async executePrefix({ client, message }) {
    await message.reply('Use slash command /set-level-message');
  }
};
