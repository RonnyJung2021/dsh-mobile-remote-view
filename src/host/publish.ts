/**
 * Turning the row's resolved config into what the page receives.
 *
 * Two steps, kept apart because they answer different questions:
 * {@link plainConfig} unwraps the Loader's volatile references, and
 * {@link publishedConfig} decides which fields travel. Both are pure, so the
 * apply path is only wiring.
 */

import { SECTION_FIELDS } from '../constants/config.ts'
import type { MobileViewConfig } from '../types/config.ts'
import { plainValue } from '../utils/volatile.ts'
import type { Config } from './schema.ts'

/**
 * Unwrap the row's volatile fields into the plain config both halves agree on.
 * @param config - the row's validated config.
 * @returns the config with every knob as a plain value.
 */
export function plainConfig(config: Config): MobileViewConfig {
  return {
    rotate: plainValue(config.rotate) as MobileViewConfig['rotate'],
    barEdge: plainValue(config.barEdge) as MobileViewConfig['barEdge'],
    barSize: plainValue(config.barSize) as number,
    scale: plainValue(config.scale) as number,
    contentFontSize: plainValue(config.contentFontSize) as number,
    autoEnter: plainValue(config.autoEnter) as boolean,
    virtualizeCoordinates: plainValue(config.virtualizeCoordinates) as boolean,
  }
}

/**
 * The fields the page receives, and only those.
 *
 * The knobs travel at their resolved value, so the page always receives the
 * effective settings rather than a half-filled object. A field the schema left
 * empty is omitted, so the page keeps its own default for it. Whitelisting the
 * section fields also stops a hand-written patch from smuggling anything
 * unusable into the page.
 * @param config - the resolved values.
 * @returns the value the browser half reads.
 */
export function publishedConfig(config: MobileViewConfig): Record<string, unknown> {
  const published: Record<string, unknown> = {}
  for (const key of SECTION_FIELDS) {
    const value = config[key]
    if (value !== undefined) published[key] = value
  }
  return published
}
