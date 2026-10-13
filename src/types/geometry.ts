/** One rectangle in either coordinate system. */
export interface Rect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** One point in either coordinate system. */
export interface Point {
  readonly x: number
  readonly y: number
}

/** The raw screen size in CSS px, read before any patch is installed. */
export interface Viewport {
  readonly width: number
  readonly height: number
}

/** A size in app px. */
export interface AppBox {
  readonly width: number
  readonly height: number
}
