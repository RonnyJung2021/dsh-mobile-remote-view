/**
 * The mode's stylesheet.
 *
 * Everything here is scoped to `html[data-mobile-remote-view]`, so the sheet can
 * sit in the page for the whole session and cost nothing while the mode is off.
 * The rules work on the shell's own published seams — `[data-slot="…"]`
 * anchors, `[data-side]`, `[data-composer-card]`, `[data-approval-key]` — plus
 * the marks this plugin puts on the frame and its three columns, never on
 * CSS-module class names, which are build-private.
 *
 * The rotated box is `document.documentElement` itself. That is deliberate: the
 * shell portals menus, tooltips and dialogs into `document.body`, so a
 * transform on anything smaller would leave them unrotated and misplaced.
 */

import { MODE_ATTRIBUTE } from '../constants/dom.ts'

/** Stylesheet text, installed once per page. */
export const STYLES = `
html[${MODE_ATTRIBUTE}] {
  /* Screen size in CSS px; the script refreshes these from the live viewport. */
  --dsh-mrv-vw: 100vw;
  --dsh-mrv-vh: 100vh;
  --dsh-mrv-scale: 1;
  /* Bar thickness, in app px. */
  --dsh-mrv-bar: 58px;
  /* Floor for one bar key measured along the strip. */
  --dsh-mrv-bar-btn: 34px;
  /* The scroll strip beside the bar. */
  --dsh-mrv-tools: 46px;
  /* Conversation and composer text size; the script refreshes it from config. */
  --dsh-mrv-content-font: 19px;
  /* No window chrome band: the desktop window's top strip is not where the
     person is looking any more, and the clearance would pad the rotated page. */
  --dsh-frame-leading-clearance: 0px !important;
  box-sizing: border-box !important;
  width: calc(var(--dsh-mrv-vh) / var(--dsh-mrv-scale)) !important;
  height: calc(var(--dsh-mrv-vw) / var(--dsh-mrv-scale)) !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  overflow: hidden !important;
  overscroll-behavior: none !important;
  -webkit-text-size-adjust: 100%;
  transform-origin: 0 0 !important;
  transform: translateY(var(--dsh-mrv-vh)) rotate(-90deg) scale(var(--dsh-mrv-scale)) !important;
  background: var(--dsw-alias-bg-base, #ffffff) !important;
}

html[${MODE_ATTRIBUTE}][data-mobile-remote-view-rotate="90"] {
  transform: translateX(var(--dsh-mrv-vw)) rotate(90deg) scale(var(--dsh-mrv-scale)) !important;
}

html[${MODE_ATTRIBUTE}] body {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: var(--dsw-alias-bg-base, #ffffff) !important;
}

html[${MODE_ATTRIBUTE}] #root {
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* ---- the frame becomes the app surface, laid out in the rotated box ---- */

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-frame] {
  position: absolute !important;
  inset: 0 !important;
  box-sizing: border-box !important;
  grid-template-columns: minmax(0, 1fr) !important;
  grid-template-rows: minmax(0, 1fr) !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* The bar and the scroll strip reserve one edge; the frame keeps clear of it. */
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="right"] [data-mobile-remote-view-frame] {
  padding-right: calc(var(--dsh-mrv-bar) + var(--dsh-mrv-tools)) !important;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="left"] [data-mobile-remote-view-frame] {
  padding-left: calc(var(--dsh-mrv-bar) + var(--dsh-mrv-tools)) !important;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="top"] [data-mobile-remote-view-frame] {
  padding-top: calc(var(--dsh-mrv-bar) + var(--dsh-mrv-tools)) !important;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="bottom"] [data-mobile-remote-view-frame] {
  padding-bottom: calc(var(--dsh-mrv-bar) + var(--dsh-mrv-tools)) !important;
}

/* One column at a time: the page attribute names the visible one. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-region] {
  display: none !important;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-page="main"] [data-mobile-remote-view-region="center"],
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-page="sidebar"] [data-mobile-remote-view-region="sidebar"],
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-page="rightbar"] [data-mobile-remote-view-region="rightbar"] {
  display: block !important;
  grid-area: 1 / 1 !important;
  min-width: 0 !important;
  min-height: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* Anything else direct in the frame grid is not one of the three columns. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-frame] > :not([data-mobile-remote-view-region]) {
  display: none !important;
}

/* ---- the sidebar page fills the box, and its rows grow for a thumb ----
   The shell sizes its own sidebar with an inline width (260–280px) meant for
   the three-column layout; on the sidebar page that column is the whole screen,
   so the shell's width is overridden rather than respected. The rows are 32–36px
   mouse targets in the desktop layout and become real touch targets here. */

html[${MODE_ATTRIBUTE}][data-mobile-remote-view-page="sidebar"] [data-mobile-remote-view-region="sidebar"] [data-slot="sidebar"] > * {
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box !important;
}

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-region="sidebar"] button,
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-region="sidebar"] [role="treeitem"] {
  min-height: 48px !important;
}

/* The rail keeps its 36px square icons; only the label is dropped. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-region="sidebar"] [data-slot="sidebar"] nav button {
  min-height: 44px !important;
}

/* ---- the control bar and the scroll strip, along one app edge ---- */

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] {
  position: absolute !important;
  z-index: 2147483000;
  display: flex !important;
  box-sizing: border-box !important;
  padding: 3px !important;
  gap: 2px !important;
  margin: 0 !important;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 0.5px solid var(--dsw-alias-border-l3, #00000026);
  font-family: var(--dsw-font-family, sans-serif);
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="right"] [data-mobile-remote-view-bar-root] {
  right: 0; top: 0; width: var(--dsh-mrv-bar); height: 100%;
  flex-direction: column; border-left: none; border-top: none; border-bottom: none;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="left"] [data-mobile-remote-view-bar-root] {
  left: 0; top: 0; width: var(--dsh-mrv-bar); height: 100%;
  flex-direction: column; border-right: none; border-top: none; border-bottom: none;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="top"] [data-mobile-remote-view-bar-root] {
  top: 0; left: 0; width: 100%; height: var(--dsh-mrv-bar);
  flex-direction: row; border-left: none; border-right: none; border-top: none;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="bottom"] [data-mobile-remote-view-bar-root] {
  bottom: 0; left: 0; width: 100%; height: var(--dsh-mrv-bar);
  flex-direction: row; border-left: none; border-right: none; border-bottom: none;
}

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  padding: 1px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #101114);
  font-family: inherit;
  font-size: calc(var(--dsh-mrv-bar-btn) * 0.4);
  font-weight: 500;
  line-height: 1.1;
  cursor: pointer;
  overflow: hidden;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="left"] [data-mobile-remote-view-bar-root] > button,
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="right"] [data-mobile-remote-view-bar-root] > button {
  min-height: var(--dsh-mrv-bar-btn);
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="top"] [data-mobile-remote-view-bar-root] > button,
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="bottom"] [data-mobile-remote-view-bar-root] > button {
  min-width: var(--dsh-mrv-bar-btn);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button[hidden] {
  display: none !important;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button:hover,
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button:focus-visible {
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button[data-mobile-remote-view-active] {
  background: var(--dsw-alias-accent-soft, #e6eefc);
  color: var(--dsw-alias-accent-strong, #1a5bdb);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button[data-mobile-remote-view-danger] {
  color: var(--dsw-alias-danger-strong, #c62828);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button svg {
  width: calc(var(--dsh-mrv-bar-btn) * 0.5);
  height: calc(var(--dsh-mrv-bar-btn) * 0.5);
  display: block;
  flex: none;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button span {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The scroll strip sits just inside the bar, along the same edge. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-scroll-root] {
  position: absolute !important;
  z-index: 2147482990;
  display: flex !important;
  box-sizing: border-box !important;
  gap: 2px !important;
  padding: 2px !important;
  margin: 0 !important;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 0.5px solid var(--dsw-alias-border-l3, #00000026);
  font-family: var(--dsw-font-family, sans-serif);
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="right"] [data-mobile-remote-view-scroll-root] {
  right: var(--dsh-mrv-bar); top: 0; width: var(--dsh-mrv-tools); height: 100%;
  flex-direction: column;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="left"] [data-mobile-remote-view-scroll-root] {
  left: var(--dsh-mrv-bar); top: 0; width: var(--dsh-mrv-tools); height: 100%;
  flex-direction: column;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="top"] [data-mobile-remote-view-scroll-root] {
  top: var(--dsh-mrv-bar); left: 0; width: 100%; height: var(--dsh-mrv-tools);
  flex-direction: row;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="bottom"] [data-mobile-remote-view-scroll-root] {
  bottom: var(--dsh-mrv-bar); left: 0; width: 100%; height: var(--dsh-mrv-tools);
  flex-direction: row;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-scroll-root] > button {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #101114);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-scroll-root] > button:hover {
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-scroll-root] > button svg {
  width: 18px;
  height: 18px;
  display: block;
}

/* ---- the value popovers, beside their trigger keys ---- */

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] {
  position: absolute !important;
  z-index: 2147483010;
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  padding: 6px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 0.5px solid var(--dsw-alias-border-l3, #00000026);
  box-shadow: 0 4px 16px #00000026;
  font-family: var(--dsw-font-family, sans-serif);
  font-size: 14px;
  color: var(--dsw-alias-label-primary, #101114);
  max-height: 200px;
  overflow: auto;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] > span {
  min-width: 56px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] > button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
  color: inherit;
  cursor: pointer;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] > button:hover {
  background: var(--dsw-alias-bg-layer-3, #e8eaee);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] > button svg {
  width: 18px;
  height: 18px;
  display: block;
}

/* ---- the toast ---- */

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-toast] {
  position: absolute !important;
  z-index: 2147483020;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
  max-width: 80%;
  padding: 8px 14px;
  border-radius: 999px;
  background: #000000cc;
  color: #ffffff;
  font-family: var(--dsw-font-family, sans-serif);
  font-size: 13px;
  line-height: 1.3;
  pointer-events: none;
}

/* ---- thumb-sized controls on a phone screen ----
   The two gestures a phone session lives on: sending, and answering an
   approval. Both are 28–32px in the desktop layout, which is a mouse target;
   here they get a real touch target and the text beside them grows with the
   conversation. The composer's own primary button is marked by the script —
   it is the last button in the composer card, and the shell publishes no
   attribute of its own for it. */

/* The shell writes the content font size as an INLINE custom property on the
   body element (its boot script sets it, and the theme presenter rewrites it
   from the setting), and every derived markdown size hangs off it. An inline
   style outranks a plain rule on any ancestor, so the mode's own value is
   applied on the body itself and with !important — that is what makes
   「正文字号」 bite. */
html[${MODE_ATTRIBUTE}] body {
  --dsh-content-font-size: var(--dsh-mrv-content-font) !important;
}
html[${MODE_ATTRIBUTE}] [data-composer-card] button[data-mobile-remote-view-primary] {
  min-width: 48px !important;
  min-height: 48px !important;
  width: 48px !important;
  height: 48px !important;
}
html[${MODE_ATTRIBUTE}] [data-composer-card] button[data-mobile-remote-view-primary] svg {
  width: 22px !important;
  height: 22px !important;
}
html[${MODE_ATTRIBUTE}] [data-approval-key] button {
  min-height: 48px !important;
  font-size: 15px !important;
}

/* ---- what the mode hides ---- */

/* The column resize handle is a mouse affordance; dragging 1px on a phone is
   not a gesture worth keeping. */
html[${MODE_ATTRIBUTE}] [data-side] {
  display: none !important;
}

/* ---- the way in, while the mode is off ----
   A full-width row in the sidebar, between the logo row and the new-session
   button: one icon plus a label, styled from the shell's own tokens. */

/* The mode's own strips are invisible until the mode attribute is on. */
[data-mobile-remote-view-bar-root],
[data-mobile-remote-view-scroll-root] {
  display: none;
}

[data-mobile-remote-view-entry] {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
  padding: 8px 12px;
  /* Clear of the new-session row directly below it. */
  margin: 4px 0 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #101114);
  font-family: var(--dsw-font-family, sans-serif);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
}
[data-mobile-remote-view-entry]:hover,
[data-mobile-remote-view-entry]:focus-visible {
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
}
[data-mobile-remote-view-entry] svg {
  width: 16px;
  height: 16px;
  display: block;
  flex: none;
}

/* In the collapsed rail the shell's own rows are 36px squares; the way in
   follows them: the glyph only, no label, no width the rail does not have. */
[data-sidebar-collapsed] [data-mobile-remote-view-entry],
[data-sidebar-collapsed] [data-mobile-remote-view-entry]:hover {
  width: 36px !important;
  min-width: 36px !important;
  max-width: 36px !important;
  height: 36px !important;
  min-height: 36px !important;
  margin: 4px 0 8px !important;
  padding: 0 !important;
  justify-content: center;
  gap: 0;
  overflow: hidden;
}
[data-sidebar-collapsed] [data-mobile-remote-view-entry] > span:not([aria-hidden]) {
  display: none !important;
}

/* The way in is only shown while the mode is off. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-entry] {
  display: none !important;
}

/* Menus and dialogs are portalled to body, inside the rotated box; a viewport
   unit cap would measure the screen's short side, so keep them inside the app
   box instead. */
html[${MODE_ATTRIBUTE}] [role="menu"],
html[${MODE_ATTRIBUTE}] [role="listbox"],
html[${MODE_ATTRIBUTE}] [role="dialog"] {
  max-width: calc(var(--dsh-mrv-vh) / var(--dsh-mrv-scale)) !important;
  max-height: calc(var(--dsh-mrv-vw) / var(--dsh-mrv-scale)) !important;
}
`

/**
 * Install the mode stylesheet.
 * @param doc - the page's document.
 * @returns the disposer removing the style element.
 */
export function installStyles(doc: Document): () => void {
  const style = doc.createElement('style')
  style.setAttribute('data-mobile-remote-view-styles', '')
  style.textContent = STYLES
  doc.head.append(style)
  return () => { style.remove() }
}
