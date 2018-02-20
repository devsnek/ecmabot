'use strict';

const { createContext, Script } = require('vm');
const util = require('util');

function makeContext() {
  const context = createContext(Object.create(null), {
    allowCodeGenerationFromStrings: false,
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
  const result = context ?
    s.runInContext(context, opt) :
    s.runInThisContext(opt);
  return { result };
}

async function runCode(code, timeout, admin) {
  try {
    const context = admin ? false : makeContext();
    const { result } = await asScriptWeirdName(code, timeout, context);
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

const [code, timeout, admin] = process.argv.slice(2);

runCode(code, parseInt(timeout), JSON.parse(admin)).then((out) => {
  process.send(out);
});
