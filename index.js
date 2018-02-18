'use strict';

const Discord = require('discord.js');
const EvilManager = require('./evil');
const config = require('./config');

const client = new Discord.Client();
const evil = new EvilManager();

const cblockre = /^```js|```$/;
const newsessionre = /^create session/;
const newmodulesessionre = /^create module session/;
const endsessionre = /^end session/;

client.on('message', async (message) => {
  const prefix = client.user.toString();
  if (!message.content.startsWith(prefix))
    return;
  let content = message.content.replace(client.user.toString(), '').trim();
  if (newsessionre.test(content)) {
    const created = evil.createSession(message.author.id);
    if (created)
      message.channel.send('**Your session has been created**');
    else
      message.channel.send('**You already have a session**');
    return;
  } else if (newmodulesessionre.test(content)) {
    const created = evil.createSession(message.author.id, 'module');
    if (created)
      message.channel.send('**Your module session has been created**');
    else
      message.channel.send('**You already have a module session**');
    return;
  } else if (endsessionre.test(content)) {
    const ended = evil.endSession(message.author.id);
    if (ended)
      message.channel.send('**Your session has ended**');
    else
      message.channel.send('**You do you have a session to end**');
    return;
  }

  if (cblockre.test(content))
    content = content.replace(cblockre, '');

  const out = await evil.evil(content, message.author.id);
  message.channel.send(out, { code: 'js' });
});

client.login(config.token);
