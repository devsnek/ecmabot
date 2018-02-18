'use strict';

const { Module, Script, createContext } = require('vm');
const util = require('util');

const TIMEOUT = 1000;

function makeContext() {
  const context = createContext(Object.create(null), {
    allowCodeGenerationFromStrings: false,
    origin: 'vm://ecmabot',
  });
  return context;
}

async function asModule(code, id, context) {
  const m = new Module(code, {
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

function asScript(code, id, context) {
  const s = new Script(code, {
    displayErrors: true,
    filename: `/ecmabot/${id}.js`,
  });
  const result = s.runInContext(context, {
    timeout: TIMEOUT,
  });
  return { result };
}

async function runCodeWeirdName(code, context = makeContext(), module = false) {
  try {
    const m = module ? asModule : asScript;
    const { result } = await m(code, 'code', context);
    return util.inspect(result);
  } catch (err) {
    try {
      return err.stack.split('at runCodeWeirdName')[0].trim();
    } catch (e) {
      return 'Error: fuckery happened';
    }
  }
}

class EvilManager {
  constructor() {
    this.sessions = new Map();
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
    return runCodeWeirdName(code, session.context, session.type === 'module');
  }
}

module.exports = EvilManager;
