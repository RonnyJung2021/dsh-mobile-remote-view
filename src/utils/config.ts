/**
 * Resolving the page's config: the boot global, the live settings section and
 * the compiled defaults, in that order.
 *
 * The boot global is what the host half published into the index page; the
 * section is what the settings card last saved (it wins where both exist); the
 * defaults are what a page with neither falls back to. Everything here is pure
 * and hostile-input proof: a hand-edited patch or a stale host half can put
 * anything in the global, and each field is narrowed individually.
 */

import { BAR_MAX, BAR_MIN, FONT_DEFAULT, FONT_MAX, FONT_MIN, SCALE_DEFAULT, SCALE_MAX, SCALE_MIN, SECTION_FIELDS, FONT_STEP, SCALE_STEP } from '../constants/config.ts'
import { GLOBAL_NAME } from '../constants/plugin.ts'
import { isBarEdge } from '../enums/barEdge.ts'
import { isRotation } from '../enums/rotation.ts'
import type { MobileViewConfig, MobileViewSection } from '../types/config.ts'

/** Config used when the row published nothing. */
export const DEFAULT_CONFIG: MobileViewConfig = {
  rotate: -90,
  barEdge: 'top',
  barSize: 58,
  scale: SCALE_DEFAULT,
  contentFontSize: FONT_DEFAULT,
  autoEnter: false,
  virtualizeCoordinates: true,
}

/** Defaults for the card's reset control, taken from the plugin's one default table. */
export const SECTION_DEFAULTS: MobileViewSection = {
  rotate: DEFAULT_CONFIG.rotate,
  barEdge: DEFAULT_CONFIG.barEdge,
  barSize: DEFAULT_CONFIG.barSize,
  scale: DEFAULT_CONFIG.scale,
  contentFontSize: DEFAULT_CONFIG.contentFontSize,
  autoEnter: DEFAULT_CONFIG.autoEnter,
  virtualizeCoordinates: DEFAULT_CONFIG.virtualizeCoordinates,
}

/** The knob fields a host half that knows about the card always publishes. */
const PUBLISHED_KEYS: readonly string[] = [...SECTION_FIELDS]

/** Narrow one unknown value to a finite number inside a range. */
function bounded(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(max, Math.max(min, value))
}

/** Narrow one unknown value to a finite positive number. */
function positive(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

/** Whether a value is a plain record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Resolve the config the host published.
 * @param globals - the global object the host wrote to.
 * @returns the resolved config; every field has a default.
 */
export function readConfig(globals: { __DSH_MOBILE_REMOTE_VIEW__?: unknown }): MobileViewConfig {
  const raw = globals[GLOBAL_NAME]
  const source = isRecord(raw) ? raw : {}
  const rotate = isRotation(source.rotate) ? source.rotate : DEFAULT_CONFIG.rotate
  const barEdge = isBarEdge(source.barEdge) ? source.barEdge : DEFAULT_CONFIG.barEdge
  return {
    rotate,
    barEdge,
    barSize: bounded(source.barSize, BAR_MIN, BAR_MAX) ?? DEFAULT_CONFIG.barSize,
    scale: bounded(source.scale, SCALE_MIN, SCALE_MAX) ?? DEFAULT_CONFIG.scale,
    contentFontSize: bounded(source.contentFontSize, FONT_MIN, FONT_MAX) ?? DEFAULT_CONFIG.contentFontSize,
    autoEnter: typeof source.autoEnter === 'boolean' ? source.autoEnter : DEFAULT_CONFIG.autoEnter,
    virtualizeCoordinates: typeof source.virtualizeCoordinates === 'boolean'
      ? source.virtualizeCoordinates
      : DEFAULT_CONFIG.virtualizeCoordinates,
  }
}

/**
 * Whether the boot global came from a host half that publishes the knobs.
 *
 * The browser half is served per artifact revision while the host half only
 * loads with the engine process, so a page can run a newer browser half against
 * an older host half. The older half publishes nothing or a payload without
 * these fields, and that combination has no settings namespace to write to.
 * This flag is how the card tells that case apart from an engine that has no
 * settings service at all, which needs a different sentence.
 * @param globals - the global object the host wrote to.
 * @returns true when at least one knob field is present.
 */
export function hostPublished(globals: { __DSH_MOBILE_REMOTE_VIEW__?: unknown }): boolean {
  const raw = globals[GLOBAL_NAME]
  if (!isRecord(raw)) return false
  return PUBLISHED_KEYS.some(key => key in raw)
}

/**
 * Narrow one form section to the config fields this plugin applies.
 *
 * The section arrives from the host as plain JSON: an older host half, a
 * hand-edited patch, or a value the schema rejected can all put something
 * unexpected here, and every caller treats a missing field as "keep what the
 * boot global said".
 * @param value - the raw section, when the form has one.
 * @returns the fields that are usable, possibly none.
 */
export function sectionOf(value: unknown): Partial<MobileViewSection> {
  if (!isRecord(value)) return {}
  const section: Partial<MobileViewSection> = {}
  if (isRotation(value.rotate)) section.rotate = value.rotate
  if (isBarEdge(value.barEdge)) section.barEdge = value.barEdge
  const barSize = bounded(value.barSize, BAR_MIN, BAR_MAX)
  if (barSize !== undefined) section.barSize = barSize
  const scale = bounded(value.scale, SCALE_MIN, SCALE_MAX)
  if (scale !== undefined) section.scale = scale
  const contentFontSize = bounded(value.contentFontSize, FONT_MIN, FONT_MAX)
  if (contentFontSize !== undefined) section.contentFontSize = contentFontSize
  if (typeof value.autoEnter === 'boolean') section.autoEnter = value.autoEnter
  if (typeof value.virtualizeCoordinates === 'boolean') section.virtualizeCoordinates = value.virtualizeCoordinates
  return section
}

/** Clamp one knob value into the range its popover walks, rounded to 2 decimals. */
export function clampScale(value: number): number {
  return Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, positive(value, SCALE_DEFAULT))) * 100) / 100
}

/** Clamp one font size into the range its popover walks, rounded to an integer. */
export function clampFontSize(value: number): number {
  return Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, positive(value, FONT_DEFAULT))))
}

/** Step the scale one popover notch up or down. */
export function nextScale(current: number, direction: number): number {
  return clampScale(current + direction * SCALE_STEP)
}

/** Step the font size one popover notch up or down. */
export function nextFontSize(current: number, direction: number): number {
  return clampFontSize(current + direction * FONT_STEP)
}
