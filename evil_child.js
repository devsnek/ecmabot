'use strict';

const { createContext, Script } = require('vm');
const util = require('util');
const { performance } = require('perf_hooks');

function makeContext() {
  const context = createContext(Object.create(null), {
    origin: 'vm://',
  });
  return context;
}

function asScriptWeirdName(code, timeout, context) {
  const s = new Script(code, {
    displayErrors: true,
    filename: 'code.js',
  });
  const opt = { timeout };
  const start = performance.now();
  const result = context ?
    s.runInContext(context, opt) :
    s.runInThisContext(opt);
  const end = performance.now();
  return { result, time: end - start };
}

async function runCode(code, timeout, admin) {
  try {
    const context = admin ? false : makeContext();
    let { result, time } = await asScriptWeirdName(code, timeout, context);
    result = util.inspect(result, {
      maxArrayLength: 20,
      customInspect: false,
      colors: false,
    });
    return { result, time };
  } catch (err) {
    try {
      var result = err.stack.split(/at as(Script|Module)WeirdName/)[0].trim();
    } catch {
      result = 'Error: fuckery happened';
    }
    return { result, time: timeout };
  }
}

process.on('message', async ({ code, timeout, admin }) => {
  const out = await runCode(code, timeout, admin);
  process.send(out);
});
