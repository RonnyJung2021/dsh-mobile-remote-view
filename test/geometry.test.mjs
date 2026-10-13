/** The screen ⟷ app math: box, points, rects and the edge mapping, both turns. */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const {
  appBox, appPointFromVisual, visualPointFromApp, appRectFromVisual, appEdgeFromScreenEdge, appEdgeLength,
} = await loadModule('utils/geometry.ts')

/** A phone-sized viewport: 393 wide, 873 tall, at the default 1.5 scale. */
const VIEWPORT = { width: 393, height: 873 }
const SCALE = 1.5

test('app box swaps the screen sides and divides by scale', () => {
  assert.deepEqual(appBox(VIEWPORT, SCALE), { width: 582, height: 262 })
})

test('points round-trip for both rotations', () => {
  for (const rotation of [-90, 90]) {
    for (const point of [{ x: 0, y: 0 }, { x: 393, y: 873 }, { x: 123.5, y: 456.25 }, { x: 393, y: 0 }]) {
      const app = appPointFromVisual(point, VIEWPORT, SCALE, rotation)
      const visual = visualPointFromApp(app, VIEWPORT, SCALE, rotation)
      assert.ok(Math.abs(visual.x - point.x) < 1e-9, `x back for ${rotation}`)
      assert.ok(Math.abs(visual.y - point.y) < 1e-9, `y back for ${rotation}`)
    }
  }
})

test('the -90 mapping pins the screen corners to app corners', () => {
  // Screen top-left (0, 0) is the app top-right corner: the screen's top maps
  // to the app's right, the screen's left maps to the app's top.
  assert.deepEqual(appPointFromVisual({ x: 0, y: 0 }, VIEWPORT, SCALE, -90), { x: 582, y: 0 })
  // Screen top-right (393, 0) is the app bottom-right corner.
  assert.deepEqual(appPointFromVisual({ x: 393, y: 0 }, VIEWPORT, SCALE, -90), { x: 582, y: 262 })
})

test('rects map through both opposite corners, staying normalised', () => {
  const visual = { left: 0, top: 0, width: 100, height: 50 }
  const app = appRectFromVisual(visual, VIEWPORT, SCALE, -90)
  assert.ok(Math.abs(app.left - (873 - 50) / 1.5) < 1e-9)
  assert.ok(Math.abs(app.top - 0) < 1e-9)
  assert.ok(Math.abs(app.width - 50 / 1.5) < 1e-9)
  assert.ok(Math.abs(app.height - 100 / 1.5) < 1e-9)
})

test('screen edges land on the app edges the spec pins', () => {
  // -90: 上→右，下→左，左→上，右→下
  assert.equal(appEdgeFromScreenEdge('top', -90), 'right')
  assert.equal(appEdgeFromScreenEdge('bottom', -90), 'left')
  assert.equal(appEdgeFromScreenEdge('left', -90), 'top')
  assert.equal(appEdgeFromScreenEdge('right', -90), 'bottom')
  // 90: 上→左，下→右，左→下，右→上
  assert.equal(appEdgeFromScreenEdge('top', 90), 'left')
  assert.equal(appEdgeFromScreenEdge('bottom', 90), 'right')
  assert.equal(appEdgeFromScreenEdge('left', 90), 'bottom')
  assert.equal(appEdgeFromScreenEdge('right', 90), 'top')
})

test('edge lengths come from the box the edge runs along', () => {
  const box = { width: 582, height: 262 }
  assert.equal(appEdgeLength(box, 'top'), 582)
  assert.equal(appEdgeLength(box, 'left'), 262)
})
