/**
 * The small DOM helpers every control is built from.
 *
 * The bar, the scroll strip, the popovers, the entry button and the toast are
 * plain DOM built imperatively — no React, no platform module — so the browser
 * half has nothing to import and cannot be disturbed by the shell's renderer
 * re-rendering around it. The icons are one shared table of stroke paths, sized
 * by the stylesheet.
 */

/** The icon names the controls use. */
export type IconName =
  | 'fullscreen' | 'sidebar' | 'conversation' | 'closeRightbar'
  | 'scale' | 'font' | 'flip' | 'exit'
  | 'scrollUp' | 'scrollDown'
  | 'minus' | 'plus' | 'phone'

/** One icon's SVG body, drawn in a 24×24 viewBox with `currentColor`. */
const ICON_PATHS: Record<IconName, string> = {
  fullscreen: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>',
  sidebar: '<path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm5-1v16"/>',
  conversation: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H12l-5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8z"/>',
  closeRightbar: '<path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M3 4h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/>',
  scale: '<path d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 3v6m-3-3h6M14.5 14.5 20 20"/>',
  font: '<path d="M5 20 9.5 7h5L19 20m-8.6-5h7.2M12 7v-1"/>',
  flip: '<path d="M5 7a8 8 0 0 1 14 0M19 17a8 8 0 0 1-14 0M19 3v4h-4M5 17v4h4"/>',
  exit: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M14 8l4 4-4 4M10 12h8"/>',
  scrollUp: '<path d="M6 15l6-6 6 6"/>',
  scrollDown: '<path d="M6 9l6 6 6-6"/>',
  minus: '<path d="M6 12h12"/>',
  plus: '<path d="M12 6v12M6 12h12"/>',
  phone: '<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 15h4"/>',
}

/**
 * Build one element with attributes and children.
 * @param doc - the document to create in.
 * @param tag - the element name.
 * @param attrs - string attributes; the empty string marks a boolean attribute.
 * @param children - child nodes or text.
 * @returns the element, already carrying its children.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag)
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  for (const child of children) {
    node.append(typeof child === 'string' ? doc.createTextNode(child) : child)
  }
  return node
}

/**
 * Build one icon as an inline SVG inside a span.
 * @param doc - the document to create in.
 * @param name - which icon to draw.
 * @returns the span; the stylesheet sizes it from its parent key.
 */
export function icon(doc: Document, name: IconName): HTMLElement {
  const body = ICON_PATHS[name]
  const span = createElement(doc, 'span', { 'aria-hidden': 'true' })
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  return span
}
