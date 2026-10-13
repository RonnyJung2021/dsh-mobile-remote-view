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

/** Props the plugin page and the inject face put on the panel. */
export interface MobileViewPanelProps {
  /** Which view the page is drawing; the bundle card always asks for `page`. */
  readonly view?: 'page' | 'summary'
  /** The row's settings form. */
  readonly form: ConfigFormLike<MobileViewSection>
  /** Whether the boot global carried the knobs, i.e. the host half is current. */
  readonly hostPublished: boolean
}

/** The sentence the card shows when the settings transport is unavailable. */
function unavailableNote(hostPublished: boolean): string {
  return hostPublished
    ? '这台引擎没有提供设置接口：这里的改动只对当前页面有效，换端口就会回到 profile 里的值。'
    : '引擎里跑的还是本插件的旧宿主半边（本页已是新版本）：宿主半边只在引擎进程启动时加载一次，重载 VS Code 窗口或重启 DSH Desktop 都只是复用同一台活引擎，换不掉它。要重启的是引擎本身——VS Code 命令面板 →「DeepSeek Harness: 重启 Host」（会打断浏览器那边正在跑的对话，本页要重开）；重启后这里的改动就能存进 profile 配置。'
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
  const { form, hostPublished } = props
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
      confirmed = window.confirm('打开后，每次新打开的 Web GUI 页面会自动进入手机远程模式，打开时的页面版面会跟着改变。确认打开吗？')
    } catch {
      confirmed = false
    }
    if (confirmed) set('autoEnter', true)
  }

  const note = state.status === 'unavailable'
    ? unavailableNote(hostPublished)
    : state.status === 'loading'
      ? '正在读取设置…'
      : '这些值写进 profile 的配置里：换端口、重启、在面板与桌面窗口之间切换都还在。'

  return (
    <div className="dshMrvPanel" data-plugin-config="dsh-mobile-remote-view">
      <p className="dshMrvNote">{note}</p>

      <div className="dshMrvGrid">
        <Field label="旋转方向" hint="控制条上的「翻转」写的就是它。">
          <select
            value={String(value.rotate)}
            disabled={!writable}
            onChange={event => { set('rotate', Number(event.target.value)) }}
          >
            <option value="-90">逆时针 90°（默认）</option>
            <option value="90">顺时针 90°</option>
          </select>
        </Field>

        <Field label="控制条位置" hint="按手机自己的方向算，默认上边。">
          <select
            value={value.barEdge}
            disabled={!writable}
            onChange={event => { set('barEdge', event.target.value) }}
          >
            <option value="top">上边</option>
            <option value="bottom">下边</option>
            <option value="left">左边</option>
            <option value="right">右边</option>
          </select>
        </Field>

        <Field label="控制条厚度" hint={`页面像素，${BAR_MIN}–${BAR_MAX}；越小让出的画面越多。`}>
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

        <Field label="页面缩放" hint={`「页面缩放」浮窗写的就是它：${SCALE_MIN}–${SCALE_MAX}，默认 1.5。`}>
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

        <Field label="正文字号" hint={`正文与输入框，${FONT_MIN}–${FONT_MAX} 页面像素，默认 19。`}>
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
          label="打开 Web GUI 自动进入手机远程模式"
          hint="默认不勾；勾上后，新打开的页面直接进模式（勾选时要确认一次）。"
          checked={value.autoEnter}
          disabled={!writable}
          onChange={setAutoEnter}
        />
        <Toggle
          label="换算坐标"
          hint="把矩形与指针换算到旋转后的页面坐标；菜单、提示、拖拽要靠它，关掉会错位。"
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
          恢复默认
        </button>
        <span className="dshMrvStatus">
          {writable ? '改动立即生效，并写进 profile 配置' : '这份表单当前不可写'}
        </span>
      </div>
    </div>
  )
}
