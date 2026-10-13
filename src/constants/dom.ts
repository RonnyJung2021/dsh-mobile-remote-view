/**
 * The DOM seam names the plugin reads and writes.
 *
 * Everything the plugin touches is one of two kinds: an attribute the shell
 * publishes (and the plugin only reads), or a mark the plugin owns (and styles
 * or debounces by). Both are plain strings here so the stylesheet, the
 * controller and the tests can never spell one differently.
 */

/** Root attribute marking the mode is on, set on `document.documentElement`. */
export const MODE_ATTRIBUTE = 'data-mobile-remote-view'

/** Root attribute carrying `90` when the rotation is clockwise; absent means -90. */
export const ROTATE_ATTRIBUTE = 'data-mobile-remote-view-rotate'

/** Root attribute naming the page filling the screen: main | sidebar | rightbar. */
export const PAGE_ATTRIBUTE = 'data-mobile-remote-view-page'

/** Root attribute naming the app edge the bar sits on: top | bottom | left | right. */
export const BAR_ATTRIBUTE = 'data-mobile-remote-view-bar'

/** Root attribute `yes` while a right panel is expanded and reachable. */
export const HAS_RIGHTBAR_ATTRIBUTE = 'data-mobile-remote-view-has-rightbar'

/** Marks the shell frame element the three columns sit in. */
export const FRAME_ATTRIBUTE = 'data-mobile-remote-view-frame'

/** Marks one column; value is `sidebar`, `center` or `rightbar`. */
export const REGION_ATTRIBUTE = 'data-mobile-remote-view-region'

/** The sidebar entry button; present exactly once while the mode is off. */
export const ENTRY_ATTRIBUTE = 'data-mobile-remote-view-entry'

/** The control bar strip. */
export const BAR_ROOT_ATTRIBUTE = 'data-mobile-remote-view-bar-root'

/** One bar key; value names the action it dispatches. */
export const BAR_ACTION_ATTRIBUTE = 'data-mobile-remote-view-action'

/** Marks the danger key (退出). */
export const BAR_DANGER_ATTRIBUTE = 'data-mobile-remote-view-danger'

/** Marks the key whose state is currently in effect. */
export const BAR_ACTIVE_ATTRIBUTE = 'data-mobile-remote-view-active'

/** The scroll strip beside the bar. */
export const SCROLL_ROOT_ATTRIBUTE = 'data-mobile-remote-view-scroll-root'

/** One scroll key; value is 1 for down, -1 for up. */
export const SCROLL_ATTRIBUTE = 'data-mobile-remote-view-scroll'

/** A scale/font popover; value is `scale` or `font`. */
export const POPOVER_ATTRIBUTE = 'data-mobile-remote-view-popover'

/** A popover's minus key. */
export const POPOVER_MINUS_ATTRIBUTE = 'data-mobile-remote-view-popover-minus'

/** A popover's plus key. */
export const POPOVER_PLUS_ATTRIBUTE = 'data-mobile-remote-view-popover-plus'

/** The transient toast. */
export const TOAST_ATTRIBUTE = 'data-mobile-remote-view-toast'

/** Marks the composer's primary (send/stop) button for the stylesheet. */
export const PRIMARY_ATTRIBUTE = 'data-mobile-remote-view-primary'

/** CSS custom properties the script refreshes from the live viewport and config. */
export const CSS_VAR_VIEWPORT_W = '--dsh-mrv-vw'
export const CSS_VAR_VIEWPORT_H = '--dsh-mrv-vh'
export const CSS_VAR_SCALE = '--dsh-mrv-scale'
export const CSS_VAR_BAR = '--dsh-mrv-bar'
export const CSS_VAR_BAR_KEY = '--dsh-mrv-bar-btn'
export const CSS_VAR_TOOLS = '--dsh-mrv-tools'
export const CSS_VAR_FONT = '--dsh-mrv-content-font'

/** Shell-published attributes the plugin reads, never writes. */
export const SHELL_SLOT_ANCHOR = 'data-slot'
export const SHELL_SIDEBAR_COLLAPSED = 'data-sidebar-collapsed'
export const SHELL_WINDOW_DRAG = 'data-window-drag'
export const SHELL_RIGHTBAR_OPEN = 'data-sidebar-right-open'
export const SHELL_RIGHTBAR_TOGGLE = 'data-sidebar-right-toggle'
export const SHELL_SESSION_ROW = 'data-row-key'
export const SHELL_SESSION_PREFIX = 'session:'
/**
 * The released build marks a session row with its own id (`data-session-id`)
 * rather than a row key; both contracts are recognised.
 */
export const SHELL_SESSION_ID = 'data-session-id'
export const SHELL_RESIZE_HANDLE = 'data-side'
export const SHELL_COMPOSER_CARD = 'data-composer-card'
export const SHELL_APPROVAL_KEY = 'data-approval-key'
export const SHELL_OVERLAY = 'data-shell-overlay'
