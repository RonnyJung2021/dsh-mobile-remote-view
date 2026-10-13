/**
 * The built browser bundle: it must register in the shell's module-table
 * dialect and expose the entry the loader row expects.
 *
 * `npm test` builds first through its pretest step, so `lib/client.js` exists.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const code = readFileSync(join(root, 'lib', 'client.js'), 'utf8')

test('the bundle wraps itself in the module-table envelope', () => {
  assert.ok(code.includes('window.__ModuleLoader__.load'))
  assert.ok(code.includes('"dsh-mobile-remote-view"'))
  assert.ok(code.includes('__esModule') === false || code.includes('delete module.exports.__esModule'))
})

test('the factory registers a usable client entry', () => {
  const loaded = []
  globalThis.window = {
    __ModuleLoader__: {
      load(entry) { loaded.push(entry) },
    },
  }
  // The bundle runs as a classic script against the fake loader.
  // eslint-disable-next-line no-new-func
  new Function(code)()
  assert.equal(loaded.length, 1)
  const entry = loaded[0]
  assert.equal(entry.id, 'dsh-mobile-remote-view')

  const requireStub = (name) => {
    if (name === 'react') return { useState: initial => [initial, () => {}], useEffect: () => {} }
    if (name === 'react/jsx-runtime') return { jsx: (tag, props) => ({ tag, props }), jsxs: (tag, props) => ({ tag, props }), Fragment: 'fragment' }
    throw new Error(`unexpected require: ${name}`)
  }
  const client = entry.factory(requireStub)
  assert.equal(client.name, 'dsh-mobile-remote-view')
  assert.ok(Array.isArray(client.inject))
  assert.ok(client.inject.includes('layout'))
  assert.equal(typeof client.apply, 'function')
  delete globalThis.window
})
