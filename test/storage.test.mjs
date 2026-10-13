/** The two browser stores: round trips and hostile input. */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const { readSaved, writeSaved, readPrefs, writePrefs } = await loadModule('utils/storage.ts')

/** A storage double that can be made to refuse reads or writes. */
class FakeStorage {
  constructor() {
    this.map = new Map()
    this.refuse = false
  }
  getItem(key) {
    if (this.refuse) throw new Error('denied')
    return this.map.get(key) ?? null
  }
  setItem(key, value) {
    if (this.refuse) throw new Error('denied')
    this.map.set(key, String(value))
  }
}

test('saved state round-trips', () => {
  const storage = new FakeStorage()
  assert.equal(readSaved(storage), null)
  writeSaved(storage, { on: true, page: 'sidebar' })
  assert.deepEqual(readSaved(storage), { on: true, page: 'sidebar' })
})

test('a hostile saved payload is rejected', () => {
  const storage = new FakeStorage()
  for (const text of ['', '{', '{"on":1}', '{"page":"left"}', '{"on":true,"page":123}']) {
    storage.map.set('dsh-mobile-remote-view:v1', text)
    if (text === '{' || text === '') assert.equal(readSaved(storage), null)
    else if (text === '{"on":1}') assert.equal(readSaved(storage), null)
    else if (text === '{"page":"left"}') assert.equal(readSaved(storage), null)
    else assert.deepEqual(readSaved(storage), { on: true, page: 'main' })
  }
})

test('prefs round-trip and clamp', () => {
  const storage = new FakeStorage()
  assert.equal(readPrefs(storage), null)
  writePrefs(storage, { scale: 2.2, contentFontSize: 24 })
  assert.deepEqual(readPrefs(storage), { scale: 2.2, contentFontSize: 24 })
  storage.map.set('dsh-mobile-remote-view:prefs', JSON.stringify({ scale: 99, contentFontSize: 1 }))
  assert.deepEqual(readPrefs(storage), { scale: 2.5, contentFontSize: 12 })
})

test('a storage that refuses is the same as no storage', () => {
  const storage = new FakeStorage()
  storage.refuse = true
  assert.equal(readSaved(storage), null)
  assert.equal(readPrefs(storage), null)
  writeSaved(storage, { on: true, page: 'main' })
  writePrefs(storage, { scale: 1.5, contentFontSize: 19 })
  assert.equal(storage.map.size, 0)
})

test('no storage at all is safe', () => {
  assert.equal(readSaved(undefined), null)
  assert.equal(readPrefs(undefined), null)
  writeSaved(undefined, { on: true, page: 'main' })
  writePrefs(undefined, { scale: 1.5, contentFontSize: 19 })
})
