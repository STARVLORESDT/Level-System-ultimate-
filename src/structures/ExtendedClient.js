const { Client, Collection } = require('discord.js');

class ExtendedClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.prefixCommands = new Collection();
    this.cooldowns = new Collection();
    this.voiceSessions = new Map();
  }
}

module.exports = ExtendedClient;
