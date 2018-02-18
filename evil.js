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
  return result;
}

function asScript(code, id, context) {
  const s = new Script(code, {
    displayErrors: true,
    filename: `/ecmabot/${id}.js`,
  });
  const result = s.runInContext(context, {
    timeout: TIMEOUT,
  });
  return result;
}

async function evil(code, id = Math.random().toString().slice(3)) {
  try {
    const m = Module ? asModule : asScript;
    const context = makeContext();
    const result = await m(code, id, context);
    return util.inspect(result);
  } catch (err) {
    return err.stack.split('at evil (')[0].trim();
  }
}

module.exports = evil;
