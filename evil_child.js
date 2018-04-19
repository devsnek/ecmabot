'use strict';

const { createContext, Module } = require('vm');
const util = require('util');
const { performance } = require('perf_hooks');
const v8 = require('v8-debug');
const { decorateErrorStack } = require('internal/util');

function makeContext(admin) {
  const top = Object.create(null);
  if (admin) {
    top.v8 = v8;
    top.require = require;
    top.module = module;
    top.global = global;
  }
  const context = createContext(top, {
    origin: 'vm://',
  });
  return context;
}

async function asModuleWeirdName(code, timeout, context) {
  const m = new Module(code, { context, url: 'vm:ecmabot' });
  await m.link(() => { throw new Error('no imports'); });
  m.instantiate();
  const start = performance.now();
  const { result } = await m.evaluate({ timeout });
  const end = performance.now();
  return {
    result,
    namespace: m.namespace,
    time: end - start,
  };
}

function inspect(val) {
  try {
    return util.inspect(val, {
      maxArrayLength: 20,
      customInspect: false,
      colors: false,
      breakLength: 60,
      compact: false,
    });
  } catch {
    return '';
  }
}

async function runCode(code, timeout, admin) {
  const start = performance.now();
  try {
    const context = makeContext(admin);
    let { result, time, namespace } = await asModuleWeirdName(code, timeout, context);
    result = inspect(result);
    if (namespace !== undefined) {
      namespace = inspect(namespace);
      result = `${result}\n-- namespace --\n${namespace}`;
    }
    return { result, time };
  } catch (err) {
    try {
      decorateErrorStack(err);
      var result = err.stack.split(/at Module\.evaluate/)[0].trim();
    } catch {
      result = 'Error: fuckery happened';
    }
    return { result, time: performance.now() - start };
  }
}

process.on('message', async ({ code, timeout, admin }) => {
  const out = await runCode(code, timeout, admin);
  process.send(out);
});
