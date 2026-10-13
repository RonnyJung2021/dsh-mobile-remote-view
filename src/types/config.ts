/** Resolved configuration for one page, as the host published it. */
import type { BarEdge } from '../enums/barEdge.ts'
import type { MobilePage } from '../enums/mobilePage.ts'
import type { Rotation } from '../enums/rotation.ts'

export interface MobileViewConfig {
  /** Rotation applied to the whole GUI. */
  readonly rotate: Rotation
  /** Screen edge the control bar sits on. */
  readonly barEdge: BarEdge
  /** Bar thickness in app pixels. */
  readonly barSize: number
  /** Uniform content scale inside the rotated page. */
  readonly scale: number
  /** Conversation and composer text size in app pixels. */
  readonly contentFontSize: number
  /** Whether a fresh session enters the mode on its own. */
  readonly autoEnter: boolean
  /** Whether the coordinate layer is installed under the rotation. */
  readonly virtualizeCoordinates: boolean
}

/** The volatile section of the row's config — exactly what the card edits. */
export interface MobileViewSection {
  rotate: Rotation
  barEdge: BarEdge
  barSize: number
  scale: number
  contentFontSize: number
  autoEnter: boolean
  virtualizeCoordinates: boolean
}

/** Session state remembered per browser tab: whether the mode is on, and which page. */
export interface SavedState {
  /** Whether the mode is on. */
  readonly on: boolean
  /** Region that was filling the screen. */
  readonly page: MobilePage
}

/** The local copy of the two knobs the bar edits directly. */
export interface ViewPrefs {
  /** Page zoom, 0.6–2.5. */
  readonly scale: number
  /** Conversation and composer font size, 12–27. */
  readonly contentFontSize: number
}
