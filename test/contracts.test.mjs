/**
 * The shell-seam contracts this plugin binds to.
 *
 * The released engine build and the development source name the session row
 * differently (`data-session-id` versus `data-row-key="session:…"`), and the
 * plugin recognises both; these tests pin the names the rest of the plugin
 * resolves through, so a rename shows up here instead of in a browser.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadModule } from './load-module.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dom = await loadModule('constants/dom.ts')

test('the row contracts are both named, and the released one is the id attribute', () => {
  assert.equal(dom.SHELL_SESSION_ROW, 'data-row-key')
  assert.equal(dom.SHELL_SESSION_PREFIX, 'session:')
  assert.equal(dom.SHELL_SESSION_ID, 'data-session-id')
})

test('the other shell seams the plugin binds to', () => {
  assert.equal(dom.SHELL_SLOT_ANCHOR, 'data-slot')
  assert.equal(dom.SHELL_SIDEBAR_COLLAPSED, 'data-sidebar-collapsed')
  assert.equal(dom.SHELL_WINDOW_DRAG, 'data-window-drag')
  assert.equal(dom.SHELL_RIGHTBAR_OPEN, 'data-sidebar-right-open')
  assert.equal(dom.SHELL_RIGHTBAR_TOGGLE, 'data-sidebar-right-toggle')
  assert.equal(dom.SHELL_COMPOSER_CARD, 'data-composer-card')
  assert.equal(dom.SHELL_APPROVAL_KEY, 'data-approval-key')
})

test('the mode\'s own marks keep the plugin name', () => {
  assert.equal(dom.MODE_ATTRIBUTE, 'data-mobile-remote-view')
  assert.equal(dom.ENTRY_ATTRIBUTE, 'data-mobile-remote-view-entry')
  assert.equal(dom.PAGE_ATTRIBUTE, 'data-mobile-remote-view-page')
  assert.equal(dom.BAR_ATTRIBUTE, 'data-mobile-remote-view-bar')
})

test('the built browser bundle carries both row contracts', () => {
  const code = readFileSync(join(root, 'lib', 'client.js'), 'utf8')
  assert.ok(code.includes('data-session-id'), 'the released row contract survives the build')
  assert.ok(code.includes('data-row-key'), 'the source row contract survives the build')
  // esbuild writes non-ASCII as uppercase \u escapes; 主界面 is the page key's
  // other face, so the destination label survives the build too.
  assert.ok(code.includes('\\u4E3B\\u754C\\u9762'), 'the page key carries its destination face')
})
