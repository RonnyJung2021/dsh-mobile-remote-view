/**
 * Finding the shell's three columns and the sidebar's seams.
 *
 * Regions are found through the shell's published anchors — every slot render
 * site carries `[data-slot="<key>"]`, and each column's own wrapper is that
 * anchor's parent. Those anchors are part of the renderer's documented surface;
 * the CSS-module class names beside them are private to the build and are never
 * matched here.
 */

import {
  FRAME_ATTRIBUTE, REGION_ATTRIBUTE,
  SHELL_OVERLAY, SHELL_SIDEBAR_COLLAPSED, SHELL_SLOT_ANCHOR, SHELL_WINDOW_DRAG,
} from '../../constants/dom.ts'

/** The frame and its three columns, as found in the shell's DOM. */
export interface Regions {
  /** The shell's root frame element. */
  readonly frame: HTMLElement
  /** Left column wrapper, holding the sidebar. */
  readonly sidebar: HTMLElement | null
  /** Centre column wrapper, holding the conversation or the selected panel. */
  readonly center: HTMLElement | null
  /** Right column wrapper, holding the right panel. */
  readonly rightbar: HTMLElement | null
}

/**
 * Locate the frame and its columns.
 * @param doc - the page's document.
 * @returns the regions, or null while the shell has not rendered its frame yet.
 */
export function findRegions(doc: Document): Regions | null {
  const main = doc.querySelector(`[${SHELL_SLOT_ANCHOR}="main"]`)
  const center = main?.parentElement ?? null
  const frame = center?.parentElement ?? null
  if (frame === null) return null
  // The inline track template is what makes the frame the frame: it is set by
  // the shell's own grid solve on every render, so its presence distinguishes
  // the real column wrapper from an unrelated div that happened to match first.
  if (!looksLikeFrame(frame)) return null
  return {
    frame,
    sidebar: doc.querySelector(`[${SHELL_SLOT_ANCHOR}="sidebar"]`)?.parentElement ?? null,
    center,
    rightbar: doc.querySelector(`[${SHELL_SLOT_ANCHOR}="rightbar"]`)?.parentElement ?? null,
  }
}

/**
 * Decide whether an element is the shell's frame.
 * @param element - candidate element.
 * @returns true when the element carries the frame's own published facts.
 */
function looksLikeFrame(element: HTMLElement): boolean {
  if (element.style.gridTemplateColumns !== '') return true
  return element.hasAttribute(SHELL_SIDEBAR_COLLAPSED)
    || element.hasAttribute('data-rightbar-collapsed')
    || element.querySelector(`[${SHELL_OVERLAY}]`) !== null
}

/**
 * Mark the frame and each column the stylesheet keys on.
 * @param regions - the located regions.
 */
export function markRegions(regions: Regions): void {
  regions.frame.setAttribute(FRAME_ATTRIBUTE, '')
  if (regions.sidebar !== null) regions.sidebar.setAttribute(REGION_ATTRIBUTE, 'sidebar')
  if (regions.center !== null) regions.center.setAttribute(REGION_ATTRIBUTE, 'center')
  if (regions.rightbar !== null) regions.rightbar.setAttribute(REGION_ATTRIBUTE, 'rightbar')
}

/**
 * The sidebar shell root: the element holding the logo row, the new-session
 * button and the panel list. It is the shell entry's first child inside the
 * sidebar slot anchor.
 * @param doc - the page's document.
 * @returns the sidebar root, or null while the shell has not rendered it.
 */
export function sidebarRootOf(doc: Document): HTMLElement | null {
  const anchor = doc.querySelector(`[${SHELL_SLOT_ANCHOR}="sidebar"]`)
  const root = anchor?.firstElementChild
  return root instanceof HTMLElement ? root : null
}

/**
 * The row the entry button is inserted after: the last element carrying the
 * shell's window-drag mark inside the sidebar root — the logo row on every
 * platform. Inserting after it lands between the logo row and the new-session
 * button, which is the spec's spot.
 * @param root - the sidebar shell root.
 * @returns the anchor, or null when the shell's mark is absent.
 */
export function entryAnchorOf(root: HTMLElement): HTMLElement | null {
  const marks = root.querySelectorAll(`[${SHELL_WINDOW_DRAG}]`)
  const last = marks[marks.length - 1]
  return last instanceof HTMLElement ? last : null
}
