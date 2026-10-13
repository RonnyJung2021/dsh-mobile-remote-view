/** What one fullscreen toggle attempt came back as. */
export const FULLSCREEN_RESULTS = ['on', 'off', 'unsupported', 'refused'] as const
export type FullscreenResult = typeof FULLSCREEN_RESULTS[number]
