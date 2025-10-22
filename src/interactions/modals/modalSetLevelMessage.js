const GuildConfig = require('../../models/GuildConfig');

module.exports = async function (interaction) {
  if (interaction.customId !== 'modal_set_level_message') return interaction.reply({ content: 'Invalid modal', ephemeral: true });
  const template = interaction.fields.getTextInputValue('levelMessage');
  const cfg = await GuildConfig.getForGuild(interaction.guildId);
  cfg.levelMessageTemplate = template;
  await cfg.save();
  return interaction.reply({ content: 'Level message saved', ephemeral: true });
};
