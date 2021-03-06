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
  const prefix = new RegExp(`^<@!?${client.user.id}>`);
  if (!prefix.test(message.content)) {
    return;
  }
  const content = message.content.replace(prefix, '').trim();
  if (/^```js/.test(content)) {
    message.content = content;
    commands.eval(message);
  } else {
    const parts = content.split(' ');
    let command = parts.shift();
    if (/\n/.test(command)) {
      const evil = command.split(/\n/);
      command = evil[0]; // eslint-disable-line prefer-destructuring
      parts.unshift(evil[1]);
    }
    message.content = parts.join(' ');
    if (command in commands) {
      client.api.channels(message.channel.id).typing.post();
      commands[command](message);
    }
  }
});

client.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('CLIENT ERROR', err);
});

client.on('ready', () => {
  console.log('guilds');
  console.log(client.guilds.array().map((g) => g.name).join('\n'));
});

client.login(config.token);
