/** The enum guards: accept every member, refuse everything else. */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const { isMobilePage } = await loadModule('enums/mobilePage.ts')
const { isRotation } = await loadModule('enums/rotation.ts')
const { isBarEdge } = await loadModule('enums/barEdge.ts')

test('isMobilePage accepts the three pages', () => {
  for (const page of ['main', 'sidebar', 'rightbar']) assert.equal(isMobilePage(page), true)
  for (const bad of ['', 'left', 1, null, undefined, {}, 'Main']) assert.equal(isMobilePage(bad), false)
})

test('isRotation accepts only the two turns', () => {
  assert.equal(isRotation(-90), true)
  assert.equal(isRotation(90), true)
  for (const bad of [0, 180, '-90', null, undefined]) assert.equal(isRotation(bad), false)
})

test('isBarEdge accepts the four screen edges', () => {
  for (const edge of ['top', 'bottom', 'left', 'right']) assert.equal(isBarEdge(edge), true)
  for (const bad of ['', 'up', 1, null, undefined, {}]) assert.equal(isBarEdge(bad), false)
})
