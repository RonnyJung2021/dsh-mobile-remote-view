/**
 * Ambient shim for the one Cordis surface this plugin names in types.
 *
 * The real Context is provided by the engine (host half) or the shell's module
 * table (browser half); the plugin only imports it as a type, so typechecking
 * against this narrow slice is both sufficient and keeps the package free of a
 * cordis runtime dependency.
 */

declare module '@deepseek-ai/cordis' {
  export interface Context {
    /** Run one effect; the callback may return a disposer. */
    effect(callback: () => (() => void) | void, label?: string): void
    /** Register an event listener, returning its disposer. */
    on(name: string, listener: (...args: never[]) => unknown): () => void
    /** Inject services into a child context, when the services exist. */
    inject(deps: string[], callback: (child: Context) => void): void
    /** Read one provided service; undefined when absent. */
    get(name: string): unknown
    /** The plugin instance's fiber, for the settings page policy. */
    readonly fiber: unknown
  }
}
