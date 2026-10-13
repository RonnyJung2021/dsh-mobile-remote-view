/**
 * Host half of the mobile remote view.
 *
 * Two jobs:
 *
 * 1. **Publish.** A loader row's `config` never reaches the page (the boot
 *    graph carries only id/inject/external edges), so the resolved values ride
 *    the index injection table instead, ahead of the boot scripts.
 * 2. **Serve the form.** `Config` declares the page's knobs `.volatile()`, which
 *    makes this row a Settings namespace: the page's own card writes them
 *    through it, and the engine lands each write in the profile patch. That is
 *    the only durable store this plugin has — page `localStorage` is keyed by
 *    the engine's port, which changes on every launch.
 *
 * The half does nothing else: every pixel the page shows is the browser half's
 * work, and the settings namespace is the only state it owns.
 */

import type { Context } from '@deepseek-ai/cordis'
import { GLOBAL_NAME, PLUGIN_ID } from '../constants/plugin.ts'
import type { SettingsFormsLike, ScopeInjection } from '../types/host.ts'
import { plainValue } from '../utils/volatile.ts'
import { plainConfig, publishedConfig } from './publish.ts'
import type { Config } from './schema.ts'

export { Config } from './schema.ts'
export type { MobileViewConfig, MobileViewSection } from '../types/config.ts'

/** Stable loader row id; matches the package name the page is served under. */
export const name = PLUGIN_ID

/**
 * Publish the resolved config and give it a card-only settings page.
 * @param ctx - this plugin's host context.
 * @param config - the row's resolved config; nothing is published without it.
 */
export function apply(ctx: Context, config?: Config): void {
  if (config === undefined || config === null) return
  const resolved = plainConfig(config)
  const value = publishedConfig(resolved)
  const configured = plainValue(config.globalName)
  const globalName = typeof configured === 'string' && configured !== ''
    ? configured
    : GLOBAL_NAME
  ctx.effect(() => {
    return ctx.on('webserver/index-inject', (table: ScopeInjection[]) => {
      table.push({ kind: 'global', name: globalName, value })
    })
  }, 'dsh-mobile-remote-view: publish config global')

  // The knobs have a page of their own (侧栏「插件」→ 手机远程视图), so this row
  // must never also be projected onto a generated Settings page.
  ctx.inject(['settings'], (child) => {
    child.effect(() => {
      const settings = child.get('settings') as SettingsFormsLike | undefined
      if (settings === undefined) return
      return settings.configure({ auto: false }, ctx.fiber)
    }, 'dsh-mobile-remote-view: keep the knobs on the plugin card only')
  })
}
