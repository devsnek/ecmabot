import childProcess from 'child_process';

export default function evil(code) {
  return new Promise((resolve, reject) => {
    const child = childProcess.fork('./evil_child.js', [code]);
    let res = '';
    child.once('exit', () => {
      resolve(res);
    });
    child.once('error', (err) => {
      reject(err);
    });
    child.on('message', (data) => { res += data; });
  });
}
