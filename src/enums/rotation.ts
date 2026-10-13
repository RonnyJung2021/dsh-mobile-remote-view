/** Screen rotation for the page: -90 turns it counterclockwise. */
export const ROTATIONS = [-90, 90] as const
export type Rotation = typeof ROTATIONS[number]

/** Whether a value is one of the two rotations. */
export function isRotation(value: unknown): value is Rotation {
  return value === -90 || value === 90
}
