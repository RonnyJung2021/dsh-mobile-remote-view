/** Which of the three regions fills the screen at a time. */
export const MOBILE_PAGES = ['main', 'sidebar', 'rightbar'] as const
export type MobilePage = typeof MOBILE_PAGES[number]

/** Whether a value is one of the three pages. */
export function isMobilePage(value: unknown): value is MobilePage {
  return typeof value === 'string' && (MOBILE_PAGES as readonly string[]).includes(value)
}
