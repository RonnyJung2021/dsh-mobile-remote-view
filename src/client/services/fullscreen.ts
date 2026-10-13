/**
 * The page's own fullscreen face: one tap gives the window the whole screen.
 *
 * Nothing here is specific to mobile mode — the face is built from the document
 * it is given — but only mobile mode offers a key for it. Two different
 * failures are told apart, because they need different sentences: a document
 * that has no `requestFullscreen` at all cannot ever do this (iOS Safari refuses
 * element fullscreen), while a refusal is the environment saying no *this time*.
 */

import type { FullscreenResult } from '../../enums/fullscreenResult.ts'

/** The page's fullscreen capability, as this plugin uses it. */
export interface FullscreenFace {
  /** Whether a fullscreen element is showing right now. */
  isOn(): boolean
  /** Whether this document can ask for fullscreen at all. */
  isSupported(): boolean
  /** Ask for fullscreen, or leave it. */
  toggle(): Promise<FullscreenResult>
  /**
   * Observe fullscreen changes; the browser can also leave fullscreen on its own
   * (Esc, the window's own control), so the key's face cannot be driven by the
   * tap alone.
   * @param listener - invoked after each change.
   * @returns the disposer removing the listener.
   */
  subscribe(listener: () => void): () => void
}

/** The one element the plugin ever asks for; `documentElement` is the rotated box. */
type FullscreenElement = HTMLElement & { requestFullscreen?: () => Promise<void> }

/** The document, narrowed to the two methods the standard API puts on it. */
type FullscreenDocument = Document & { exitFullscreen?: () => Promise<void> }

/**
 * Build the face for one document.
 * @param doc - the page's document.
 * @returns the face; every call is safe on a document without the API.
 */
export function fullscreenFace(doc: Document): FullscreenFace {
  const element = doc.documentElement as FullscreenElement
  const full = doc as FullscreenDocument
  return {
    isOn: () => doc.fullscreenElement !== null,
    isSupported: () => typeof element.requestFullscreen === 'function',
    async toggle(): Promise<FullscreenResult> {
      try {
        if (doc.fullscreenElement !== null) {
          if (typeof full.exitFullscreen !== 'function') return 'unsupported'
          await full.exitFullscreen()
          return 'off'
        }
        if (typeof element.requestFullscreen !== 'function') return 'unsupported'
        await element.requestFullscreen()
        return 'on'
      } catch (error) {
        // A refused request (no user gesture, a policy, a frame that did not
        // delegate the permission) rejects; it must not escape as an unhandled
        // rejection, and the person needs to be told.
        console.warn('dsh-mobile-remote-view: 全屏请求被拒绝', error)
        return 'refused'
      }
    },
    subscribe(listener: () => void): () => void {
      doc.addEventListener('fullscreenchange', listener)
      return () => { doc.removeEventListener('fullscreenchange', listener) }
    },
  }
}
