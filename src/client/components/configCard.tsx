/**
 * The card's own configuration panel.
 *
 * This is the only React in the plugin: the plugin page hands a slot entry a
 * component, so the panel is one small component and nothing else. It renders
 * plain elements and writes every edit straight through the Settings form —
 * there is no local copy of a preference anywhere, which is what makes a choice
 * survive a reload, a new engine port, and a different window.
 *
 * The auto-enter switch is the one knob with a gate: turning it on changes the
 * first screen of every fresh session, so it asks once, and only then writes.
 */

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BAR_MAX, BAR_MIN, FONT_MAX, FONT_MIN, SCALE_MAX, SCALE_MIN, SECTION_FIELDS,
} from '../../constants/config.ts'
import type { MobileViewSection } from '../../types/config.ts'
import type { ConfigFormLike, ConfigFormView } from '../../types/settings.ts'
import { SECTION_DEFAULTS } from '../../utils/config.ts'
import type { Translate } from '../locale.ts'

/** Props the plugin page and the inject face put on the panel. */
export interface MobileViewPanelProps {
  /** Which view the page is drawing; the bundle card always asks for `page`. */
  readonly view?: 'page' | 'summary'
  /** The row's settings form. */
  readonly form: ConfigFormLike<MobileViewSection>
  /** Whether the boot global carried the knobs, i.e. the host half is current. */
  readonly hostPublished: boolean
  /** Text lookup for the active language. */
  readonly t: Translate
  /**
   * Follow language switches.
   * @param listener - called after the active language changes.
   * @returns the unsubscribe.
   */
  readonly subscribeLocale: (listener: () => void) => () => void
}

/** The sentence the card shows when the settings transport is unavailable. */
function unavailableNote(hostPublished: boolean, t: Translate): string {
  return t(hostPublished ? 'card.note.unavailable' : 'card.note.staleHost')
}

/**
 * Re-render a component whenever the shell's language changes.
 * @param subscribeLocale - the locale subscription.
 * @returns a counter that changes with the language.
 */
function useLocaleRevision(subscribeLocale: (listener: () => void) => () => void): number {
  const [revision, setRevision] = useState(0)
  useEffect(() => subscribeLocale(() => { setRevision(value => value + 1) }), [subscribeLocale])
  return revision
}

/**
 * Subscribe a component to one form.
 * @param form - the settings form.
 * @returns the latest state.
 */
function useFormView(form: ConfigFormLike<MobileViewSection>): ConfigFormView<MobileViewSection> {
  const [state, setState] = useState(() => form.getSnapshot())
  useEffect(() => form.subscribe(() => { setState(form.getSnapshot()) }), [form])
  return state
}

/** One labelled control row. */
function Field(props: { label: string; hint: string; children: ReactNode }): ReactNode {
  return (
    <label className="dshMrvField">
      <span className="dshMrvFieldLabel">{props.label}</span>
      <span className="dshMrvFieldControl">{props.children}</span>
      <span className="dshMrvFieldHint">{props.hint}</span>
    </label>
  )
}

/** One boolean switch row. */
function Toggle(props: {
  label: string; hint: string; checked: boolean; disabled: boolean
  onChange: (next: boolean) => void
}): ReactNode {
  return (
    <label className="dshMrvToggle">
      <input
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        onChange={event => { props.onChange(event.target.checked) }}
      />
      <span>
        <span className="dshMrvFieldLabel">{props.label}</span>
        <span className="dshMrvFieldHint">{props.hint}</span>
      </span>
    </label>
  )
}

/**
 * The mobile-remote-view card: every knob this row has, written to the profile patch.
 * @param props - the page's view and this row's settings form.
 * @returns the panel.
 */
export function MobileRemoteViewPanel(props: MobileViewPanelProps): ReactNode {
  const { form, hostPublished, t, subscribeLocale } = props
  useLocaleRevision(subscribeLocale)
  const state = useFormView(form)
  const value: MobileViewSection = { ...SECTION_DEFAULTS, ...(state.value ?? {}) }
  const writable = state.status === 'ready' && state.writable

  /** Write one field. */
  const set = (field: keyof MobileViewSection, next: unknown): void => {
    void form.mutate([{ op: 'set', path: [field], value: next }])
  }

  /** The auto-enter gate: ask once before turning it on. */
  const setAutoEnter = (next: boolean): void => {
    if (!next) {
      set('autoEnter', false)
      return
    }
    let confirmed = false
    try {
      confirmed = window.confirm(t('card.autoEnter.confirm'))
    } catch {
      confirmed = false
    }
    if (confirmed) set('autoEnter', true)
  }

  const note = state.status === 'unavailable'
    ? unavailableNote(hostPublished, t)
    : t(state.status === 'loading' ? 'card.note.loading' : 'card.note')

  return (
    <div className="dshMrvPanel" data-plugin-config="dsh-mobile-remote-view">
      <p className="dshMrvNote">{note}</p>

      <div className="dshMrvGrid">
        <Field label={t('card.rotate')} hint={t('card.rotate.hint')}>
          <select
            value={String(value.rotate)}
            disabled={!writable}
            onChange={event => { set('rotate', Number(event.target.value)) }}
          >
            <option value="-90">{t('card.rotate.ccw')}</option>
            <option value="90">{t('card.rotate.cw')}</option>
          </select>
        </Field>

        <Field label={t('card.barEdge')} hint={t('card.barEdge.hint')}>
          <select
            value={value.barEdge}
            disabled={!writable}
            onChange={event => { set('barEdge', event.target.value) }}
          >
            <option value="top">{t('card.barEdge.top')}</option>
            <option value="bottom">{t('card.barEdge.bottom')}</option>
            <option value="left">{t('card.barEdge.left')}</option>
            <option value="right">{t('card.barEdge.right')}</option>
          </select>
        </Field>

        <Field label={t('card.barSize')} hint={t('card.barSize.hint', { min: BAR_MIN, max: BAR_MAX })}>
          <input
            type="number"
            min={BAR_MIN}
            max={BAR_MAX}
            step={2}
            value={value.barSize}
            disabled={!writable}
            onChange={event => { set('barSize', Number(event.target.value)) }}
          />
        </Field>

        <Field label={t('card.scale')} hint={t('card.scale.hint', { min: SCALE_MIN, max: SCALE_MAX })}>
          <input
            type="number"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={0.05}
            value={value.scale}
            disabled={!writable}
            onChange={event => { set('scale', Number(event.target.value)) }}
          />
        </Field>

        <Field label={t('card.font')} hint={t('card.font.hint', { min: FONT_MIN, max: FONT_MAX })}>
          <input
            type="number"
            min={FONT_MIN}
            max={FONT_MAX}
            step={1}
            value={value.contentFontSize}
            disabled={!writable}
            onChange={event => { set('contentFontSize', Number(event.target.value)) }}
          />
        </Field>
      </div>

      <div className="dshMrvToggles">
        <Toggle
          label={t('card.autoEnter')}
          hint={t('card.autoEnter.hint')}
          checked={value.autoEnter}
          disabled={!writable}
          onChange={setAutoEnter}
        />
        <Toggle
          label={t('card.virtualize')}
          hint={t('card.virtualize.hint')}
          checked={value.virtualizeCoordinates}
          disabled={!writable}
          onChange={next => { set('virtualizeCoordinates', next) }}
        />
      </div>

      <div className="dshMrvFoot">
        <button
          type="button"
          disabled={!writable}
          onClick={() => {
            void form.mutate(SECTION_FIELDS.map(field => ({
              op: 'set' as const,
              path: [field] as readonly string[],
              value: SECTION_DEFAULTS[field] as unknown,
            })))
          }}
        >
          {t('card.reset')}
        </button>
        <span className="dshMrvStatus">
          {t(writable ? 'card.status.saved' : 'card.status.readonly')}
        </span>
      </div>
    </div>
  )
}
