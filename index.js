'use strict';

const Discord = require('discord.js');
const evil = require('./evil');
const config = require('./config');

const client = new Discord.Client();

client.on('message', async (message) => {
  const prefix = client.user.toString();
  if (!message.content.startsWith(prefix))
    return;
  const content = message.content.replace(client.user.toString(), '').trim();

  const out = await evil(content, message.id);
  message.channel.send(out, { code: 'js' });
});

client.login(config.token);
