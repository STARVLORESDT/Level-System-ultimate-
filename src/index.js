const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { handleMessage, handleVoiceJoin, handleVoiceLeave } = require('./utils/xpManager');
const GuildConfig = require('./models/GuildConfig');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.GuildMember]
});

client.commands = new Collection();
client.prefixCommands = new Collection();
client.cooldowns = new Collection();
client.voiceSessions = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
  if (cmd.prefix && cmd.executePrefix) client.prefixCommands.set(cmd.prefix.name, cmd);
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try {
      await cmd.execute({ client, interaction });
    } catch (err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) await interaction.followUp({ content: 'An error occurred.', ephemeral: true });
      else await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  } else if (interaction.isButton() || interaction.isModalSubmit() || interaction.isSelectMenu()) {
    try {
      const handler = require('./utils/interactionHandler');
      await handler({ client, interaction });
    } catch (e) {}
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  const guild = await GuildConfig.getForGuild(message.guild.id);
  const prefix = guild.prefix || process.env.DEFAULT_PREFIX || '!';
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const cmd = Array.from(client.prefixCommands.values()).find(c => c.prefix.name === commandName || (c.prefix.aliases && c.prefix.aliases.includes(commandName)));
    if (!cmd) return;
    const now = Date.now();
    const timestamps = client.cooldowns.get(cmd.data?.name || cmd.prefix.name) || new Map();
    const cooldownAmount = (cmd.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) return;
    }
    timestamps.set(message.author.id, now);
    client.cooldowns.set(cmd.data?.name || cmd.prefix.name, timestamps);
    try {
      await cmd.executePrefix({ client, message, args, guildConfig: guild });
    } catch (err) {
      console.error(err);
      message.reply('An unexpected error occurred.');
    }
    return;
  }
  await handleMessage({ client, message });
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (!oldState.channel && newState.channel) {
    handleVoiceJoin({ client, state: newState });
  }
  if (oldState.channel && !newState.channel) {
    handleVoiceLeave({ client, state: oldState });
  }
  if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
    handleVoiceLeave({ client, state: oldState });
    handleVoiceJoin({ client, state: newState });
  }
});

cron.schedule('0 0 * * *', async () => {
  const { resetDailyTops } = require('./utils/topManager');
  await resetDailyTops();
});

client.once('ready', async () => {
  const rest = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const commands = [];
  for (const cmd of client.commands.values()) commands.push(cmd.data.toJSON());
  try {
    const REST = new rest.REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    await REST.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.BOT_TOKEN);
