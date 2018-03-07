import childProcess from 'child_process';

const timeout = 1000;

export default function evil(code, admin) {
  return new Promise((resolve, reject) => {
    const child = childProcess.fork('./evil_child.js', {
      silent: true,
    });
    child.send({ code, admin, timeout });
    child.once('error', (err) => {
      reject(err);
    });
    child.once('message', ({ result, time }) => {
      resolve({ result, time });
    });
    setTimeout(() => {
      resolve({ result: 'Error: Script execution timed out.', time: 0 });
      child.kill();
    }, timeout + 100);
  });
}
