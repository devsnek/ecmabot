import vm from 'vm';
import util from 'util';

const TIMEOUT = 1000;

function makeContext() {
  const context = vm.createContext(Object.create(null), {
    allowCodeGenerationFromStrings: false,
    origin: 'vm://ecmabot',
  });
  return context;
}

async function asModuleWeirdName(code, id, context) {
  const m = new vm.Module(code, {
    url: `vm://ecmabot/${id}.js`,
    context,
  });
  if (m.dependencySpecifiers.length)
    throw new Error('No dependencies allowed in sandbox');
  await m.link(() => 0);
  m.instantiate();
  const { result } = await m.evaluate({ timeout: TIMEOUT });
  return { result };
}

function asScriptWeirdName(code, id, context) {
  const s = new vm.Script(code, {
    displayErrors: true,
    filename: `/ecmabot/${id}.js`,
  });
  const result = s.runInContext(context, {
    timeout: TIMEOUT,
  });
  return { result };
}

async function runCode(code, context = makeContext(), module = false) {
  try {
    const m = module ? asModuleWeirdName : asScriptWeirdName;
    const { result } = await m(code, 'code', context);
    return util.inspect(result);
  } catch (err) {
    try {
      return err.stack.split(/at as(Script|Module)WeirdName/)[0].trim();
    } catch (e) {
      return 'Error: fuckery happened';
    }
  }
}

export default class EvilManager {
  constructor() {
    this.sessions = new WeakMap();
  }

  createSession(key, type = 'script') {
    if (this.sessions.has(key))
      return false;
    this.sessions.set(key, {
      context: makeContext(),
      type,
    });
    return true;
  }

  endSession(key) {
    return this.sessions.delete(key);
  }

  evil(code, sessionKey) {
    const session = this.sessions.get(sessionKey) || {};
    return runCode(code, session.context, session.type === 'module');
  }
}
