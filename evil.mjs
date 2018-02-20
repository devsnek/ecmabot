import childProcess from 'child_process';

const timeout = 1000;

export default function evil(code, admin) {
  return new Promise((resolve, reject) => {
    const child = childProcess.fork('./evil_child.js', [code, timeout, admin], {
      silent: true,
    });
    let res = '';
    child.once('exit', () => {
      resolve(res);
    });
    child.once('error', (err) => {
      reject(err);
    });
    child.on('message', (data) => { res += data; });
    setTimeout(() => {
      res = 'Error: Script execution timed out.';
      child.kill();
    }, timeout + 100);
  });
}
