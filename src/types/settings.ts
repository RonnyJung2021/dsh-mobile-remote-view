/**
 * The settings-card contract the client half uses, narrowed to the calls it makes.
 */

import type { MobileViewSection } from './config.ts'

/** The current form state for one namespace, as the client half reads it. */
export interface ConfigFormView<T> {
  /** `loading` until the first accepted section, `unavailable` without a transport. */
  status: 'loading' | 'ready' | 'unavailable'
  /** Last accepted section, undefined before the first acceptance. */
  value: T | undefined
  /** Whether the host document accepts writes. */
  writable: boolean
}

/** One path-addressed edit, as the Settings service takes it. */
export interface SettingsPathOp {
  /** `set` writes the value. */
  op: 'set'
  /** Field path inside the row's config section. */
  path: readonly string[]
  /** Value for `set`. */
  value?: unknown
}

/** The Settings-form surface this plugin uses, narrowed to what it calls. */
export interface ConfigFormLike<T> {
  /** @returns the current form state. */
  getSnapshot(): ConfigFormView<T>
  /** Observe state changes. */
  subscribe(listener: () => void): () => void
  /** Queue edits, all fenced by one revision. */
  mutate(ops: readonly SettingsPathOp[]): Promise<boolean>
}

/** The `configForms` service, narrowed to the one method this plugin calls. */
export interface ConfigFormsLike {
  /** @returns the form for one settings namespace. */
  get<T>(namespace: string): ConfigFormLike<T>
}

/** The slots registry, narrowed to the calls this plugin makes. */
export interface SlotRegistryLike {
  /** Wait for a slot declaration, then contribute. */
  inject(name: string, contribute: () => void): void
  /** Contribute one entry to a declared slot. */
  register(options: Record<string, unknown>, component: unknown): unknown
}

/** The shell's layout service, narrowed to the two methods this plugin calls. */
export interface LayoutLike {
  /** Toggle the sidebar panel (closed ⟷ default width). */
  toggleSidebar(): void
}

export type { MobileViewSection }
