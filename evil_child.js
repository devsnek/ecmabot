const { createContext, Script } = require('vm');
const util = require('util');

const TIMEOUT = 1000;

function makeContext() {
  const context = createContext(Object.create(null), {
    allowCodeGenerationFromStrings: false,
    origin: 'vm://ecmabot',
  });
  return context;
}

function asScriptWeirdName(code, id, context) {
  const s = new Script(code, {
    displayErrors: true,
    filename: `/ecmabot/${id}.js`,
  });
  const result = s.runInContext(context, {
    timeout: TIMEOUT,
  });
  return { result };
}

async function runCode(code) {
  try {
    const context = makeContext();
    const { result } = await asScriptWeirdName(code, 'code', context);
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

runCode(process.argv[2], process.argv[3]).then((out) => {
  process.send(out);
});
