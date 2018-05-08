'use strict';

/* eslint-disable no-console */

const Discord = require('discord.js');
const config = require('../config');

const client = new Discord.Client();

const commands = {
  eval: require('./eval'),
  mdn: require('./mdn'),
};

client.on('message', async (message) => {
  const prefix = `${message.guild ? message.guild.me : client.user}`;
  if (!message.content.startsWith(prefix)) {
    return;
  }
  const content = message.content.replace(prefix, '').trim();
  const [command, ...args] = content.split(' ');
  message.content = args.join(' ');
  if (command in commands) {
    commands[command](message);
  }
});

client.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log('CLIENT ERROR', err);
});

client.on('ready', () => {
  console.log('guilds');
  console.log(client.guilds.array().map((g) => g.name).join('\n'));
});

client.login(config.token);
