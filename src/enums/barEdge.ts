/** Screen edge the control bar sits on, in the phone's own terms. */
export const BAR_EDGES = ['top', 'bottom', 'left', 'right'] as const
export type BarEdge = typeof BAR_EDGES[number]

/** Whether a value is one of the four screen edges. */
export function isBarEdge(value: unknown): value is BarEdge {
  return typeof value === 'string' && (BAR_EDGES as readonly string[]).includes(value)
}

/** An edge of the rotated app box, after the screen edge is mapped through the rotation. */
export type AppEdge = BarEdge
