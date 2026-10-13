/**
 * The scroll strip: two large keys beside the control bar.
 *
 * The page's own vertical axis runs across the phone's width once the mode is
 * on, so the natural upward or downward swipe scrolls nothing — these two
 * buttons are how a phone moves through a transcript. Plain DOM in app
 * coordinates, so its placement is arithmetic, not a measurement: whichever
 * edge the bar sits on, the strip sits just inside it.
 */

import { SCROLL_ATTRIBUTE, SCROLL_ROOT_ATTRIBUTE } from '../../constants/dom.ts'
import { createElement, icon } from '../../utils/dom.ts'

/** What the scroll pair asks for. */
export interface ScrollHandlers {
  /**
   * Scroll the visible page.
   * @param direction - -1 for up, 1 for down, in the page's own axes.
   */
  scroll(direction: number): void
}

/** The scroll pair. */
export interface ScrollView {
  /** The strip element. */
  readonly root: HTMLElement
}

/**
 * Build the scroll pair.
 * @param doc - the page's document.
 * @param handlers - the scroll action.
 * @returns the strip.
 */
export function createScrollStrip(doc: Document, handlers: ScrollHandlers): ScrollView {
  const root = createElement(doc, 'div', {
    [SCROLL_ROOT_ATTRIBUTE]: '',
    role: 'toolbar',
    'aria-label': '滚动',
  })
  const rows: readonly { action: string; label: string; icon: 'scrollUp' | 'scrollDown'; direction: number }[] = [
    { action: 'scroll:up', label: '上滚', icon: 'scrollUp', direction: -1 },
    { action: 'scroll:down', label: '下滚', icon: 'scrollDown', direction: 1 },
  ]
  for (const row of rows) {
    root.append(createElement(doc, 'button', {
      type: 'button',
      [SCROLL_ATTRIBUTE]: String(row.direction),
      title: row.label,
      'aria-label': row.label,
    }, [icon(doc, row.icon), createElement(doc, 'span', {}, [row.label])]))
  }
  root.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const button = target.closest(`button[${SCROLL_ATTRIBUTE}]`)
    if (button === null) return
    event.preventDefault()
    event.stopPropagation()
    handlers.scroll(Number(button.getAttribute(SCROLL_ATTRIBUTE)))
  })
  return { root }
}
