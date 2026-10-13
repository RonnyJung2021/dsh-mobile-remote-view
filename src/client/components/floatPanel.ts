/**
 * The value popover: the small +/− panel the two knob keys open.
 *
 * One component serves both knobs — the only difference is which value it
 * edits and how each notch steps it. The popover is plain DOM appended to the
 * control bar's own root, so it lives in app coordinates and is positioned
 * from layout properties (`offsetTop`/`offsetLeft`), never from the
 * virtualised measurement APIs. It opens toward the app box's interior, beside
 * its trigger key, and clamps back into the box when the strip is short.
 */

import type { AppEdge } from '../../enums/barEdge.ts'
import { POPOVER_MINUS_ATTRIBUTE, POPOVER_PLUS_ATTRIBUTE, POPOVER_ATTRIBUTE } from '../../constants/dom.ts'
import { POPOVER_GAP } from '../../constants/config.ts'
import { createElement, icon } from '../../utils/dom.ts'
import { isEndEdge, isHorizontalEdge } from '../../utils/geometry.ts'

/** Which knob a popover edits. */
export type PopoverKind = 'scale' | 'font'

/** What the popover asks for. */
export interface PopoverHandlers {
  /** Step the popover's value one notch. */
  step(kind: PopoverKind, direction: number): void
  /** The value the popover shows. */
  value(kind: PopoverKind): number
  /** How the value is formatted for display. */
  format(kind: PopoverKind, value: number): string
  /** Close the popover. */
  close(): void
}

/** The built popover. */
export interface PopoverView {
  /** The popover element, appended to the bar root. */
  readonly root: HTMLElement
  /** Re-anchor the popover to its trigger key for the current bar edge. */
  place(trigger: HTMLElement, edge: AppEdge): void
  /** Re-read the value it shows, leaving the popover where it is. */
  refresh(): void
  /** Remove the popover from the page. */
  remove(): void
}

/**
 * Build one popover for one knob.
 * @param doc - the page's document.
 * @param kind - which knob it edits.
 * @param handlers - the calls it makes.
 * @returns the popover.
 */
export function createPopover(doc: Document, kind: PopoverKind, handlers: PopoverHandlers): PopoverView {
  const label = kind === 'scale' ? '页面缩放' : '正文字号'
  const root = createElement(doc, 'div', {
    [POPOVER_ATTRIBUTE]: kind,
    role: 'group',
    'aria-label': `${label}调节`,
  })
  const value = createElement(doc, 'span', { 'aria-live': 'polite' }, [handlers.format(kind, handlers.value(kind))])
  const minus = createElement(doc, 'button', {
    type: 'button',
    [POPOVER_MINUS_ATTRIBUTE]: '',
    title: `减小${label}`,
    'aria-label': `减小${label}`,
  }, [icon(doc, 'minus')])
  const plus = createElement(doc, 'button', {
    type: 'button',
    [POPOVER_PLUS_ATTRIBUTE]: '',
    title: `增大${label}`,
    'aria-label': `增大${label}`,
  }, [icon(doc, 'plus')])
  root.append(minus, value, plus)
  root.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    event.preventDefault()
    event.stopPropagation()
    if (target.closest(`button[${POPOVER_MINUS_ATTRIBUTE}]`) !== null) handlers.step(kind, -1)
    else if (target.closest(`button[${POPOVER_PLUS_ATTRIBUTE}]`) !== null) handlers.step(kind, 1)
  })
  const refresh = (): void => { value.textContent = handlers.format(kind, handlers.value(kind)) }

  return {
    root,
    place(trigger: HTMLElement, edge: AppEdge): void {
      const horizontal = isHorizontalEdge(edge)
      const end = isEndEdge(edge)
      const barLength = horizontal
        ? trigger.parentElement?.clientWidth ?? 0
        : trigger.parentElement?.clientHeight ?? 0
      // The strip runs along the box edge; the popover must stay inside the box
      // along that axis, so its offset is clamped to the strip's span.
      const span = horizontal ? trigger.offsetLeft : trigger.offsetTop
      const size = horizontal ? trigger.offsetWidth : trigger.offsetHeight
      const popoverSpan = horizontal ? root.offsetWidth : root.offsetHeight
      const along = Math.max(0, Math.min(barLength - popoverSpan, span - POPOVER_GAP + (size - popoverSpan) / 2))
      const clear = (): void => {
        root.style.removeProperty('left')
        root.style.removeProperty('right')
        root.style.removeProperty('top')
        root.style.removeProperty('bottom')
      }
      clear()
      if (horizontal) {
        root.style.left = `${String(along)}px`
        if (end) root.style.top = `-${String(root.offsetHeight + POPOVER_GAP)}px`
        else root.style.top = `${String(trigger.offsetHeight + POPOVER_GAP)}px`
      } else {
        root.style.top = `${String(along)}px`
        if (end) root.style.right = `${String(trigger.offsetWidth + POPOVER_GAP)}px`
        else root.style.left = `${String(trigger.offsetWidth + POPOVER_GAP)}px`
      }
      refresh()
    },
    refresh,
    remove(): void {
      root.remove()
    },
  }
}
