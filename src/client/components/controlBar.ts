/**
 * The control bar: the six keys that run the mode.
 *
 * The bar is a strip along one edge of the rotated box, its keys stacked along
 * that edge; every key is described by what it means rather than by pixels.
 * One key — the page key — carries more than one face, so its label, icon and
 * action are functions of the state being rendered. The bar is plain DOM in app
 * coordinates, a child of `document.body`, which puts it inside the rotated
 * element like every other overlay on the page.
 */

import {
  BAR_ACTION_ATTRIBUTE, BAR_ACTIVE_ATTRIBUTE, BAR_DANGER_ATTRIBUTE, BAR_ROOT_ATTRIBUTE,
} from '../../constants/dom.ts'
import { createElement, icon, type IconName } from '../../utils/dom.ts'
import { pageKeyAction, pageKeyIcon, pageKeyLabel, type BarState } from '../utils/barState.ts'

/** What the bar's keys ask the controller to do. */
export interface BarHandlers {
  /** Give the app's own window the whole screen, or give it back. */
  toggleFullscreen(): void
  /** Swap the two everyday pages: conversation ⟷ sidebar. */
  pages(): void
  /** Close the open right panel and land on the main page. */
  closeRightbar(): void
  /** Open or close one of the two value popovers. */
  togglePopover(kind: 'scale' | 'font'): void
  /** Turn the page the other way. */
  flip(): void
  /** Leave the mode. */
  exit(): void
}

/** The built bar. */
export interface BarView {
  /** The bar element; already attached by the caller's decision. */
  readonly root: HTMLElement
  /**
   * Re-render the state the person can see.
   * @param state - the mode's current state.
   */
  refresh(state: BarState): void
  /** The key a popover anchors to, or null while the bar is not built. */
  keyElement(action: 'scale' | 'font'): HTMLElement | null
}

/** One key's description; the faces that vary are functions of the state. */
interface KeySpec {
  /** Action name carried on the key and dispatched by the click handler. */
  readonly action: string
  /** Icon name, or a function of the state for a key with more than one face. */
  readonly icon: IconName | ((state: BarState) => IconName)
  /** Text label, or a function of the state. */
  readonly label: string | ((state: BarState) => string)
  /** Tooltip text, or a function of the state. */
  readonly title: string | ((state: BarState) => string)
  /** Whether the key is showing at all. */
  readonly visible?: (state: BarState) => boolean
  /** Whether the key is the one currently in effect. */
  readonly active?: (state: BarState) => boolean
  /** Whether the key is the way out. */
  readonly danger?: boolean
}

/**
 * The six keys, in the order the spec pins: the fullscreen gesture, the one
 * page key, the two value popovers, the direction, and the way out.
 */
const KEYS: readonly KeySpec[] = [
  {
    action: 'fullscreen',
    icon: 'fullscreen',
    label: '全屏',
    title: state => state.fullscreen
      ? '退出全屏，把桌面还给窗口'
      : '让整个 App 窗口占满屏幕（相当于窗口标题栏上那颗绿色按钮）',
    visible: state => state.fullscreenAvailable,
    active: state => state.fullscreen,
  },
  {
    action: 'pages',
    icon: state => pageKeyIcon(state),
    label: state => pageKeyLabel(state),
    title: state => pageKeyLabel(state) === '关闭右栏'
      ? '关掉右栏面板并回到主界面'
      : pageKeyLabel(state) === '侧栏' ? '侧栏占满一屏' : '主界面占满一屏',
    active: state => pageKeyAction(state) === 'closeRightbar',
  },
  {
    action: 'scale',
    icon: 'scale',
    label: '页面缩放',
    title: state => `页面缩放（当前 ${String(Math.round(state.scale * 100))}%）`,
    active: state => state.popoverOpen === 'scale',
  },
  {
    action: 'font',
    icon: 'font',
    label: '正文字号',
    title: state => `正文字号（当前 ${String(state.contentFontSize)}px）`,
    active: state => state.popoverOpen === 'font',
  },
  {
    action: 'flip',
    icon: 'flip',
    label: '翻转',
    title: () => '换一个 90° 方向',
  },
  {
    action: 'exit',
    icon: 'exit',
    label: '退出',
    title: () => '退出手机远程模式（界面转回原样）',
    danger: true,
  },
]

/** How many keys the bar carries at once — every key, visible or not. */
export const BAR_KEY_COUNT = KEYS.length

/**
 * Build the control bar.
 * @param doc - the page's document.
 * @param handlers - the actions the keys invoke.
 * @returns the bar and its refresh entry point.
 */
export function createBar(doc: Document, handlers: BarHandlers): BarView {
  const root = createElement(doc, 'div', {
    [BAR_ROOT_ATTRIBUTE]: '',
    role: 'toolbar',
    'aria-label': '手机远程模式控制条',
  })
  const keys = new Map<string, {
    key: HTMLButtonElement
    iconSpan: HTMLElement
    labelSpan: HTMLElement
    icon: IconName
    label: string
  }>()

  const renderLabel = (spec: KeySpec, state: BarState): string =>
    typeof spec.label === 'string' ? spec.label : spec.label(state)
  const renderIcon = (spec: KeySpec, state: BarState): IconName =>
    typeof spec.icon === 'string' ? spec.icon : spec.icon(state)
  const renderTitle = (spec: KeySpec, state: BarState): string =>
    typeof spec.title === 'string' ? spec.title : spec.title(state)

  /** State used only to give the keys their first face before any refresh. */
  const empty: BarState = {
    page: 'main', rightbarAvailable: false, fullscreen: false, fullscreenAvailable: true,
    popoverOpen: null, scale: 1, contentFontSize: 19,
  }

  for (const spec of KEYS) {
    const iconSpan = icon(doc, renderIcon(spec, empty))
    const labelSpan = createElement(doc, 'span', {}, [renderLabel(spec, empty)])
    const key = createElement(doc, 'button', {
      type: 'button',
      [BAR_ACTION_ATTRIBUTE]: spec.action,
      ...(spec.danger === true ? { [BAR_DANGER_ATTRIBUTE]: '' } : {}),
    }, [iconSpan, labelSpan])
    keys.set(spec.action, {
      key,
      iconSpan,
      labelSpan,
      icon: renderIcon(spec, empty),
      label: renderLabel(spec, empty),
    })
    root.append(key)
  }

  const refresh = (state: BarState): void => {
    for (const spec of KEYS) {
      const entry = keys.get(spec.action)
      if (entry === undefined) continue
      const label = renderLabel(spec, state)
      const iconName = renderIcon(spec, state)
      if (label !== entry.label) {
        // The label span is held by reference: the key's first span is the icon,
        // and writing the label into it would erase the glyph.
        entry.labelSpan.textContent = label
        entry.label = label
      }
      if (iconName !== entry.icon) {
        const next = icon(doc, iconName)
        entry.iconSpan.replaceWith(next)
        entry.iconSpan = next
        entry.icon = iconName
      }
      const title = renderTitle(spec, state)
      entry.key.title = title
      entry.key.setAttribute('aria-label', title)
      if (spec.visible?.(state) ?? true) entry.key.removeAttribute('hidden')
      else entry.key.setAttribute('hidden', '')
      if (spec.active?.(state) === true) entry.key.setAttribute(BAR_ACTIVE_ATTRIBUTE, '')
      else entry.key.removeAttribute(BAR_ACTIVE_ATTRIBUTE)
    }
  }

  // The click handler reads the latest rendered state; refresh always precedes
  // any click, so this variable is the state the person was looking at.
  let currentState: BarState = {
    page: 'main', rightbarAvailable: false, fullscreen: false, fullscreenAvailable: true,
    popoverOpen: null, scale: 1, contentFontSize: 19,
  }

  root.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const key = target.closest(`button[${BAR_ACTION_ATTRIBUTE}]`)
    const action = key?.getAttribute(BAR_ACTION_ATTRIBUTE)
    if (action === undefined) return
    event.preventDefault()
    event.stopPropagation()
    switch (action) {
      case 'fullscreen': handlers.toggleFullscreen(); break
      case 'pages': {
        if (pageKeyAction(currentState) === 'closeRightbar') handlers.closeRightbar()
        else handlers.pages()
        break
      }
      case 'scale': handlers.togglePopover('scale'); break
      case 'font': handlers.togglePopover('font'); break
      case 'flip': handlers.flip(); break
      case 'exit': handlers.exit(); break
    }
  })

  const statefulRefresh = (state: BarState): void => {
    currentState = state
    refresh(state)
  }

  return {
    root,
    refresh: statefulRefresh,
    keyElement(action: 'scale' | 'font'): HTMLElement | null {
      return keys.get(action)?.key ?? null
    },
  }
}
