'use strict';

const { createContext, Script } = require('vm');
const util = require('util');

const TIMEOUT = 1000;

function makeContext() {
  const context = createContext(Object.create(null), {
    allowCodeGenerationFromStrings: false,
    origin: 'vm://',
  });
  return context;
}

function asScriptWeirdName(code, context) {
  const s = new Script(code, {
    displayErrors: true,
    filename: 'code.js',
  });
  const opt = { timeout: TIMEOUT };
  const result = context ?
    s.runInContext(context, opt) :
    s.runInThisContext(opt);
  return { result };
}

async function runCode(code, admin) {
  try {
    const context = admin ? false : makeContext();
    const { result } = await asScriptWeirdName(code, context);
    return util.inspect(result, {
      maxArrayLength: 20,
      customInspect: false,
      colors: false,
    });
  } catch (err) {
    try {
      return err.stack.split(/at as(Script|Module)WeirdName/)[0].trim();
    } catch (e) {
      return 'Error: fuckery happened';
    }
  }
}

runCode(process.argv[2], JSON.parse(process.argv[3])).then((out) => {
  process.send(out);
});
