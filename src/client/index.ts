/**
 * Browser half of the mobile remote view.
 *
 * It turns the whole GUI a quarter turn and gives each region of the shell —
 * sidebar, conversation, right panel — the full screen at a time, which is what
 * makes the Web GUI usable on a phone-sized remote screen. The half owns no
 * slot of its own except the row's configuration card: it works on the DOM the
 * shell already rendered, so it cannot displace another plugin's registration.
 *
 * The two services it drives are the shell's `layout` (sidebar expand/collapse)
 * and the Settings form of its own row, which is where every preference lives.
 */

import type { Context } from '@deepseek-ai/cordis'
import { PLUGIN_ID, SETTINGS_NAMESPACE } from '../constants/plugin.ts'
import type { MobileViewSection } from '../types/config.ts'
import type { ConfigFormLike, ConfigFormsLike, LayoutLike, SlotRegistryLike } from '../types/settings.ts'
import { hostPublished, readConfig, sectionOf } from '../utils/config.ts'
import { MobileRemoteViewPanel } from './components/configCard.tsx'
import { MobileViewController } from './services/controller.ts'
import { installStyles } from './styles.ts'
import { installCardStyles } from './stylesCard.ts'

/** Stable entry name; matches the package name the Host serves this bundle under. */
export const name = PLUGIN_ID

/** The mode needs the shell's layout service to expand/collapse the sidebar. */
export const inject: string[] = ['layout']

/** The service face this half reads, declared structurally. */
interface ServiceRegistry {
  get(name: string): unknown
}

/**
 * Start the mode for this page.
 * @param ctx - this plugin's client context.
 */
export function apply(ctx: Context): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const config = readConfig(globalThis as { __DSH_MOBILE_REMOTE_VIEW__?: unknown })
  // Read once, like the config: whether the engine's host half is the current
  // one is a fact about this page load, and the card's explanation depends on it.
  const knobsPublished = hostPublished(globalThis as { __DSH_MOBILE_REMOTE_VIEW__?: unknown })
  const service = ctx as unknown as ServiceRegistry
  const layout = service.get('layout') as LayoutLike | undefined
  const controller = new MobileViewController({ doc: document, win: window, config, layout })
  const unstyles = installStyles(document)
  const uncardStyles = installCardStyles(document)
  const start = (): void => { controller.start() }
  if (document.body === null) document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()

  ctx.effect(() => () => {
    controller.dispose()
    unstyles()
    uncardStyles()
  }, 'dsh-mobile-remote-view: page mode')

  // The row's knobs have a card of their own in 侧栏「插件」, and the Settings
  // form behind it is also the write path for the bar's own flip and size keys:
  // one store, the profile, so a choice survives the engine's next port.
  ctx.inject(['configForms', 'slots'], (child) => {
    const forms = child.get('configForms') as ConfigFormsLike | undefined
    if (forms === undefined) return
    const form = forms.get<MobileViewSection>(SETTINGS_NAMESPACE)

    /**
     * Bar writes whose answer from the host has not come back yet.
     *
     * A bar key applies its choice to the page at once and only then writes it.
     * The host answers with a fresh section — but while a burst of such writes
     * is in flight, the section the form publishes can still be the one from
     * *before* the burst, and applying that would make the page jump back to
     * the old value and forward again. So the echo is held until the burst
     * settles, and the host's section gets the last word.
     */
    let barWritesInFlight = 0
    const applyPublished = (): void => { controller.applySection(sectionOf(form.getSnapshot().value)) }
    const settle = (): void => {
      barWritesInFlight -= 1
      if (barWritesInFlight === 0) applyPublished()
    }
    child.effect(() => {
      const sync = (): void => { if (barWritesInFlight === 0) applyPublished() }
      const unsubscribe = form.subscribe(sync)
      sync()
      return unsubscribe
    }, 'dsh-mobile-remote-view: apply the card settings live')
    controller.setWriter((path, value) => {
      barWritesInFlight += 1
      // Both arms settle: a rejected write leaves the authoritative section to
      // be applied on the way out, which is what puts the page back on it.
      void form.mutate([{ op: 'set', path, value }]).then(settle, settle)
    })

    const slots = child.get('slots') as SlotRegistryLike | undefined
    if (slots === undefined) return
    child.effect(() => {
      slots.inject('plugins.bundle.config', () => {
        slots.register(
          {
            name: 'plugins.bundle.config',
            // Keyed by the bundle's package name, which is also the namespace.
            key: SETTINGS_NAMESPACE,
            inject: () => ({ form: form as ConfigFormLike<MobileViewSection>, hostPublished: knobsPublished }),
          },
          MobileRemoteViewPanel,
        )
      })
    }, 'dsh-mobile-remote-view: the knobs on the plugin card')
  })
}
