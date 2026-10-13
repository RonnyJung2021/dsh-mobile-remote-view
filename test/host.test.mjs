/** The host half's publish and apply wiring, driven through a fake context. */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const host = await loadModule('host/index.ts')
const { plainConfig, publishedConfig } = await loadModule('host/publish.ts')

/** A volatile reference, as the Loader hands it over. */
function ref(value) {
  return { get: () => value, set: () => {} }
}

test('the loader row id is the package name', () => {
  assert.equal(host.name, 'dsh-mobile-remote-view')
})

test('plainConfig unwraps every volatile reference', () => {
  const config = {
    rotate: ref(-90), barEdge: ref('top'), barSize: ref(58), scale: ref(1.5),
    contentFontSize: ref(19), autoEnter: ref(false), virtualizeCoordinates: ref(true),
  }
  assert.deepEqual(plainConfig(config), {
    rotate: -90, barEdge: 'top', barSize: 58, scale: 1.5, contentFontSize: 19, autoEnter: false, virtualizeCoordinates: true,
  })
})

test('publishedConfig travels only the section fields', () => {
  const value = publishedConfig({ rotate: 90, barEdge: 'left', barSize: 80, scale: 2, contentFontSize: 24, autoEnter: true, virtualizeCoordinates: false })
  assert.deepEqual(Object.keys(value).sort(), ['autoEnter', 'barEdge', 'barSize', 'contentFontSize', 'rotate', 'scale', 'virtualizeCoordinates'].sort())
  assert.deepEqual(value, { rotate: 90, barEdge: 'left', barSize: 80, scale: 2, contentFontSize: 24, autoEnter: true, virtualizeCoordinates: false })
})

test('apply publishes the resolved config and keeps the card off the settings page', () => {
  const events = {}
  const children = []
  const ctx = {
    effect: fn => { fn(); return () => {} },
    on: (name, listener) => { events[name] = listener; return () => {} },
    inject: (deps, callback) => { children.push({ deps, callback }) },
    get: () => undefined,
    fiber: {},
  }
  host.apply(ctx, {
    rotate: ref(-90), barEdge: ref('top'), barSize: ref(58), scale: ref(1.5),
    contentFontSize: ref(19), autoEnter: ref(false), virtualizeCoordinates: ref(true),
    globalName: ref('__DSH_MOBILE_REMOTE_VIEW__'),
  })

  const table = [{ kind: 'global', name: 'other', value: 1 }]
  events['webserver/index-inject'](table)
  assert.equal(table.length, 2)
  assert.deepEqual(table[1], {
    kind: 'global',
    name: '__DSH_MOBILE_REMOTE_VIEW__',
    value: { rotate: -90, barEdge: 'top', barSize: 58, scale: 1.5, contentFontSize: 19, autoEnter: false, virtualizeCoordinates: true },
  })

  assert.deepEqual(children[0].deps, ['settings'])
  let configured
  const childCtx = {
    effect: fn => { fn(); return () => {} },
    get: name => name === 'settings' ? { configure: presentation => { configured = presentation; return () => {} } } : undefined,
  }
  children[0].callback(childCtx)
  assert.deepEqual(configured, { auto: false })
})

test('apply without a config does nothing', () => {
  const ctx = {
    effect: fn => { fn(); return () => {} },
    on: () => { throw new Error('must not register') },
    inject: () => { throw new Error('must not inject') },
  }
  host.apply(ctx, undefined)
  host.apply(ctx, null)
})

test('a hostile globalName falls back to the compiled one', () => {
  const events = {}
  const ctx = {
    effect: fn => { fn(); return () => {} },
    on: (name, listener) => { events[name] = listener; return () => {} },
    inject: () => {},
    get: () => undefined,
    fiber: {},
  }
  host.apply(ctx, {
    rotate: -90, barEdge: 'top', barSize: 58, scale: 1.5, contentFontSize: 19,
    autoEnter: false, virtualizeCoordinates: true, globalName: 42,
  })
  const table = []
  events['webserver/index-inject'](table)
  assert.equal(table[0].name, '__DSH_MOBILE_REMOTE_VIEW__')
})
