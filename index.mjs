import Discord from 'discord.js';
import evil from './evil';
import config from './config';
import request from 'snekfetch';

const client = new Discord.Client();

const cblockre = /(^```js)|(```$)/g;

async function respond(message, content) {
  if (content.length > 1985) {
    const key = await request.post('https://hastebin.com/documents')
      .send(content)
      .then((r) => r.body.key);
    await message.reply(`**Output was too long and was uploaded to https://hastebin.com/${key}.js**`);
  } else {
    await message.reply(content, { code: 'js' });
  }
}

client.on('message', async (message) => {
  const prefix = client.user.toString();
  if (!message.content.startsWith(prefix))
    return;
  let content = message.content.replace(client.user.toString(), '').trim();

  if (cblockre.test(content))
    content = content.replace(cblockre, '').trim();
  try {
    const out = await evil(content, config.admins.includes(message.author.id));
    await respond(message, out);
  } catch (err) {
    console.error(err);
  }
});

client.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log('CLIENT ERROR', err);
});

client.login(config.token);
