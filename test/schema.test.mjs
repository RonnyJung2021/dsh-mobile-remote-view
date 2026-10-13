/** The row's Config schema: defaults, bounds and the volatile surface. */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const { Config } = await loadModule('host/schema.ts')
const { plainValue } = await loadModule('utils/volatile.ts')

/** Resolve the schema output the way the loader does, unwrapping references. */
function resolve(input) {
  const resolved = Config(input)
  return Object.fromEntries(Object.entries(resolved).map(([key, value]) => [key, plainValue(value)]))
}

test('an empty config resolves every default', () => {
  const resolved = resolve({})
  assert.equal(resolved.rotate, -90)
  assert.equal(resolved.barEdge, 'left')
  assert.equal(resolved.barSize, 58)
  assert.equal(resolved.scale, 1.5)
  assert.equal(resolved.contentFontSize, 19)
  assert.equal(resolved.autoEnter, false)
  assert.equal(resolved.virtualizeCoordinates, true)
  assert.equal(resolved.globalName, '__DSH_MOBILE_REMOTE_VIEW__')
})

test('out-of-range knobs are rejected', () => {
  assert.throws(() => Config({ scale: 9 }))
  assert.throws(() => Config({ barSize: 1 }))
  assert.throws(() => Config({ contentFontSize: 100 }))
  assert.throws(() => Config({ rotate: 0 }))
  assert.throws(() => Config({ barEdge: 'up' }))
})

test('the seven knobs are volatile — the form the settings service derives', () => {
  const schema = Config
  // The schema object exposes its dict; the volatile mark lives on each knob.
  const dict = schema.dict
  for (const field of ['rotate', 'barEdge', 'barSize', 'scale', 'contentFontSize', 'autoEnter', 'virtualizeCoordinates']) {
    assert.ok(dict[field] !== undefined, `knob ${field} exists`)
    assert.equal(dict[field].meta.volatile, true, `knob ${field} is volatile`)
  }
  assert.equal(dict.globalName.meta.volatile, undefined, 'globalName stays out of the card')
})
