/**
 * The way in while the mode is off: a full-width row in the sidebar.
 *
 * The button sits in its own row between the shell's logo row and the
 * new-session button, styled like the new-session row: horizontal, one icon
 * plus a label. The plugin gives the shell no extension point; the browser half
 * inserts the node itself and keeps it there across the shell's re-renders,
 * deduplicating by the entry attribute.
 */

import { ENTRY_ATTRIBUTE, SHELL_WINDOW_DRAG } from '../../constants/dom.ts'
import { createElement, icon } from '../../utils/dom.ts'
import type { Translate } from '../locale.ts'

/** The built entry button. */
export interface EntryView {
  /** The button element; attached once the shell's sidebar root exists. */
  readonly root: HTMLElement
  /** Insert or re-insert the button into the shell's current sidebar. */
  ensureIn(sidebarRoot: HTMLElement): void
  /** Remove the button from the page. */
  remove(): void
  /** Re-read the label of the active language. */
  refresh(): void
}

/**
 * Build the entry button.
 * @param doc - the page's document.
 * @param t - text lookup for the active language.
 * @param onEnter - invoked when the button is activated.
 * @returns the button and its placement helpers.
 */
export function createEntryButton(doc: Document, t: Translate, onEnter: () => void): EntryView {
  const label = createElement(doc, 'span', {}, [t('entry.label')])
  const root = createElement(doc, 'button', {
    type: 'button',
    [ENTRY_ATTRIBUTE]: '',
    title: t('entry.enter'),
    'aria-label': t('entry.enter'),
  }, [icon(doc, 'phone'), label])
  root.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    onEnter()
  })

  /**
   * Put the button in its spot, or keep it there.
   *
   * The spot is immediately after the last element carrying the shell's
   * window-drag mark inside the sidebar root — the logo row on every platform —
   * which lands between the logo row and the new-session button. A missing mark
   * falls back to the root's first position.
   * @param sidebarRoot - the shell's current sidebar root.
   */
  const ensureIn = (sidebarRoot: HTMLElement): void => {
    const marks = sidebarRoot.querySelectorAll(`[${SHELL_WINDOW_DRAG}]`)
    const anchor = marks[marks.length - 1]
    if (anchor instanceof HTMLElement && anchor !== root) {
      const after = anchor.nextElementSibling
      if (after !== root) sidebarRoot.insertBefore(root, after)
    } else if (!(anchor instanceof HTMLElement)) {
      if (sidebarRoot.firstElementChild !== root) sidebarRoot.insertBefore(root, sidebarRoot.firstElementChild)
    }
  }

  return {
    root,
    refresh(): void {
      label.textContent = t('entry.label')
      root.title = t('entry.enter')
      root.setAttribute('aria-label', t('entry.enter'))
    },
    ensureIn,
    remove(): void {
      root.remove()
    },
  }
}
