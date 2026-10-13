/**
 * The coordinate layer against a fake browser surface.
 *
 * The fake models only what the layer touches: one element whose visual rect
 * is recorded, pointer prototypes with accessor getters, viewport getters, and
 * the four point-taking document methods. Each patch is checked in both
 * directions — the app answer it returns, and the screen point it hands back —
 * and the disposer restores every original.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const { installCoordinateLayer, rawViewportReader } = await loadModule('client/utils/coordinateLayer.ts')

/** A minimal DOMRect for the fake. */
class FakeRect {
  constructor(left, top, width, height) {
    this.left = left
    this.top = top
    this.width = width
    this.height = height
  }
}
globalThis.DOMRect = FakeRect

const VIEWPORT = { width: 393, height: 873 }
const SCALE = 1.5
const ROTATION = -90

/** Build one fake browser surface with one element. */
function fakeSurface() {
  const visualRect = { left: 0, top: 0, width: 100, height: 50 }
  const elementProto = {
    getBoundingClientRect() { return new FakeRect(visualRect.left, visualRect.top, visualRect.width, visualRect.height) },
    getClientRects() { return [new FakeRect(visualRect.left, visualRect.top, visualRect.width, visualRect.height)] },
  }
  const element = Object.create(elementProto)
  const mouseProto = {}
  Object.defineProperty(mouseProto, 'clientX', { configurable: true, get() { return this.visualX ?? 0 } })
  Object.defineProperty(mouseProto, 'clientY', { configurable: true, get() { return this.visualY ?? 0 } })
  Object.defineProperty(mouseProto, 'pageX', { configurable: true, get() { return this.visualX ?? 0 } })
  Object.defineProperty(mouseProto, 'pageY', { configurable: true, get() { return this.visualY ?? 0 } })

  const calls = []
  const document = {
    elementFromPoint(x, y) { calls.push(['elementFromPoint', x, y]); return 'hit' },
    elementsFromPoint(x, y) { calls.push(['elementsFromPoint', x, y]); return ['hit'] },
    caretRangeFromPoint(x, y) { calls.push(['caretRangeFromPoint', x, y]); return 'range' },
    caretPositionFromPoint(x, y) { calls.push(['caretPositionFromPoint', x, y]); return 'position' },
    documentElement: null,
    body: null,
  }
  const win = {
    innerWidth: VIEWPORT.width,
    innerHeight: VIEWPORT.height,
    Element: { prototype: elementProto },
    MouseEvent: { prototype: mouseProto },
    document,
  }
  return { win, element, visualRect, calls, mouseProto, elementProto, document }
}

test('the layer translates rects, pointers, viewport and hit-testing, and restores', () => {
  const { win, element, calls, mouseProto, document } = fakeSurface()
  const dispose = installCoordinateLayer(win, () => ({ viewport: VIEWPORT, scale: SCALE, rotation: ROTATION }))

  // Element rect: the visual rect's two corners mapped into app space.
  const rect = element.getBoundingClientRect()
  assert.ok(Math.abs(rect.left - (873 - 50) / 1.5) < 1e-9, `left ${rect.left}`)
  assert.ok(Math.abs(rect.top - 0) < 1e-9, `top ${rect.top}`)
  assert.ok(Math.abs(rect.width - 50 / 1.5) < 1e-9, `width ${rect.width}`)
  assert.ok(Math.abs(rect.height - 100 / 1.5) < 1e-9, `height ${rect.height}`)

  // Pointer: a screen point of (clientX=100, clientY=0) is the app point
  // (x=582, y=66.67) — the screen's x feeds the app's y and the screen's y
  // feeds the app's x, mirrored from the height.
  const event = Object.create(mouseProto)
  event.visualX = 100
  event.visualY = 0
  assert.ok(Math.abs(event.clientX - (873 - 0) / 1.5) < 1e-9, 'clientX maps to app x')
  assert.ok(Math.abs(event.clientY - 100 / 1.5) < 1e-9, 'clientY maps to app y')

  // Viewport: window.innerWidth answers the app box's width (873/1.5).
  assert.equal(win.innerWidth, 582)
  assert.equal(win.innerHeight, 262)

  // Hit-testing: an app point is handed back as the visual point.
  document.elementFromPoint(10, 20)
  assert.deepEqual(calls[0], ['elementFromPoint', 20 * SCALE, VIEWPORT.height - 10 * SCALE])

  // Restore: every patched property answers the original value again.
  dispose()
  assert.equal(element.getBoundingClientRect().left, 0)
  assert.equal(win.innerWidth, VIEWPORT.width)
  assert.equal(win.innerHeight, VIEWPORT.height)
  assert.equal(event.clientX, 100)
  document.elementFromPoint(5, 6)
  assert.deepEqual(calls[1], ['elementFromPoint', 5, 6])
})

test('the raw viewport reader keeps the unpatched numbers while the patch is on', () => {
  const { win } = fakeSurface()
  const read = rawViewportReader(win)
  const dispose = installCoordinateLayer(win, () => ({ viewport: VIEWPORT, scale: SCALE, rotation: ROTATION }))
  assert.equal(win.innerWidth, 582)
  assert.deepEqual(read(), { width: 393, height: 873 })
  dispose()
})

test('a surface without the APIs installs and disposes without throwing', () => {
  const win = {
    innerWidth: 393,
    innerHeight: 873,
    Element: { prototype: {} },
    MouseEvent: { prototype: {} },
    document: { documentElement: null, body: null },
  }
  const dispose = installCoordinateLayer(win, () => ({ viewport: VIEWPORT, scale: 1, rotation: 90 }))
  assert.equal(win.innerWidth, 873)
  dispose()
  assert.equal(win.innerWidth, 393)
})
