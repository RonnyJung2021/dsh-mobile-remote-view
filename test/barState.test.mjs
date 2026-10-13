/** The page key's faces: which label, icon and action one state renders. */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const { pageKeyAction, pageKeyLabel, pageKeyIcon, pageKeyActive } = await loadModule('client/utils/barState.ts')

/** One state with the everyday defaults. */
function state(overrides = {}) {
  return {
    page: 'main', rightbarAvailable: false, fullscreen: false, fullscreenAvailable: true,
    popoverOpen: null, scale: 1.5, contentFontSize: 19, ...overrides,
  }
}

test('on the main page the key invites to the sidebar', () => {
  assert.equal(pageKeyAction(state()), 'pages')
  assert.equal(pageKeyLabel(state()), '侧栏')
  assert.equal(pageKeyIcon(state()), 'sidebar')
  assert.equal(pageKeyActive(state()), false)
})

test('on the sidebar page the key invites back to the main page', () => {
  assert.equal(pageKeyLabel(state({ page: 'sidebar' })), '主界面')
  assert.equal(pageKeyIcon(state({ page: 'sidebar' })), 'conversation')
})

test('a right panel open takes the key over: it only closes', () => {
  for (const page of ['main', 'sidebar', 'rightbar']) {
    const s = state({ page, rightbarAvailable: true })
    assert.equal(pageKeyAction(s), 'closeRightbar')
    assert.equal(pageKeyLabel(s), '关闭右栏')
    assert.equal(pageKeyIcon(s), 'closeRightbar')
    assert.equal(pageKeyActive(s), true)
  }
})
