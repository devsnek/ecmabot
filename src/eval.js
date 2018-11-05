'use strict';

const request = require('snekfetch');
const run = require('docker-js-eval');

const TIMEOUT = 6000;

const cblockre = /(^```js)|(```$)/g;

const header = (m, x) => {
  const H = `========== ${m.id} ==========`;
  console.log(H);
  if (x) {
    console.log(x);
    console.log(H);
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
    console.log(result);
  }
  header(message);
}

module.exports = async (message) => {
  let { content } = message;

  if (cblockre.test(content)) {
    content = content.replace(cblockre, '').trim();
  }

  header(message, content);

  try {
    const result = await run(content, 'node-cjs', {
      cpus: 0.5,
      net: 'none',
      timeout: TIMEOUT,
      name: message.id,
    });
    await respond(message, result);
  } catch (err) {
    header(message, err);
    await respond(message, err.message);
  }
};
