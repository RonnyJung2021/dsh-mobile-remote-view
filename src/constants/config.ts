/**
 * Every tunable and timing the plugin runs on, in one place.
 *
 * The card, the control bar and the controller all read the same table, so a
 * range changed here is a range changed everywhere. The values are the ones the
 * spec pins: bar 40–120 (default 58), scale 0.6–2.5 (default 1.5), body font
 * 12–27 (default 19), and the settle windows the shell contracts were measured
 * against.
 */

/** Page zoom bounds and default. */
export const SCALE_MIN = 0.6
export const SCALE_MAX = 2.5
export const SCALE_DEFAULT = 1.5
/** One ± step of the bar's scale popover. */
export const SCALE_STEP = 0.05

/** Conversation and composer font size bounds and default, in app pixels. */
export const FONT_MIN = 12
export const FONT_MAX = 27
export const FONT_DEFAULT = 19
/** One ± step of the bar's font popover. */
export const FONT_STEP = 1

/** Control bar thickness bounds and default, in app pixels. */
export const BAR_MIN = 40
export const BAR_MAX = 120
export const BAR_DEFAULT = 58

/** The scroll strip's thickness, in app pixels. */
export const TOOLS_SIZE = 46

/** One bar key's share bounds, in app pixels along the strip. */
export const BAR_KEY_MIN = 12
export const BAR_KEY_MAX = 34
/** Strip insets and gap subtracted before the keys divide the rest. */
export const BAR_PADDING = 6
export const BAR_GAP = 2
/** Kept free so a rounded pixel cannot push the last key out of the strip. */
export const BAR_SLACK = 2

/** Volatile fields of the row's config — exactly what the card edits. */
export const SECTION_FIELDS = [
  'rotate', 'barEdge', 'barSize', 'scale', 'contentFontSize', 'autoEnter', 'virtualizeCoordinates',
] as const

/**
 * How long a sidebar toggle may go without the shell's frame answering before
 * the request is retried; two misses disable sidebar control for the session.
 */
export const SIDEBAR_SETTLE_MS = 400

/** How long the page key waits for `data-sidebar-right-open` to clear after closing. */
export const RIGHTBAR_CLOSE_MS = 1500

/** How often the composer's primary button is re-marked. */
export const MARK_INTERVAL_MS = 700

/**
 * How long after a sidebar tap a change of the shell's selection still counts
 * as that tap's doing (新会话 / 搜索结果 carry no session row key).
 */
export const SIDEBAR_REACTION_MS = 1500

/** Interval and cap of the shell-frame search while the page boots. */
export const FIND_INTERVAL_MS = 250
export const FIND_ATTEMPTS = 40

/** How long a toast stays on screen. */
export const TOAST_MS = 1400

/** Popover gap to its trigger key, in app pixels. */
export const POPOVER_GAP = 4

/** Largest and smallest viewport side a phone remote is expected to present. */
export const VIEWPORT_MIN = 1
