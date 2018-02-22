/* eslint-disable no-console */

import Discord from 'discord.js';
import evil from './evil';
import config from './config';
import request from 'snekfetch';

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

async function respond(message, content) {
  header(message);
  const wrapped = `${message.author},\n\`\`\`js\n${content}\n\`\`\``;
  if (wrapped.length >= 2000) {
    const key = await request.post('https://hastebin.com/documents')
      .send(content)
      .then((r) => r.body.key);
    await message.reply(`**Output was too long and was uploaded to https://hastebin.com/${key}.js**`);
    console.log('hastebin', `https://hastebin.org/${key}.js`);
  } else {
    await message.reply(wrapped);
    console.log(content);
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

  header(message, content);

  try {
    const out = await evil(content, config.admins.includes(message.author.id));
    await respond(message, out);
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
