/**
 * The two dictionaries and the lookup built on them.
 *
 * The half registers both languages with the shell and reads its answer at call
 * time; without the shell it compiles to the browser's own language. Both paths
 * are checked here, plus the invariant that keeps a switch from leaving a key
 * unresolved: the two dictionaries carry exactly the same keys.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { loadModule } from './load-module.mjs'

/** The package's own text files, read from disk rather than through the bundle. */
const shipped = Object.fromEntries(['zh', 'en'].map(locale => [
  locale,
  JSON.parse(readFileSync(new URL(`../locale/${locale}.json`, import.meta.url), 'utf8')),
]))

const { installLocale, subscribeLocale, LOCALE_NAMESPACE } = await loadModule('client/locale.ts')

/** A locale service stand-in that records what the half registers. */
function fakeService() {
  const dictionaries = {}
  let active = 'zh'
  const listeners = new Set()
  return {
    dictionaries,
    setActive(locale) {
      active = locale
      for (const listener of listeners) listener()
    },
    service: {
      register(namespace, locale, dictionary) {
        dictionaries[`${namespace}:${locale}`] = dictionary
        return () => { delete dictionaries[`${namespace}:${locale}`] }
      },
      bind: () => (key, params) => {
        const text = dictionaries[`${LOCALE_NAMESPACE}:${active}`]?.[key]
        if (text === undefined) return key
        return params === undefined
          ? text
          : text.replace(/\{(\w+)\}/g, (whole, name) => (params[name] === undefined ? whole : String(params[name])))
      },
      subscribe(listener) {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
    },
  }
}

/** A context that serves one locale service. */
function fakeContext(service) {
  return { get: () => service, effect: (callback) => { callback() } }
}

test('both languages are registered for this plugin namespace', () => {
  const { dictionaries, service } = fakeService()
  installLocale(fakeContext(service))
  assert.deepEqual(Object.keys(dictionaries).sort(), [`${LOCALE_NAMESPACE}:en`, `${LOCALE_NAMESPACE}:zh`])
  const zh = dictionaries[`${LOCALE_NAMESPACE}:zh`]
  const en = dictionaries[`${LOCALE_NAMESPACE}:en`]
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort(), 'a key missing on one side would fall through on a switch')
  assert.ok(Object.keys(zh).length > 40)
})

test('the package ships one JSON per language, each with its meta block', () => {
  for (const locale of ['zh', 'en']) {
    const doc = shipped[locale]
    assert.equal(typeof doc.meta?.title, 'string', `${locale}.json names the plugin`)
    assert.equal(typeof doc.meta?.description, 'string', `${locale}.json describes it`)
    assert.ok(Object.keys(doc).length > 40, `${locale}.json carries the UI copy`)
  }
  assert.deepEqual(
    Object.keys(shipped.en).sort(),
    Object.keys(shipped.zh).sort(),
    'the two files must carry the same keys',
  )
  assert.notEqual(shipped.zh.meta.title, shipped.en.meta.title)
})

test('the lookup follows the language the shell reports', () => {
  const { dictionaries, service, setActive } = fakeService()
  const t = installLocale(fakeContext(service))
  assert.equal(t('bar.pages.sidebar'), '侧栏')
  assert.equal(t('bar.pages.main'), '主界面')
  setActive('en')
  assert.equal(t('bar.pages.sidebar'), 'Sidebar')
  assert.equal(t('bar.pages.main'), 'Chat')
  assert.equal(dictionaries[`${LOCALE_NAMESPACE}:en`]['bar.exit'], 'Exit')
})

test('placeholders are filled from the params of the call', () => {
  const { service } = fakeService()
  const t = installLocale(fakeContext(service))
  assert.equal(t('bar.scale.title', { percent: 115 }), '页面缩放（当前 115%）')
  assert.equal(t('bar.font.title', { size: 19 }), '正文字号（当前 19px）')
})

test('an unresolved key falls back to the compiled English table instead of the key', () => {
  const service = { ...fakeService().service, bind: () => (key) => key }
  const t = installLocale(fakeContext(service))
  assert.equal(t('card.reset'), 'Reset')
  assert.equal(t('bar.scale.title', { percent: 115 }), 'Zoom (115%)')
  assert.notEqual(t('card.reset'), 'card.reset')
})

test('without the shell the browser language decides', () => {
  const before = globalThis.navigator
  try {
    Object.defineProperty(globalThis, 'navigator', { value: { language: 'en-GB' }, configurable: true })
    const t = installLocale({ get: () => undefined, effect: () => {} })
    assert.equal(t('entry.label'), 'Mobile remote view')
    Object.defineProperty(globalThis, 'navigator', { value: { language: 'zh-Hans-CN' }, configurable: true })
    const zh = installLocale({ get: () => undefined, effect: () => {} })
    assert.equal(zh('entry.label'), '手机远程模式')
  } finally {
    Object.defineProperty(globalThis, 'navigator', { value: before, configurable: true })
  }
})

test('language switches are followed, and a missing service is harmless', () => {
  const { service, setActive } = fakeService()
  let seen = 0
  const off = subscribeLocale(fakeContext(service), () => { seen += 1 })
  setActive('en')
  assert.equal(seen, 1)
  off()
  setActive('zh')
  assert.equal(seen, 1, 'unsubscribing stops the calls')
  assert.equal(typeof subscribeLocale({ get: () => undefined, effect: () => {} }, () => {}), 'function')
})
