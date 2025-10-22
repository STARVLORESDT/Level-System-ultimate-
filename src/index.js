require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');
const cron = require('node-cron');
const ExtendedClient = require('./structures/ExtendedClient');
const GuildConfig = require('./models/GuildConfig');
const interactionRouter = require('./utils/interactionHandler');
const xpManager = require('./utils/xpManager');
const topManager = require('./utils/topManager');

const client = new ExtendedClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message]
});

client.commands = new Collection();
client.prefixCommands = new Collection();
client.cooldowns = new Collection();
client.voiceSessions = new Map();

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
    if (cmd.prefix && cmd.executePrefix) client.prefixCommands.set(cmd.prefix.name, cmd);
  }
}

mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch(console.error);

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      await cmd.execute({ client, interaction });
      return;
    }
    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
      await interactionRouter({ client, interaction });
      return;
    }
  } catch (err) {
    try { if (!interaction.replied) await interaction.reply({ content: 'An error occurred', ephemeral: true }); } catch(e){}
    console.error(err);
  }
});

client.on('messageCreate', async message => {
  try {
    if (message.author.bot || !message.guild) return;
    const guildCfg = await GuildConfig.getForGuild(message.guild.id);
    const prefix = guildCfg.prefix || process.env.DEFAULT_PREFIX || '!';
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
      await cmd.executePrefix({ client, message, args, guildConfig: guildCfg });
      return;
    }
    await xpManager.handleMessage({ client, message });
  } catch (err) {
    console.error(err);
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  try {
    if (!oldState.channel && newState.channel) xpManager.handleVoiceJoin({ client, state: newState });
    if (oldState.channel && !newState.channel) xpManager.handleVoiceLeave({ client, state: oldState });
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      xpManager.handleVoiceLeave({ client, state: oldState });
      xpManager.handleVoiceJoin({ client, state: newState });
    }
  } catch (err) {
    console.error(err);
  }
});

cron.schedule('0 0 * * *', async () => {
  try { await topManager.resetDailyTops(); } catch (e) { console.error(e); }
});

client.once('ready', async () => {
  try {
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v10');
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    const cmds = [];
    for (const cmd of client.commands.values()) cmds.push(cmd.data.toJSON());
    if (process.env.CLIENT_ID) await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: cmds });
  } catch (err) {
    console.error('Failed to register commands', err);
  }
});

client.login(process.env.BOT_TOKEN);
