/**
 * The transient toast: one short sentence at the page's lower edge.
 *
 * A live element is reused while one is showing, so a burst of messages never
 * stacks. Plain DOM in app coordinates; the stylesheet anchors it inside the
 * rotated box.
 */

import { TOAST_ATTRIBUTE } from '../../constants/dom.ts'
import { TOAST_MS } from '../../constants/config.ts'
import { createElement } from '../../utils/dom.ts'

/** One live toast, reused while showing. */
let live: { element: HTMLElement; timer: number } | null = null

/**
 * Show a short message in the middle of the page's lower edge.
 * @param doc - the page's document.
 * @param win - the page's window, for the dismissal timer.
 * @param text - message to show.
 */
export function showToast(doc: Document, win: Window, text: string): void {
  if (live !== null) {
    win.clearTimeout(live.timer)
    live.element.remove()
    live = null
  }
  const node = createElement(doc, 'div', { [TOAST_ATTRIBUTE]: '', role: 'status' }, [text])
  doc.body.append(node)
  const timer = win.setTimeout(() => {
    node.remove()
    if (live?.element === node) live = null
  }, TOAST_MS)
  live = { element: node, timer }
}
