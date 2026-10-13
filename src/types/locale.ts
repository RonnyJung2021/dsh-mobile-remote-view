/**
 * The shell's locale service, as this half reads it.
 *
 * Declared structurally like every other service face the browser half uses:
 * the plugin names the three methods it needs and stays free of a dependency on
 * the shell's own packages.
 */

/** Dictionary registry plus locale preference, narrowed to what this half calls. */
export interface LocaleLike {
  /**
   * Bind one dictionary namespace to a translate function.
   * @param namespace - the namespace this plugin registered.
   * @returns the bound translate, reading the active locale at call time.
   */
  bind(namespace: string): (key: string, params?: Record<string, unknown>) => string
  /**
   * Register one language's dictionary for a namespace.
   * @param namespace - the namespace being registered.
   * @param locale - the language the dictionary is written in.
   * @param dictionary - flat key to template string.
   * @returns a disposer removing this dictionary.
   */
  register(namespace: string, locale: string, dictionary: Record<string, string>): () => void
  /**
   * Follow locale changes.
   * @param listener - called after the snapshot changes.
   * @returns the unsubscribe.
   */
  subscribe(listener: () => void): () => void
}
