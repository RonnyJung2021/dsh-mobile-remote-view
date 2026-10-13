/**
 * Coordinate virtualisation for the rotated page.
 *
 * A rotated page still hands the app *screen* measurements: the browser reports
 * every rect, every pointer position and every viewport size in the screen's
 * own axes. The app, meanwhile, lays itself out in the rotated box. Anything
 * that measures one and writes the other — a menu placed from its trigger's
 * rect, a tooltip, a drag that divides a pointer delta by a column width, a
 * "did the pointer leave this box" test — lands a quarter turn away from where
 * it belongs.
 *
 * The fix is to make every measurement API answer in app coordinates, so the
 * whole page agrees on one coordinate system again. Hit testing and text
 * selection are the browser's own business and stay in screen space; only what
 * script reads is translated. The pair of facts that must agree are element
 * rects and pointer coordinates, so both are translated here, together with
 * the hit-testing entry points that take a point.
 *
 * The layer is installed on entry and removed on exit; the raw values are
 * captured first, once, from the prototypes the shell itself reads. The
 * plugin's own controls (bar, scroll strip, popovers) live in app coordinates
 * and are positioned from layout properties, never from these APIs, so they are
 * outside the layer by construction.
 */

import type { Rotation } from '../../enums/rotation.ts'
import type { Point, Rect, Viewport } from '../../types/geometry.ts'
import { appBox, appPointFromVisual, appRectFromVisual, visualPointFromApp } from '../../utils/geometry.ts'

/** The mapping in force for one page. */
export interface CoordinateMapping {
  /** Visual screen size in CSS px. */
  readonly viewport: Viewport
  /** Uniform content scale. */
  readonly scale: number
  /** Screen rotation. */
  readonly rotation: Rotation
}

/** Drops a virtualised layer and restores the captured originals. */
export type VirtualizationDisposer = () => void

/**
 * Read the untouched viewport metrics.
 *
 * The values have to be captured from the prototypes before anything is
 * patched, because the resize path runs while the patch is installed: a resize
 * handler that read `window.innerWidth` afterwards would be reading its own
 * virtualised answer and fold the rotation in twice.
 * @param win - the page's window.
 * @returns a reader for the raw screen size in CSS px.
 */
export function rawViewportReader(win: Window): () => Viewport {
  const descriptors = prototypeGetters(win, 'innerWidth', 'innerHeight')
  let last = { width: read('innerWidth', win.innerWidth), height: read('innerHeight', win.innerHeight) }
  function read(name: 'innerWidth' | 'innerHeight', fallback: number): number {
    const getter = descriptors[name]
    if (getter === undefined) return fallback
    const value: unknown = getter.call(win)
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
  }
  return () => {
    last = {
      width: Math.max(1, Math.round(read('innerWidth', last.width))),
      height: Math.max(1, Math.round(read('innerHeight', last.height))),
    }
    return last
  }
}

/** Find own getters for the named window properties, walking the prototype chain. */
function prototypeGetters(win: Window, ...names: string[]): Record<string, (() => unknown) | undefined> {
  const found: Record<string, (() => unknown) | undefined> = {}
  let proto: object | null = win
  while (proto !== null) {
    for (const name of names) {
      if (found[name] !== undefined) continue
      const descriptor = Object.getOwnPropertyDescriptor(proto, name)
      if (descriptor?.get !== undefined) found[name] = descriptor.get
    }
    proto = Object.getPrototypeOf(proto)
  }
  return found
}

/**
 * Install the coordinate layer.
 * @param win - the page's window.
 * @param mapping - how to read the current viewport, scale and rotation.
 * @returns the disposer restoring every patched property.
 */
export function installCoordinateLayer(win: Window, mapping: () => CoordinateMapping): VirtualizationDisposer {
  const restores: (() => void)[] = []
  const viewport = (): Viewport => mapping().viewport
  const scale = (): number => mapping().scale
  const rotation = (): Rotation => mapping().rotation
  const sizeOf = (): { width: number; height: number } => appBox(viewport(), scale())

  const patch = (object: object, name: PropertyKey, get: () => unknown): void => {
    const own = Object.getOwnPropertyDescriptor(object, name)
    const restore = (): void => {
      if (own === undefined) delete (object as Record<PropertyKey, unknown>)[name]
      else Object.defineProperty(object, name, own)
    }
    Object.defineProperty(object, name, { configurable: true, get })
    restores.push(restore)
  }

  /**
   * Patch one prototype's pointer getters.
   *
   * The raw getters are captured before any patch, because the wrapped getter
   * for one name reads the raw *pair* — the patched name answers only one
   * coordinate, and reading it twice would feed one axis into both.
   */
  const patchPointGetters = (proto: object, names: readonly string[]): void => {
    const raw: Record<string, (() => number) | undefined> = {}
    for (const name of names) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, name)
      if (descriptor?.get !== undefined) raw[name] = descriptor.get
    }
    const clientX = raw.clientX
    const clientY = raw.clientY
    if (clientX === undefined || clientY === undefined) return
    const readVisual = function (this: object): Point {
      return { x: clientX.call(this), y: clientY.call(this) }
    }
    for (const name of names) {
      const own = Object.getOwnPropertyDescriptor(proto, name)
      if (own?.get === undefined) continue
      const appAxis = name === 'clientX' || name === 'pageX' ? 'x' : 'y'
      Object.defineProperty(proto, name, {
        configurable: true,
        get(this: object) {
          return appPointFromVisual(readVisual.call(this), viewport(), scale(), rotation())[appAxis]
        },
      })
      restores.push(() => { Object.defineProperty(proto, name, own) })
    }
  }

  const fromAppPoint = (app: Point): Point => visualPointFromApp(app, viewport(), scale(), rotation())

  // Element rects, in app coordinates. The prototypes live on the window's own
  // constructor objects; the cast names what a real page always has.
  const elementProto = (win as unknown as { Element: { prototype: Element } }).Element.prototype
  const mouseProto = (win as unknown as { MouseEvent: { prototype: MouseEvent } }).MouseEvent.prototype
  {
    const original = Object.getOwnPropertyDescriptor(elementProto, 'getBoundingClientRect')
    if (original?.get !== undefined || original?.value !== undefined) {
      const getter = original.get
      const patchRect = (rect: Rect): Rect => appRectFromVisual(rect, viewport(), scale(), rotation())
      const own = Object.getOwnPropertyDescriptor(elementProto, 'getBoundingClientRect')
      Object.defineProperty(elementProto, 'getBoundingClientRect', {
        configurable: true,
        get() {
          if (getter !== undefined) return function (this: Element): DOMRect {
            const visual = getter.call(this) as DOMRect
            const app = patchRect(toRect(visual))
            return makeRect(app)
          }
          const base = original.value as (this: Element) => DOMRect
          return function (this: Element): DOMRect {
            const visual = base.call(this)
            const app = patchRect(toRect(visual))
            return makeRect(app)
          }
        },
      })
      restores.push(() => {
        if (own === undefined) delete (elementProto as unknown as Record<PropertyKey, unknown>).getBoundingClientRect
        else Object.defineProperty(elementProto, 'getBoundingClientRect', own)
      })
    }
  }
  {
    const original = Object.getOwnPropertyDescriptor(elementProto, 'getClientRects')
    if (original?.get !== undefined || original?.value !== undefined) {
      const getter = original.get
      const own = Object.getOwnPropertyDescriptor(elementProto, 'getClientRects')
      Object.defineProperty(elementProto, 'getClientRects', {
        configurable: true,
        get() {
          if (getter !== undefined) return function (this: Element): DOMRectList {
            const visual = getter.call(this) as DOMRectList
            return mapRectList(visual, rect => appRectFromVisual(rect, viewport(), scale(), rotation()))
          }
          const base = original.value as (this: Element) => DOMRectList
          return function (this: Element): DOMRectList {
            const visual = base.call(this)
            return mapRectList(visual, rect => appRectFromVisual(rect, viewport(), scale(), rotation()))
          }
        },
      })
      restores.push(() => {
        if (own === undefined) delete (elementProto as unknown as Record<PropertyKey, unknown>).getClientRects
        else Object.defineProperty(elementProto, 'getClientRects', own)
      })
    }
  }

  // Pointer coordinates, in app coordinates.
  patchPointGetters(mouseProto, ['clientX', 'clientY', 'pageX', 'pageY'])
  const TouchCtor = (win as unknown as { Touch?: { prototype: object } }).Touch
  if (TouchCtor !== undefined) {
    patchPointGetters(TouchCtor.prototype, ['clientX', 'clientY', 'pageX', 'pageY'])
  }

  // Viewport size and html/body client sizes, in app coordinates.
  patch(win, 'innerWidth', () => sizeOf().width)
  patch(win, 'innerHeight', () => sizeOf().height)
  if (win.document.documentElement !== null) {
    patch(win.document.documentElement, 'clientWidth', () => sizeOf().width)
    patch(win.document.documentElement, 'clientHeight', () => sizeOf().height)
  }
  if (win.document.body !== null) {
    patch(win.document.body, 'clientWidth', () => sizeOf().width)
    patch(win.document.body, 'clientHeight', () => sizeOf().height)
  }

  // Hit-testing entry points take an app point, ask the browser in screen terms.
  patchDocumentPointMethod(win, 'elementFromPoint', fromAppPoint, restores)
  patchDocumentPointMethod(win, 'elementsFromPoint', fromAppPoint, restores)
  patchDocumentPointMethod(win, 'caretRangeFromPoint', fromAppPoint, restores)
  patchDocumentPointMethod(win, 'caretPositionFromPoint', fromAppPoint, restores)

  return () => {
    for (const restore of restores.reverse()) restore()
  }
}

/** Patch one document method that takes a point; the original may be absent. */
function patchDocumentPointMethod(
  win: Window,
  name: 'elementFromPoint' | 'elementsFromPoint' | 'caretRangeFromPoint' | 'caretPositionFromPoint',
  fromAppPoint: (point: Point) => Point,
  restores: (() => void)[],
): void {
  const original = Object.getOwnPropertyDescriptor(win.document, name)
  Object.defineProperty(win.document, name, {
    configurable: true,
    value(x: number, y: number): unknown {
      const visual = fromAppPoint({ x, y })
      const base = original?.value as ((x: number, y: number) => unknown) | undefined
      return base?.call(win.document, visual.x, visual.y) ?? null
    },
  })
  restores.push(() => {
    if (original === undefined) delete (win.document as unknown as Record<PropertyKey, unknown>)[name]
    else Object.defineProperty(win.document, name, original)
  })
}

/** Turn a DOMRect-shaped value into a plain rect. */
function toRect(rect: DOMRect): Rect {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

/** Build a DOMRect from a plain rect. */
function makeRect(rect: Rect): DOMRect {
  return new DOMRect(rect.left, rect.top, rect.width, rect.height)
}

/** Map a DOMRectList into a new list. */
function mapRectList(list: DOMRectList, map: (rect: Rect) => Rect): DOMRectList {
  const rects: DOMRect[] = []
  for (let index = 0; index < list.length; index += 1) {
    const item = list.item(index)
    if (item !== null) rects.push(makeRect(map(toRect(item))))
  }
  return makeRectList(rects)
}

/** Build a DOMRectList from DOMRects. */
function makeRectList(rects: DOMRect[]): DOMRectList {
  // A minimal array-backed stand-in: consumers only iterate and read items.
  const values = [...rects]
  return {
    length: values.length,
    item(index: number): DOMRect | null {
      return values[index] ?? null
    },
    [Symbol.iterator](): ArrayIterator<DOMRect> {
      return values[Symbol.iterator]()
    },
  } as unknown as DOMRectList
}
