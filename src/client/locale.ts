/**
 * Every text this half puts on screen, in the shell's two languages.
 *
 * One table, two dictionaries: the Chinese side is the copy the plugin was
 * written in, the English side is short and standard — bar keys stay under a
 * word or two because they sit in a 34px key. The half registers both with the
 * shell's locale service and reads its answer at call time, so switching the
 * language in 设置 re-labels the bar, the strip, the entry row and the card
 * without a reload. When the service is absent the compiled table answers for
 * the browser's own language, which is the same rule the shell applies.
 */

import type { Context } from '@deepseek-ai/cordis'
import enText from '../../locale/en.json'
import zhText from '../../locale/zh.json'
import type { LocaleLike } from '../types/locale.ts'

/** Namespace every text here is registered under; matches the package name. */
export const LOCALE_NAMESPACE = 'dsh-mobile-remote-view'

/**
 * The shipped dictionaries, minus the `meta` block the plugin page reads.
 *
 * `locale/zh.json` and `locale/en.json` are the package's own text files, the
 * same pair every DSH bundle carries: the engine reads their `meta` block to
 * show a localized name and description, and this half registers the rest with
 * the locale service at boot. Both files are inlined into the built bundle, so
 * nothing is read from disk at run time.
 */
const { meta: _zhMeta, ...ZH } = zhText
const { meta: _enMeta, ...EN_TEXT } = enText

/** The keys every dictionary carries. */
export type TextKey = keyof typeof ZH

/** English copy — short and standard, sized for the keys and the card rows. */
const EN: Record<TextKey, string> = EN_TEXT

/** One text lookup; reads the active language at call time. */
export type Translate = (key: TextKey, params?: Record<string, unknown>) => string

/**
 * Fill `{name}` placeholders from one params object.
 * @param text - the template.
 * @param params - values by placeholder name.
 * @returns the filled text.
 */
function fill(text: string, params?: Record<string, unknown>): string {
  if (params === undefined) return text
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = params[name]
    return value === undefined ? whole : String(value)
  })
}

/** The language the browser asks for, used only when the shell serves no service. */
function browserLanguage(): string {
  const language = typeof navigator === 'undefined' ? '' : navigator.language
  return language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/**
 * Register both dictionaries and hand back the lookup the half uses everywhere.
 *
 * The shell answers with the key itself when no dictionary matches, so an
 * unresolved key falls back to this file's own table rather than leaking a
 * dotted id into the UI.
 * @param ctx - this plugin's client context.
 * @returns the translate function.
 */
export function installLocale(ctx: Context): Translate {
  const service = ctx.get('locale') as LocaleLike | undefined
  if (service === undefined || typeof service.bind !== 'function') {
    const table = browserLanguage() === 'zh' ? ZH : EN
    return (key, params) => fill(table[key], params)
  }
  ctx.effect(() => {
    const offZh = service.register(LOCALE_NAMESPACE, 'zh', ZH)
    const offEn = service.register(LOCALE_NAMESPACE, 'en', EN)
    return () => { offZh(); offEn() }
  }, 'dsh-mobile-remote-view: UI text')
  const bound = service.bind(LOCALE_NAMESPACE)
  return (key, params) => {
    const text = bound(key, params)
    return text === key ? fill(EN[key], params) : text
  }
}

/**
 * Follow language switches.
 * @param ctx - this plugin's client context.
 * @param listener - called after the active language changes.
 * @returns the unsubscribe; a no-op when the shell serves no service.
 */
export function subscribeLocale(ctx: Context, listener: () => void): () => void {
  const service = ctx.get('locale') as LocaleLike | undefined
  if (service === undefined || typeof service.subscribe !== 'function') return () => {}
  return service.subscribe(listener)
}
