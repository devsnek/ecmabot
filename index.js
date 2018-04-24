'use strict';

/* eslint-disable no-console */

const Discord = require('discord.js');
const config = require('./config');
const request = require('snekfetch');
const cardinal = require('cardinal');
const run = require('./run');

const client = new Discord.Client();

const cblockre = /(^```js)|(```$)/g;

const header = (m, x) => {
  const H = `========== ${m.id} ==========`;
  console.log(H);
  if (x) {
    console.log(x);
    console.log(H);
  }
};

const highlight = (t) => {
  try {
    return cardinal.highlight(t);
  } catch (err) {
    return t;
  }
};

async function respond(message, result) {
  header(message);
  const wrapped = `${message.author}\n\`\`\`js\n${result}\n\`\`\``;
  if (wrapped.length >= 2000) {
    const key = await request.post('https://hastebin.com/documents')
      .send(result)
      .then((r) => r.body.key);
    await message.reply(`**Output was too long and was uploaded to https://hastebin.com/${key}.js**`);
    console.log('hastebin', `https://hastebin.org/${key}.js`);
  } else {
    await message.channel.send(wrapped);
    console.log(highlight(result));
  }
  header(message);
}

client.on('message', async (message) => {
  const prefix = client.user.toString();
  if (!message.content.startsWith(prefix))
    return;
  let content = message.content.replace(client.user.toString(), '').trim();

  if (cblockre.test(content))
    content = content.replace(cblockre, '').trim();

  header(message, highlight(content));

  try {
    const result = await run({ environment: 'node-cjs', code: content });
    await respond(message, result);
  } catch (err) {
    header(message, err);
    await respond(message, err.message);
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
