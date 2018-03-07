/* eslint-disable no-console */

import Discord from 'discord.js';
import evil from './evil';
import config from './config';
import request from 'snekfetch';
import cardinal from 'cardinal';

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
  } catch {
    return t;
  }
};

async function respond(message, result, time) {
  header(message);
  const wrapped = `${message.author}, *Executed in ${time}ms*\n\`\`\`js\n${result}\n\`\`\``;
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
    const { result, time } = await evil(content, config.admins.includes(message.author.id));
    await respond(message, result, time);
  } catch (err) {
    header(message, err);
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
