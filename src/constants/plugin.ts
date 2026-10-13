/**
 * The one identity table every half shares.
 *
 * A loader row, its settings namespace, the host's injected global and the
 * browser's storage keys are all keyed by this one id, so an install, a card
 * write and a page read can never disagree about which plugin they belong to.
 */

/** Bundle package name; also the loader row id and the settings namespace. */
export const PLUGIN_ID = 'dsh-mobile-remote-view'

/** The card's name in 侧栏「插件」. */
export const PLUGIN_DISPLAY_NAME = '手机远程视图'

/** Settings namespace the row's volatile config is served under. */
export const SETTINGS_NAMESPACE = PLUGIN_ID

/** Global the host half writes into every rendered index page. */
export const GLOBAL_NAME = '__DSH_MOBILE_REMOTE_VIEW__'

/** sessionStorage key: whether the mode is on and which page fills the screen. */
export const SESSION_KEY = 'dsh-mobile-remote-view:v1'

/** localStorage key: the local copy of scale and content font size. */
export const PREFS_KEY = 'dsh-mobile-remote-view:prefs'
