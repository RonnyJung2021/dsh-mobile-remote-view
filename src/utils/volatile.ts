/**
 * Read one resolved config field as the plain value the page can use.
 *
 * Every volatile knob arrives from the Loader as a reference object
 * (`{ get, set }`) rather than a value. A reference serialised into the page
 * is `{}`, and the browser half would then silently fall back to its compiled
 * defaults — a profile patch that pins `scale` or `autoEnter` would look like
 * it changed nothing. This is the one place the two representations meet.
 */

/**
 * Unwrap one loader-resolved config field.
 * @param field - a config field; the volatile ones arrive as references.
 * @returns the referenced value, or the field itself when it is already plain.
 */
export function plainValue(field: unknown): unknown {
  if (typeof field === 'object' && field !== null) {
    const get = Reflect.get(field, 'get')
    if (typeof get === 'function') return get.call(field) as unknown
  }
  return field
}
