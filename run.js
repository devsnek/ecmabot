'use strict';

const cp = require('child_process');
const crypto = require('crypto');

const CONTAINER = 'devsnek/js-eval';

const ARGS = ['run', '--rm', '-i', '--net=none'];

const TIMEOUT = 6000;

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

module.exports = run;
