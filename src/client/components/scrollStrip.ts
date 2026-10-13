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
import type { Translate } from '../locale.ts'

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
  /** Re-read the labels of the active language. */
  refresh(): void
}

/**
 * Build the scroll pair.
 * @param doc - the page's document.
 * @param t - text lookup for the active language.
 * @param handlers - the scroll action.
 * @returns the strip.
 */
export function createScrollStrip(doc: Document, t: Translate, handlers: ScrollHandlers): ScrollView {
  const root = createElement(doc, 'div', {
    [SCROLL_ROOT_ATTRIBUTE]: '',
    role: 'toolbar',
    'aria-label': t('strip.aria'),
  })
  const rows: readonly { action: string; textKey: 'strip.up' | 'strip.down'; icon: 'scrollUp' | 'scrollDown'; direction: number }[] = [
    { action: 'scroll:up', textKey: 'strip.up', icon: 'scrollUp', direction: -1 },
    { action: 'scroll:down', textKey: 'strip.down', icon: 'scrollDown', direction: 1 },
  ]
  const labels: HTMLElement[] = []
  const keys: HTMLButtonElement[] = []
  for (const row of rows) {
    const label = t(row.textKey)
    const span = createElement(doc, 'span', {}, [label])
    const button = createElement(doc, 'button', {
      type: 'button',
      [SCROLL_ATTRIBUTE]: String(row.direction),
      title: label,
      'aria-label': label,
    }, [icon(doc, row.icon), span])
    keys.push(button)
    labels.push(span)
    root.append(button)
  }

  /** Re-read the labels after a language switch. */
  const refresh = (): void => {
    rows.forEach((row, index) => {
      const label = t(row.textKey)
      const button = keys[index]
      const span = labels[index]
      if (button !== undefined) {
        button.title = label
        button.setAttribute('aria-label', label)
      }
      if (span !== undefined) span.textContent = label
    })
    root.setAttribute('aria-label', t('strip.aria'))
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
  return { root, refresh }
}
