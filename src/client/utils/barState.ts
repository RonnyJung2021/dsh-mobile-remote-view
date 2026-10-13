/**
 * The pure decisions behind the control bar's faces.
 *
 * Which label the page key carries, what every key does and when a key counts
 * as "in effect" are plain functions of one state object, so the controller
 * only ever passes state in and the tests never need a DOM to check the rules.
 */

import type { IconName } from '../../utils/dom.ts'
import type { MobilePage } from '../../enums/mobilePage.ts'
import type { TextKey, Translate } from '../locale.ts'

/** The two faces the one page key can wear. */
export type PageKeyFace = 'sidebar' | 'main' | 'closeRightbar'

/** The actions a bar key dispatches. */
export type BarKeyAction = 'fullscreen' | 'pages' | 'closeRightbar' | 'scale' | 'font' | 'flip' | 'exit'

/** Everything the bar's faces are derived from. */
export interface BarState {
  /** Region currently filling the screen. */
  readonly page: MobilePage
  /** Whether a right panel is expanded and reachable. */
  readonly rightbarAvailable: boolean
  /** Whether the app window is filling the screen right now. */
  readonly fullscreen: boolean
  /** Whether this document can go fullscreen at all. */
  readonly fullscreenAvailable: boolean
  /** Which popover is showing, if any. */
  readonly popoverOpen: 'scale' | 'font' | null
  /** Content scale in force, for the popover's display. */
  readonly scale: number
  /** Content font size in force, for the popover's display. */
  readonly contentFontSize: number
}

/**
 * The page key's action for one state.
 *
 * While a right panel is open the key only closes it (the sidebar page is
 * unreachable until then); otherwise it toggles the everyday pair.
 * @param state - the mode's state.
 * @returns what clicking the key does.
 */
export function pageKeyAction(state: BarState): 'pages' | 'closeRightbar' {
  return state.rightbarAvailable ? 'closeRightbar' : 'pages'
}

/**
 * The page key's label: it names where a tap goes, not where the person is,
 * so the strip reads as a list of destinations.
 * @param state - the mode's state.
 * @param t - text lookup for the active language.
 * @returns the label to show.
 */
export function pageKeyLabel(state: BarState, t: Translate): string {
  return t(pageKeyTextKey(state))
}

/**
 * The key the page key's label comes from.
 * @param state - the mode's state.
 * @returns the text key for the face currently in effect.
 */
export function pageKeyTextKey(state: BarState): TextKey {
  if (state.rightbarAvailable) return 'bar.pages.closeRightbar'
  return state.page === 'main' ? 'bar.pages.sidebar' : 'bar.pages.main'
}

/**
 * The key the page key's tooltip comes from.
 * @param state - the mode's state.
 * @returns the text key for the face currently in effect.
 */
export function pageKeyTitleKey(state: BarState): TextKey {
  if (state.rightbarAvailable) return 'bar.pages.title.closeRightbar'
  return state.page === 'main' ? 'bar.pages.title.sidebar' : 'bar.pages.title.main'
}

/** The page key's icon for one state. */
export function pageKeyIcon(state: BarState): IconName {
  if (state.rightbarAvailable) return 'closeRightbar'
  return state.page === 'main' ? 'sidebar' : 'conversation'
}

/**
 * Whether the page key counts as "in effect" right now.
 * @param state - the mode's state.
 * @returns true while a right panel is open — the key's active face.
 */
export function pageKeyActive(state: BarState): boolean {
  return state.rightbarAvailable
}
