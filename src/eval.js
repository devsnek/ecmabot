'use strict';

const cp = require('child_process');
const crypto = require('crypto');
const request = require('snekfetch');

const CONTAINER = 'devsnek/js-eval';

const ARGS = ['run', '--rm', '-i', '--net=none'];

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

function run({ environment, code }) {
  return new Promise((resolve, reject) => {
    const name = `jseval-${crypto.randomBytes(8).toString('hex')}`;

    const proc = cp.spawn('docker', ARGS.concat([`--name=${name}`, CONTAINER]));
    proc.stdin.write(`${JSON.stringify({ environment, code })}\n`);
    proc.stdin.end();

    const kill = () => {
      cp.exec(`docker kill ${name}`, () => {
        reject(new Error('Error: Script execution timed out.'));
      });
    };

    const timer = setTimeout(kill, TIMEOUT);

    let data = '';
    proc.stdout.on('data', (chunk) => {
      data += chunk;
    });

    proc.stderr.on('data', (c) => {
      console.log(name, c.toString());
    });

    proc.on('error', (e) => {
      clearTimeout(timer);
      console.error(e);
      reject(new Error('Error: Unknown error.'));
    });

    proc.on('exit', () => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

module.exports = async (message) => {
  let { content } = message;

  if (cblockre.test(content))
    content = content.replace(cblockre, '').trim();

  header(message, content);

  try {
    const result = await run({ environment: 'node-cjs', code: content });
    await respond(message, result);
  } catch (err) {
    header(message, err);
    await respond(message, err.message);
  }
};
