/**
 * The screen ⟷ app coordinate math, and nothing else.
 *
 * A rotated page still hands every script *screen* measurements, while the app
 * lays itself out in the rotated box. These functions are the one shared way
 * both coordinate systems answer each other, so the coordinate layer, the bar
 * geometry and the tests all agree on the same arithmetic. The mapping is a
 * quarter-turn rotation plus a uniform scale, which is exactly invertible.
 *
 * The transforms the stylesheet applies, for reference:
 *   -90 (default): translateY(H) rotate(-90deg) scale(s)   visual = (s·y, H − s·x)
 *   90  (flip):    translateX(W) rotate( 90deg) scale(s)   visual = (W − s·y, s·x)
 */

import type { AppEdge, BarEdge } from '../enums/barEdge.ts'
import type { Rotation } from '../enums/rotation.ts'
import type { AppBox, Point, Rect, Viewport } from '../types/geometry.ts'

/** The app box the rotated page lays out in: screen sides swapped, then scaled down. */
export function appBox(viewport: Viewport, scale: number): AppBox {
  return {
    width: viewport.height / scale,
    height: viewport.width / scale,
  }
}

/**
 * Map one visual (screen) point into app coordinates.
 * @param point - the screen point in CSS px.
 * @param viewport - the raw screen size.
 * @param scale - the content scale in force.
 * @param rotation - the rotation in force.
 * @returns the same point in app px.
 */
export function appPointFromVisual(point: Point, viewport: Viewport, scale: number, rotation: Rotation): Point {
  if (rotation === -90) {
    return {
      x: (viewport.height - point.y) / scale,
      y: point.x / scale,
    }
  }
  return {
    x: point.y / scale,
    y: (viewport.width - point.x) / scale,
  }
}

/**
 * Map one app point into visual (screen) coordinates.
 * @param point - the app point in app px.
 * @param viewport - the raw screen size.
 * @param scale - the content scale in force.
 * @param rotation - the rotation in force.
 * @returns the same point in screen px.
 */
export function visualPointFromApp(point: Point, viewport: Viewport, scale: number, rotation: Rotation): Point {
  if (rotation === -90) {
    return {
      x: point.y * scale,
      y: viewport.height - point.x * scale,
    }
  }
  return {
    x: viewport.width - point.y * scale,
    y: point.x * scale,
  }
}

/**
 * Map one visual rectangle into app coordinates.
 *
 * Both opposite corners are mapped rather than assuming an edge pair survives
 * the rotation: the visual left/top corner is not the app left/top corner.
 * @param rect - the screen rect in CSS px.
 * @param viewport - the raw screen size.
 * @param scale - the content scale in force.
 * @param rotation - the rotation in force.
 * @returns the same rect in app px, normalised so width/height stay positive.
 */
export function appRectFromVisual(rect: Rect, viewport: Viewport, scale: number, rotation: Rotation): Rect {
  const first = appPointFromVisual({ x: rect.left, y: rect.top }, viewport, scale, rotation)
  const second = appPointFromVisual({ x: rect.left + rect.width, y: rect.top + rect.height }, viewport, scale, rotation)
  return {
    left: Math.min(first.x, second.x),
    top: Math.min(first.y, second.y),
    width: Math.abs(second.x - first.x),
    height: Math.abs(second.y - first.y),
  }
}

/**
 * Which app edge a screen edge lands on after the rotation.
 *
 * The bar position is configured in the phone's own terms; the stylesheet
 * needs it in app terms, and the answer depends on the rotation direction.
 * @param edge - the configured screen edge.
 * @param rotation - the rotation in force.
 * @returns the app edge the bar occupies.
 */
export function appEdgeFromScreenEdge(edge: BarEdge, rotation: Rotation): AppEdge {
  if (rotation === -90) {
    switch (edge) {
      case 'top': return 'right'
      case 'bottom': return 'left'
      case 'left': return 'top'
      case 'right': return 'bottom'
    }
  }
  switch (edge) {
    case 'top': return 'left'
    case 'bottom': return 'right'
    case 'left': return 'bottom'
    case 'right': return 'top'
  }
}

/**
 * The length of one app edge of the box, in app px.
 * @param box - the app box.
 * @param edge - which edge to measure.
 * @returns the edge length.
 */
export function appEdgeLength(box: AppBox, edge: AppEdge): number {
  return edge === 'top' || edge === 'bottom' ? box.width : box.height
}

/** Whether an app edge runs along the horizontal axis of the app box. */
export function isHorizontalEdge(edge: AppEdge): boolean {
  return edge === 'top' || edge === 'bottom'
}

/** Whether an edge is the box's end along its main axis (right for horizontal, bottom for vertical). */
export function isEndEdge(edge: AppEdge): boolean {
  return edge === 'right' || edge === 'bottom'
}
