/**
 * The mode stylesheet: the layout and touch rules that were fixed in the field
 * (the sidebar page filling the box, rows growing to a thumb, the rail-sized
 * way in) stay pinned here.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const { STYLES } = await loadModule('client/styles.ts')

test('the sidebar page fills the rotated box, overriding the shell width', () => {
  assert.ok(STYLES.includes('[data-mobile-remote-view-page="sidebar"] [data-mobile-remote-view-region="sidebar"] [data-slot="sidebar"] > *'))
  assert.ok(/width:\s*100%\s*!important/.test(STYLES))
})

test('the sidebar rows are touch-sized inside the mode', () => {
  assert.ok(STYLES.includes('[data-mobile-remote-view-region="sidebar"] [role="treeitem"]'))
  assert.ok(STYLES.includes('min-height: 48px !important'))
  assert.ok(STYLES.includes('min-height: 44px !important'))
})

test('the way in adapts to the collapsed rail', () => {
  assert.ok(STYLES.includes('[data-sidebar-collapsed] [data-mobile-remote-view-entry]'))
  assert.ok(STYLES.includes('[data-sidebar-collapsed] [data-mobile-remote-view-entry] > span:not([aria-hidden])'))
  assert.ok(STYLES.includes('width: 36px !important'))
  assert.ok(STYLES.includes('margin: 4px 0 8px'), 'the way in keeps clear of the new-session row')
})

test('the rotated shell keeps its frame rules', () => {
  assert.ok(STYLES.includes('transform: translateY(var(--dsh-mrv-vh)) rotate(-90deg) scale(var(--dsh-mrv-scale)) !important'))
  assert.ok(STYLES.includes('transform: translateX(var(--dsh-mrv-vw)) rotate(90deg) scale(var(--dsh-mrv-scale)) !important'))
  assert.ok(STYLES.includes('grid-template-columns: minmax(0, 1fr) !important'))
})

test('the rails the mode reserves are the ones the script measures', () => {
  assert.ok(STYLES.includes('--dsh-mrv-bar: 58px'))
  assert.ok(STYLES.includes('--dsh-mrv-tools: 46px'))
  assert.ok(STYLES.includes('--dsh-mrv-bar-btn: 34px'))
})

test('the content font size lands on the body, where the shell writes it inline', () => {
  // The shell sets --dsh-content-font-size as an inline property on body, so a
  // rule on `html` would never win; this is the seam that makes 正文字号 bite.
  assert.ok(STYLES.includes('html[data-mobile-remote-view] body {'))
  assert.ok(STYLES.includes('--dsh-content-font-size: var(--dsh-mrv-content-font) !important'))
})
