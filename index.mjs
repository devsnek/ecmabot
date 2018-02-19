import Discord from 'discord.js';
import evil from './evil';
import config from './config';

const client = new Discord.Client();

const cblockre = /^```js|```$/;

client.on('message', async (message) => {
  const prefix = client.user.toString();
  if (!message.content.startsWith(prefix))
    return;
  let content = message.content.replace(client.user.toString(), '').trim();

  if (cblockre.test(content))
    content = content.replace(cblockre, '');

  const out = await evil(content);
  message.channel.send(out, { code: 'js' });
});

client.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log('CLIENT ERROR', err);
});

client.login(config.token);
