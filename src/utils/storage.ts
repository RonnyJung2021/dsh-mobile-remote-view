/**
 * The page's two browser stores, and nothing else.
 *
 * `sessionStorage` holds the mode's session state — whether it is on and which
 * page fills the screen — so a refresh restores where the person was while a
 * closed tab starts fresh. `localStorage` holds the local copy of the two
 * knobs the bar edits directly, as the fallback for an engine without a
 * settings transport. A storage that refuses to be read or written is treated
 * as no storage at all: the page still works, it just forgets.
 */

import { PREFS_KEY, SESSION_KEY } from '../constants/plugin.ts'
import { isMobilePage } from '../enums/mobilePage.ts'
import type { SavedState, ViewPrefs } from '../types/config.ts'
import { clampFontSize, clampScale } from './config.ts'

/**
 * Read the saved session state.
 * @param storage - the page's session storage, if it has one.
 * @returns the saved state, or null when nothing usable was stored.
 */
export function readSaved(storage: Storage | undefined): SavedState | null {
  const text = readText(storage, SESSION_KEY)
  if (text === null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const source = parsed as Record<string, unknown>
  if (typeof source.on !== 'boolean') return null
  return {
    on: source.on,
    page: isMobilePage(source.page) ? source.page : 'main',
  }
}

/**
 * Remember the session state. A storage that refuses the write is ignored.
 * @param storage - the page's session storage, if it has one.
 * @param state - the state to remember.
 */
export function writeSaved(storage: Storage | undefined, state: SavedState): void {
  writeText(storage, SESSION_KEY, JSON.stringify(state))
}

/**
 * Read the local copy of the two bar-edited knobs.
 * @param storage - the page's local storage, if it has one.
 * @returns the prefs, or null when nothing usable was stored.
 */
export function readPrefs(storage: Storage | undefined): ViewPrefs | null {
  const text = readText(storage, PREFS_KEY)
  if (text === null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const source = parsed as Record<string, unknown>
  const scale = typeof source.scale === 'number' ? clampScale(source.scale) : null
  const contentFontSize = typeof source.contentFontSize === 'number' ? clampFontSize(source.contentFontSize) : null
  if (scale === null || contentFontSize === null) return null
  return { scale, contentFontSize }
}

/**
 * Remember the local copy of the two bar-edited knobs.
 * @param storage - the page's local storage, if it has one.
 * @param prefs - the values to remember.
 */
export function writePrefs(storage: Storage | undefined, prefs: ViewPrefs): void {
  writeText(storage, PREFS_KEY, JSON.stringify({ scale: clampScale(prefs.scale), contentFontSize: clampFontSize(prefs.contentFontSize) }))
}

/** Read one key as text, swallowing a storage that refuses to be read. */
function readText(storage: Storage | undefined, key: string): string | null {
  if (storage === undefined) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

/** Write one key, swallowing a storage that refuses the write. */
function writeText(storage: Storage | undefined, key: string, value: string): void {
  if (storage === undefined) return
  try {
    storage.setItem(key, value)
  } catch {
    // Ignored on purpose: see the module comment.
  }
}
