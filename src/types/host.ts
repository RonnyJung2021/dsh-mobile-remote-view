/**
 * The engine services the host half touches, narrowed to what it calls.
 *
 * The engine's real types are wider than a plugin needs; these interfaces are
 * the slice the apply path actually uses, so a service change shows up as one
 * type to fix rather than as an untyped call site.
 */

/** The settings service surface this half uses. */
export interface SettingsFormsLike {
  /** Keep this plugin instance off any generated settings page. */
  configure(presentation: { auto?: boolean }, owner?: unknown): () => void
}

/** One index injection row, narrowed to the kind this plugin pushes. */
export interface ScopeInjection {
  kind: 'global'
  name: string
  value: unknown
}
