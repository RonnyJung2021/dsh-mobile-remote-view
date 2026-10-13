/** Resolving the boot global and narrowing the settings section. */

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadModule } from './load-module.mjs'

const {
  DEFAULT_CONFIG, SECTION_DEFAULTS, readConfig, hostPublished, sectionOf, nextScale, nextFontSize, clampScale, clampFontSize,
} = await loadModule('utils/config.ts')

const GLOBAL = '__DSH_MOBILE_REMOTE_VIEW__'

test('an absent global falls back to the compiled defaults', () => {
  assert.deepEqual(readConfig({}), DEFAULT_CONFIG)
  assert.deepEqual(readConfig({ [GLOBAL]: null }), DEFAULT_CONFIG)
})

test('a hostile global narrows field by field', () => {
  const config = readConfig({ [GLOBAL]: {
    rotate: 180,
    barEdge: 'up',
    barSize: '58',
    scale: 99,
    contentFontSize: -3,
    autoEnter: 'yes',
    virtualizeCoordinates: 1,
  } })
  assert.deepEqual(config, {
    rotate: -90,          // not one of the two turns → default
    barEdge: 'left',      // not one of the four edges → default
    barSize: 58,          // not a number → default
    scale: 2.5,           // out of range → clamped to the ceiling
    contentFontSize: 12,  // out of range → clamped to the floor
    autoEnter: false,     // not a boolean → default
    virtualizeCoordinates: true, // not a boolean → default
  })
})

test('a full global is read as-is', () => {
  const published = {
    rotate: 90, barEdge: 'left', barSize: 80, scale: 2, contentFontSize: 24, autoEnter: true, virtualizeCoordinates: false,
  }
  const config = readConfig({ [GLOBAL]: published })
  assert.deepEqual(config, published)
})

test('values out of range are clamped to the schema bounds', () => {
  const config = readConfig({ [GLOBAL]: { barSize: 9, scale: 0.1, contentFontSize: 500 } })
  assert.equal(config.barSize, 40)
  assert.equal(config.scale, 0.6)
  assert.equal(config.contentFontSize, 27)
})

test('hostPublished sees the knob fields and nothing else', () => {
  assert.equal(hostPublished({}), false)
  assert.equal(hostPublished({ [GLOBAL]: { rotate: -90 } }), true)
  assert.equal(hostPublished({ [GLOBAL]: { other: 1 } }), false)
})

test('sectionOf narrows a hostile section to nothing and a real one to its fields', () => {
  assert.deepEqual(sectionOf(null), {})
  assert.deepEqual(sectionOf({ rotate: 123, barEdge: 5, barSize: 'x' }), {})
  assert.deepEqual(sectionOf({ rotate: 90, barEdge: 'right', barSize: 100, scale: 2.5, contentFontSize: 27, autoEnter: true, virtualizeCoordinates: false }), {
    rotate: 90, barEdge: 'right', barSize: 100, scale: 2.5, contentFontSize: 27, autoEnter: true, virtualizeCoordinates: false,
  })
})

test('the card reset table equals the compiled defaults', () => {
  assert.deepEqual(SECTION_DEFAULTS, DEFAULT_CONFIG)
})

test('the popover steps walk their ranges and clamp at the ends', () => {
  assert.equal(nextScale(1.5, 1), 1.55)
  assert.equal(nextScale(1.5, -1), 1.45)
  assert.equal(nextScale(2.5, 1), 2.5)
  assert.equal(nextScale(0.6, -1), 0.6)
  assert.equal(nextFontSize(19, 1), 20)
  assert.equal(nextFontSize(27, 1), 27)
  assert.equal(nextFontSize(12, -1), 12)
  assert.equal(clampScale(1.234), 1.23)
  assert.equal(clampFontSize(18.6), 19)
})
