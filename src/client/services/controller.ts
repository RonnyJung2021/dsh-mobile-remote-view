/**
 * The mode's state machine.
 *
 * One controller per page owns everything the mode does: which region fills the
 * screen, which way the page is turned, how large its content is, and whether
 * the coordinate layer is installed. It is driven by three inputs — the two
 * controls, the page's own storage, and the engine row's config — and it drives
 * three outputs: attributes on the root element, marks on the shell's frame,
 * and the shell's own sidebar toggle through `ctx.layout`.
 *
 * The shell keeps its sidebar state, not this plugin: a "sidebar page" is the
 * shell's sidebar expanded plus a stylesheet that gives its column the whole
 * screen. So the controller asks the shell to expand when that page is entered,
 * and to collapse again when it is left — and only when this plugin was the one
 * that expanded it.
 */

import {
  BAR_ATTRIBUTE, CSS_VAR_BAR, CSS_VAR_BAR_KEY, CSS_VAR_FONT, CSS_VAR_SCALE, CSS_VAR_TOOLS,
  CSS_VAR_VIEWPORT_H, CSS_VAR_VIEWPORT_W, HAS_RIGHTBAR_ATTRIBUTE, MODE_ATTRIBUTE,
  PAGE_ATTRIBUTE, PRIMARY_ATTRIBUTE, ROTATE_ATTRIBUTE,
  SHELL_COMPOSER_CARD, SHELL_RIGHTBAR_OPEN, SHELL_RIGHTBAR_TOGGLE, SHELL_SESSION_ID, SHELL_SESSION_PREFIX,
  SHELL_SESSION_ROW, SHELL_SIDEBAR_COLLAPSED, SHELL_SLOT_ANCHOR,
} from '../../constants/dom.ts'
import {
  BAR_GAP, BAR_KEY_MAX, BAR_KEY_MIN, BAR_PADDING, BAR_SLACK, FIND_ATTEMPTS, FIND_INTERVAL_MS,
  MARK_INTERVAL_MS, RIGHTBAR_CLOSE_MS, SIDEBAR_REACTION_MS, SIDEBAR_SETTLE_MS, TOOLS_SIZE,
} from '../../constants/config.ts'
import type { AppEdge } from '../../enums/barEdge.ts'
import type { MobilePage } from '../../enums/mobilePage.ts'
import type { Rotation } from '../../enums/rotation.ts'
import type { MobileViewConfig, MobileViewSection, ViewPrefs } from '../../types/config.ts'
import type { Viewport } from '../../types/geometry.ts'
import type { LayoutLike } from '../../types/settings.ts'
import { clampScale, nextFontSize, nextScale } from '../../utils/config.ts'
import { appBox, appEdgeFromScreenEdge, isHorizontalEdge } from '../../utils/geometry.ts'
import { readPrefs, readSaved, writePrefs, writeSaved } from '../../utils/storage.ts'
import { BAR_KEY_COUNT, createBar, type BarView } from '../components/controlBar.ts'
import { createEntryButton, type EntryView } from '../components/entryButton.ts'
import { createPopover, type PopoverKind, type PopoverView } from '../components/floatPanel.ts'
import { createScrollStrip, type ScrollView } from '../components/scrollStrip.ts'
import { showToast } from '../components/toast.ts'
import { installCoordinateLayer, rawViewportReader, type VirtualizationDisposer } from '../utils/coordinateLayer.ts'
import { findRegions, markRegions, sidebarRootOf, type Regions } from '../utils/regions.ts'
import { fullscreenFace, type FullscreenFace } from './fullscreen.ts'
import type { BarState } from '../utils/barState.ts'

/** What the controller needs from its host. */
export interface ControllerDeps {
  /** The page's document. */
  readonly doc: Document
  /** The page's window. */
  readonly win: Window
  /** Resolved config from the engine row. */
  readonly config: MobileViewConfig
  /** The shell's layout service, when the shell provides one. */
  readonly layout: LayoutLike | undefined
}

/** Root attributes the mode owns. */
const ROOT_ATTRIBUTES = [
  MODE_ATTRIBUTE, ROTATE_ATTRIBUTE, BAR_ATTRIBUTE, PAGE_ATTRIBUTE, HAS_RIGHTBAR_ATTRIBUTE,
] as const

/** Root custom properties the mode owns. */
const ROOT_PROPERTIES = [
  CSS_VAR_VIEWPORT_W, CSS_VAR_VIEWPORT_H, CSS_VAR_SCALE, CSS_VAR_BAR, CSS_VAR_BAR_KEY, CSS_VAR_TOOLS, CSS_VAR_FONT,
] as const

/** The mode's page state, as it is remembered per session. */
interface ModeState {
  on: boolean
  page: MobilePage
}

/** A pending sidebar toggle asked of the shell. */
interface SidebarRequest {
  want: 'expand' | 'collapse'
  attempts: number
}

/** Owns the mode for one page. */
export class MobileViewController {
  private readonly doc: Document
  private readonly win: Window
  private readonly config: MobileViewConfig
  private readonly layout: LayoutLike | undefined
  private readonly readViewport: () => Viewport
  private readonly fullscreen: FullscreenFace

  private state: ModeState
  private section: Partial<MobileViewSection> = {}
  private prefs: ViewPrefs | null = null
  private writer: ((path: readonly string[], value: unknown) => void) | undefined

  private regions: Regions | null = null
  private bar: BarView | null = null
  private scrollView: ScrollView | null = null
  private entry: EntryView | null = null
  private popover: PopoverView | null = null
  private popoverKind: PopoverKind | null = null
  /** The key the open popover hangs off; kept so a value change can re-anchor it. */
  private popoverTrigger: HTMLElement | null = null

  private findTimer: number | null = null
  private findAttempts = 0
  private entryObservers: MutationObserver[] = []

  private rightbarWatch: MutationObserver | null = null
  private rightbarAvailable = false
  private rightbarClosing = false
  private rightbarCloseTimer: number | null = null

  private sideSelections: MutationObserver | null = null
  private lastSidebarSelection = ''
  private sidebarTouchedAt = 0

  /** The sidebar state the shell had when the mode was entered; null until seen. */
  private sidebarRecordedCollapsed: boolean | null = null
  private sidebarExpandedByUs = false
  private sidebarRequest: SidebarRequest | null = null
  private sidebarControlDisabled = false
  private syncTimer: number | null = null

  private unfullscreenChange: (() => void) | null = null
  private unvirtual: VirtualizationDisposer | null = null
  private resizeScheduled = false
  private markTimer: number | null = null
  private disposed = false

  /**
   * @param deps - the page, the config, and the shell face.
   */
  constructor(deps: ControllerDeps) {
    this.doc = deps.doc
    this.win = deps.win
    this.config = deps.config
    this.layout = deps.layout
    // Captured before any patch is installed: the resize path reads this while
    // the virtualised `window.innerWidth` is in force.
    this.readViewport = rawViewportReader(deps.win)
    this.fullscreen = fullscreenFace(deps.doc)
    this.prefs = readPrefs(this.localStorage())
    // Judgment order (1.3.6): the session record decides first — a manual exit
    // sticks across refreshes — and only a session without one looks at the
    // auto-enter knob.
    const saved = readSaved(this.sessionStorage())
    this.state = saved ?? { on: deps.config.autoEnter, page: 'main' }
  }

  /** Attach the controls and apply the remembered state. */
  start(): void {
    if (this.doc.head === null || this.doc.body === null) return
    this.bar = createBar(this.doc, {
      toggleFullscreen: () => { void this.toggleAppFullscreen() },
      pages: () => { this.togglePages() },
      closeRightbar: () => { this.closeRightbar() },
      togglePopover: kind => { this.togglePopover(kind) },
      flip: () => { this.flip() },
      exit: () => { this.exit() },
    })
    this.doc.body.append(this.bar.root)
    this.scrollView = createScrollStrip(this.doc, { scroll: direction => { this.scrollPage(direction) } })
    this.doc.body.append(this.scrollView.root)
    this.entry = createEntryButton(this.doc, () => { this.enter() })
    this.startEntryWatch()
    this.win.addEventListener('resize', this.onResize)
    this.win.addEventListener('orientationchange', this.onResize)
    this.unfullscreenChange = this.fullscreen.subscribe(() => { this.refreshBar() })
    this.doc.addEventListener('keydown', this.onKeydown, true)
    this.doc.addEventListener('click', this.onSidebarClick, true)
    this.doc.addEventListener('click', this.onOutsideClick)
    if (this.state.on) this.enter()
  }

  /** Remove every trace of the plugin from the page. */
  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.win.removeEventListener('resize', this.onResize)
    this.win.removeEventListener('orientationchange', this.onResize)
    this.unfullscreenChange?.()
    this.unfullscreenChange = null
    this.doc.removeEventListener('keydown', this.onKeydown, true)
    this.doc.removeEventListener('click', this.onSidebarClick, true)
    this.doc.removeEventListener('click', this.onOutsideClick)
    this.stopFinding()
    this.stopEntryWatch()
    this.cancelSync()
    this.stopMarking()
    this.rightbarWatch?.disconnect()
    this.rightbarWatch = null
    this.sideSelections?.disconnect()
    this.sideSelections = null
    this.clearRightbarCloseTimer()
    this.closePopover()
    this.exit()
    this.bar?.root.remove()
    this.scrollView?.root.remove()
    this.entry?.remove()
    this.unvirtual?.()
    this.unvirtual = null
  }

  /** Enter the mode: turn the page, mark the shell, show the bar. */
  enter(): void {
    if (this.disposed) return
    this.state.on = true
    this.persist()
    this.syncRegions()
    this.applyRoot()
    this.measure()
    this.syncVirtualization()
    this.startMarking()
    this.syncPage()
  }

  /** Leave the mode and hand the sidebar back to the shell. */
  exit(): void {
    if (!this.state.on) return
    this.state.on = false
    this.state.page = 'main'
    this.persist()
    // The way out also leaves fullscreen, so the desktop never stays locked to
    // a window the person has finished with.
    if (this.fullscreen.isOn()) void this.fullscreen.toggle()
    // Restore the sidebar before the rotation comes off, so the person never
    // sees a frame of the three-column layout the shell itself did not want.
    this.restoreSidebarOnExit()
    const root = this.doc.documentElement
    for (const name of ROOT_ATTRIBUTES) root.removeAttribute(name)
    for (const name of ROOT_PROPERTIES) root.style.removeProperty(name)
    this.stopMarking()
    this.closePopover()
    this.unvirtual?.()
    this.unvirtual = null
    this.cancelSync()
    this.sidebarRequest = null
    this.refreshBar()
  }

  /**
   * Take the settings section the card published and apply it.
   *
   * The open popover stays open: a `+`/`−` tap applies its value through this
   * same path, and closing on every tap would make a burst impossible. It is
   * re-anchored instead, which also repaints the number it shows — the bar's
   * edge and thickness may have moved with the very change being applied.
   * @param section - the narrowed section; missing fields keep the boot value.
   */
  applySection(section: Partial<MobileViewSection>): void {
    this.section = section
    if (!this.state.on) return
    this.applyRoot()
    this.measure()
    this.syncVirtualization()
    this.syncPage()
    this.repositionPopover()
  }

  /** Hand this controller the Settings writer. */
  setWriter(writer: (path: readonly string[], value: unknown) => void): void {
    this.writer = writer
  }

  /** Swap the two everyday pages; unreachable while a right panel is open. */
  private togglePages(): void {
    if (this.rightbarAvailable) return
    this.setPage(this.state.page === 'main' ? 'sidebar' : 'main')
  }

  /** Show one region full screen. */
  private setPage(page: MobilePage): void {
    this.state.page = page
    this.persist()
    this.syncPage()
  }

  /** Turn the page the other way; the preference goes to the profile. */
  private flip(): void {
    const next: Rotation = this.rotation() === -90 ? 90 : -90
    this.write({ rotate: next }, ['rotate'], next)
    showToast(this.doc, this.win, next === -90 ? '已逆时针旋转 90°' : '已顺时针旋转 90°')
  }

  /** Step the scale one popover notch and remember it. */
  private stepScale(direction: number): void {
    const next = nextScale(this.activeScale(), direction)
    if (next === this.activeScale()) {
      showToast(this.doc, this.win, direction > 0 ? '已经是最大页面缩放' : '已经是最小页面缩放')
      return
    }
    this.write({ scale: next }, ['scale'], next)
    showToast(this.doc, this.win, `页面缩放 ${String(Math.round(this.activeScale() * 100))}%`)
  }

  /** Step the font size one popover notch and remember it. */
  private stepFont(direction: number): void {
    const next = nextFontSize(this.activeFont(), direction)
    if (next === this.activeFont()) {
      showToast(this.doc, this.win, direction > 0 ? '已经是最大正文字号' : '已经是最小正文字号')
      return
    }
    this.write({ contentFontSize: next }, ['contentFontSize'], next)
    showToast(this.doc, this.win, `正文字号 ${String(this.activeFont())}px`)
  }

  /** Open or close one of the two value popovers. */
  private togglePopover(kind: PopoverKind): void {
    if (this.popoverKind === kind) {
      this.closePopover()
      return
    }
    this.closePopover()
    if (this.bar === null) return
    const trigger = this.bar.keyElement(kind)
    if (trigger === null) return
    this.popoverKind = kind
    this.popoverTrigger = trigger
    this.popover = createPopover(this.doc, kind, {
      step: (popKind, direction) => {
        if (popKind === 'scale') this.stepScale(direction)
        else this.stepFont(direction)
      },
      value: popKind => popKind === 'scale' ? this.activeScale() : this.activeFont(),
      format: (popKind, value) => popKind === 'scale' ? `${String(Math.round(value * 100))}%` : `${String(value)}px`,
      close: () => { this.closePopover() },
    })
    this.bar.root.append(this.popover.root)
    this.popover.place(trigger, this.barEdgeApp())
    this.refreshBar()
  }

  /** Keep the open popover anchored to its key and showing the current value. */
  private repositionPopover(): void {
    if (this.popover === null || this.popoverTrigger === null) return
    this.popover.place(this.popoverTrigger, this.barEdgeApp())
  }

  /** Close the popover, if one is open. */
  private closePopover(): void {
    this.popover?.remove()
    this.popover = null
    this.popoverTrigger = null
    this.popoverKind = null
    this.refreshBar()
  }

  /** Give the app's own window the whole screen, or give it back. */
  private async toggleAppFullscreen(): Promise<void> {
    const result = await this.fullscreen.toggle()
    this.refreshBar()
    if (result === 'on') showToast(this.doc, this.win, 'App 已占满整个屏幕')
    else if (result === 'off') showToast(this.doc, this.win, '已退出全屏')
    else if (result === 'refused') showToast(this.doc, this.win, '这次全屏没被允许，再点一次试试')
    else showToast(this.doc, this.win, '这个环境不允许页面全屏（iOS Safari 就是这种）')
  }

  /** Close the open right panel through the shell's own control. */
  private closeRightbar(): void {
    if (!this.rightbarAvailable) return
    const panel = this.regions?.rightbar?.querySelector(`[${SHELL_RIGHTBAR_OPEN}]`)
    const toggle = panel instanceof HTMLElement ? panel.querySelector(`[${SHELL_RIGHTBAR_TOGGLE}]`) : null
    if (toggle instanceof HTMLElement) toggle.click()
    // Success is the open marker clearing; a panel that never clears still gets
    // the page switch after the settle window.
    this.rightbarClosing = true
    this.clearRightbarCloseTimer()
    this.rightbarCloseTimer = this.win.setTimeout(() => {
      this.rightbarCloseTimer = null
      if (this.rightbarClosing) {
        this.rightbarClosing = false
        this.setPage('main')
      }
    }, RIGHTBAR_CLOSE_MS)
  }

  private clearRightbarCloseTimer(): void {
    if (this.rightbarCloseTimer !== null) {
      this.win.clearTimeout(this.rightbarCloseTimer)
      this.rightbarCloseTimer = null
    }
  }

  /** Scroll the page that is showing. */
  private scrollPage(direction: number): void {
    const scroller = this.findScroller()
    if (scroller === null) {
      showToast(this.doc, this.win, '这一页没有可滚动的内容')
      return
    }
    const distance = Math.max(80, Math.round(scroller.clientHeight * 0.7))
    try {
      scroller.scrollBy({ top: direction * distance, behavior: 'smooth' })
    } catch (error) {
      console.warn('dsh-mobile-remote-view: 滚动失败', error)
    }
  }

  /** The largest scrollable box inside the region that is showing. */
  private findScroller(): HTMLElement | null {
    const region = this.state.page === 'sidebar'
      ? this.regions?.sidebar ?? null
      : this.state.page === 'rightbar' ? this.regions?.rightbar ?? null : this.regions?.center ?? null
    if (region === null) return null
    let best: HTMLElement | null = null
    let bestOverflow = 24
    for (const element of region.querySelectorAll<HTMLElement>('*')) {
      const overflow = element.scrollHeight - element.clientHeight
      if (overflow <= bestOverflow || element.clientHeight < 80) continue
      const overflowY = this.win.getComputedStyle(element).overflowY
      if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') continue
      best = element
      bestOverflow = overflow
    }
    return best
  }

  /**
   * Whether a tap in the sidebar should take the page into the main region.
   *
   * Three shapes count: the panel list the shell wraps in `nav`（插件 / 设置 / …）,
   * a session row — which the base source marks with `data-row-key="session:…"`
   * and the released build with `data-session-id` — and nothing else. A row's
   * own controls (the "…" menu, pinning) are still not a choice of what to show:
   * they open menus that the page switch would cover.
   */
  private opensMainRegion(target: Element): boolean {
    if (target.closest('nav') !== null) return true
    const row = target.closest(`[${SHELL_SESSION_ROW}^="${SHELL_SESSION_PREFIX}"], [${SHELL_SESSION_ID}]`)
    if (row === null) return false
    return target.closest('button, a[href], input, textarea, select, [role="menuitem"], [role="menu"], [role="switch"]') === null
  }

  /** What the sidebar currently says is selected: one session row and one panel. */
  private sidebarSelection(): string {
    const sidebar = this.regions?.sidebar ?? null
    if (sidebar === null) return ''
    const selected = sidebar.querySelector(`[${SHELL_SESSION_ROW}][aria-selected="true"], [${SHELL_SESSION_ID}][aria-selected="true"]`)
    const row = selected?.getAttribute(SHELL_SESSION_ROW) ?? selected?.getAttribute(SHELL_SESSION_ID) ?? ''
    const panel = sidebar.querySelector('nav [aria-current]')?.textContent?.trim() ?? ''
    return `${row}|${panel}`
  }

  /** Watch the sidebar's own selection, so a tap that only selects still switches. */
  private watchSidebarSelection(region: HTMLElement | null): void {
    this.sideSelections?.disconnect()
    this.sideSelections = null
    if (region === null) return
    this.lastSidebarSelection = this.sidebarSelection()
    const observer = new MutationObserver(() => { this.onSidebarMutation() })
    observer.observe(region, {
      attributes: true,
      attributeFilter: ['aria-selected', 'aria-current'],
      childList: true,
      subtree: true,
    })
    this.sideSelections = observer
  }

  /** A selection moved shortly after a sidebar tap: the shell opened something. */
  private onSidebarMutation(): void {
    const next = this.sidebarSelection()
    const changed = next !== this.lastSidebarSelection
    this.lastSidebarSelection = next
    if (!changed) return
    if (!this.state.on || this.state.page !== 'sidebar') return
    if (Date.now() - this.sidebarTouchedAt > SIDEBAR_REACTION_MS) return
    this.setPage('main')
  }

  /** A tap anywhere in the sidebar, whether or not it is one this plugin acts on. */
  private readonly onSidebarClick = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const sidebar = this.regions?.sidebar ?? null
    if (sidebar === null || !sidebar.contains(target)) return
    this.sidebarTouchedAt = Date.now()
    if (!this.state.on || this.state.page !== 'sidebar') return
    if (!this.opensMainRegion(target)) return
    this.win.requestAnimationFrame(() => { if (this.state.on && this.state.page === 'sidebar') this.setPage('main') })
  }

  /** A tap outside the open popover closes it. */
  private readonly onOutsideClick = (event: MouseEvent): void => {
    if (this.popover === null) return
    const target = event.target
    if (!(target instanceof Element)) return
    if (this.popover.root.contains(target)) return
    this.closePopover()
  }

  /** Escape closes the open popover. */
  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || this.popover === null) return
    event.preventDefault()
    this.closePopover()
  }

  /** Change one knob: through the profile when served, and in this page only when not. */
  private write(patch: Partial<MobileViewSection>, path: readonly string[], value: unknown): void {
    if (this.writer === undefined) {
      showToast(this.doc, this.win, '这台引擎没有设置接口：这个选择只对当前页面有效')
    } else {
      this.writer(path, value)
    }
    this.applySection({ ...this.section, ...patch })
    // The two bar-edited knobs also keep a local copy, for an engine without a
    // settings transport next time.
    if (patch.scale !== undefined || patch.contentFontSize !== undefined) {
      writePrefs(this.localStorage(), { scale: this.activeScale(), contentFontSize: this.activeFont() })
    }
  }

  /** Everything the bar's faces are derived from. */
  private barState(): BarState {
    return {
      page: this.state.page,
      rightbarAvailable: this.rightbarAvailable,
      fullscreen: this.fullscreen.isOn(),
      fullscreenAvailable: this.fullscreen.isSupported(),
      popoverOpen: this.popoverKind,
      scale: this.activeScale(),
      contentFontSize: this.activeFont(),
    }
  }

  private refreshBar(): void {
    if (this.disposed) return
    this.bar?.refresh(this.barState())
  }

  /** The rotation in force: the card's value, else the boot config. */
  private rotation(): Rotation {
    return this.section.rotate ?? this.config.rotate
  }

  /** The screen edge the bar sits on, in force. */
  private screenBarEdge(): typeof this.config.barEdge {
    return this.section.barEdge ?? this.config.barEdge
  }

  /** The app edge the bar occupies after the rotation. */
  private barEdgeApp(): AppEdge {
    return appEdgeFromScreenEdge(this.screenBarEdge(), this.rotation())
  }

  /** The bar thickness in force, in app pixels. */
  private barSize(): number {
    return this.section.barSize ?? this.config.barSize
  }

  /** The content scale in force, within the range the page can survive. */
  private activeScale(): number {
    const wanted = this.section.scale ?? this.prefs?.scale ?? this.config.scale
    return clampScale(wanted)
  }

  /** The content font size in force. */
  private activeFont(): number {
    const wanted = this.section.contentFontSize ?? this.prefs?.contentFontSize ?? this.config.contentFontSize
    return Math.round(wanted)
  }

  /** Whether the coordinate layer is wanted. */
  private virtualize(): boolean {
    return this.section.virtualizeCoordinates ?? this.config.virtualizeCoordinates
  }

  /** Install or drop the coordinate layer to match the flag in force. */
  private syncVirtualization(): void {
    const wanted = this.state.on && this.virtualize()
    if (wanted && this.unvirtual === null) {
      this.unvirtual = installCoordinateLayer(this.win, () => this.mapping())
    } else if (!wanted && this.unvirtual !== null) {
      this.unvirtual()
      this.unvirtual = null
    }
  }

  /** The mapping the coordinate layer translates with. */
  private mapping(): { viewport: Viewport; scale: number; rotation: Rotation } {
    return { viewport: this.readViewport(), scale: this.activeScale(), rotation: this.rotation() }
  }

  /** Write the attributes and custom properties the stylesheet keys on. */
  private applyRoot(): void {
    const root = this.doc.documentElement
    root.setAttribute(MODE_ATTRIBUTE, '')
    if (this.rotation() === 90) root.setAttribute(ROTATE_ATTRIBUTE, '90')
    else root.removeAttribute(ROTATE_ATTRIBUTE)
    root.setAttribute(BAR_ATTRIBUTE, this.barEdgeApp())
    root.setAttribute(PAGE_ATTRIBUTE, this.state.page)
    root.setAttribute(HAS_RIGHTBAR_ATTRIBUTE, this.rightbarAvailable ? 'yes' : 'no')
  }

  /** Publish the live screen size and the current knobs to the stylesheet. */
  private measure(): void {
    const viewport = this.readViewport()
    const root = this.doc.documentElement
    root.style.setProperty(CSS_VAR_VIEWPORT_W, `${String(Math.round(viewport.width))}px`)
    root.style.setProperty(CSS_VAR_VIEWPORT_H, `${String(Math.round(viewport.height))}px`)
    root.style.setProperty(CSS_VAR_SCALE, String(this.activeScale()))
    root.style.setProperty(CSS_VAR_BAR, `${String(Math.round(this.barSize()))}px`)
    root.style.setProperty(CSS_VAR_BAR_KEY, `${String(this.keySize())}px`)
    root.style.setProperty(CSS_VAR_TOOLS, `${String(TOOLS_SIZE)}px`)
    root.style.setProperty(CSS_VAR_FONT, `${String(this.activeFont())}px`)
  }

  /**
   * The share of the strip one key may occupy, in app pixels.
   *
   * The bar runs along one edge of the rotated box, so a larger scale leaves a
   * shorter strip while the keys keep their size — and the last of them, 退出
   * among them, would end up past the end of it. Sizing the keys from the strip
   * instead keeps every one on screen at any scale.
   * @returns the key share, clamped to the spec's floor and ceiling.
   */
  private keySize(): number {
    const viewport = this.readViewport()
    const edge = this.barEdgeApp()
    const box = appBox(viewport, this.activeScale())
    const length = isHorizontalEdge(edge) ? box.width : box.height
    const free = Math.floor(length) - BAR_PADDING - BAR_GAP * (BAR_KEY_COUNT - 1) - BAR_SLACK
    return Math.max(BAR_KEY_MIN, Math.min(BAR_KEY_MAX, Math.floor(free / BAR_KEY_COUNT)))
  }

  /** Locate and mark the shell's regions. */
  private syncRegions(): boolean {
    const found = findRegions(this.doc)
    if (found === null) {
      this.scheduleFinding()
      return false
    }
    this.regions = found
    markRegions(found)
    if (this.sidebarRecordedCollapsed === null) {
      this.sidebarRecordedCollapsed = found.frame.hasAttribute(SHELL_SIDEBAR_COLLAPSED)
    }
    this.watchRightbar(found.rightbar)
    this.watchSidebarSelection(found.sidebar)
    this.syncRightbar()
    this.stopFinding()
    return true
  }

  /** Poll for the shell's frame while the shell is still starting up. */
  private scheduleFinding(): void {
    if (this.findTimer !== null || !this.state.on) return
    if (this.findAttempts >= FIND_ATTEMPTS) return
    this.findAttempts += 1
    this.findTimer = this.win.setTimeout(() => {
      this.findTimer = null
      if (this.disposed || !this.state.on) return
      if (this.syncRegions()) this.syncPage()
      else this.scheduleFinding()
    }, FIND_INTERVAL_MS)
  }

  /** Stop polling for the frame. */
  private stopFinding(): void {
    if (this.findTimer === null) return
    this.win.clearTimeout(this.findTimer)
    this.findTimer = null
  }

  /** Follow the right panel's expanded state, so it becomes a page of its own. */
  private watchRightbar(region: HTMLElement | null): void {
    this.rightbarWatch?.disconnect()
    this.rightbarWatch = null
    if (region === null) return
    const observer = new MutationObserver(() => { this.syncRightbar() })
    observer.observe(region, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: [SHELL_RIGHTBAR_OPEN],
    })
    this.rightbarWatch = observer
  }

  /** Re-read whether a right panel is expanded, and follow it with the page. */
  private syncRightbar(): void {
    const expanded = this.regions?.rightbar?.querySelector(`[${SHELL_RIGHTBAR_OPEN}]`) != null
    const changed = expanded !== this.rightbarAvailable
    this.rightbarAvailable = expanded
    if (!this.state.on) return
    if (changed) this.doc.documentElement.setAttribute(HAS_RIGHTBAR_ATTRIBUTE, expanded ? 'yes' : 'no')
    if (this.rightbarClosing && !expanded) {
      // The close we asked for landed: stop waiting and land on the main page.
      this.rightbarClosing = false
      this.clearRightbarCloseTimer()
      this.setPage('main')
      return
    }
    if (expanded && this.state.page !== 'rightbar') this.setPage('rightbar')
    else if (!expanded && this.state.page === 'rightbar') this.setPage('main')
    else this.refreshBar()
  }

  /**
   * Keep the page attributes in step with the shell's sidebar state.
   *
   * The shell owns whether its sidebar is expanded; this only asks for the state
   * the current page needs, and only when the shell has not already reached it.
   */
  private syncPage(): void {
    const frame = this.regions?.frame ?? null
    const collapsed = frame === null ? null : frame.hasAttribute(SHELL_SIDEBAR_COLLAPSED)
    if (this.sidebarRequest !== null && collapsed !== null
      && (this.sidebarRequest.want === 'expand') === !collapsed) {
      this.sidebarExpandedByUs = this.sidebarRequest.want === 'expand'
      this.sidebarRequest = null
      this.cancelSync()
    }
    if (frame !== null && this.layout !== undefined && this.sidebarRequest === null && !this.sidebarControlDisabled) {
      const wantsExpanded = this.state.page === 'sidebar'
      if (wantsExpanded && collapsed === true) {
        this.layout.toggleSidebar()
        this.sidebarRequest = { want: 'expand', attempts: 0 }
        this.scheduleSync()
      } else if (!wantsExpanded && collapsed === false && this.sidebarExpandedByUs) {
        this.layout.toggleSidebar()
        this.sidebarRequest = { want: 'collapse', attempts: 0 }
        this.scheduleSync()
      }
    }
    if (this.state.on) this.doc.documentElement.setAttribute(PAGE_ATTRIBUTE, this.state.page)
    this.refreshBar()
  }

  /**
   * Check again shortly, in case the shell never answered: an unanswered request
   * blocks further ones, and a lost answer must not freeze the sidebar state.
   * Two misses disable sidebar control for the rest of the session.
   */
  private scheduleSync(): void {
    if (this.syncTimer !== null || this.sidebarRequest === null) return
    this.syncTimer = this.win.setTimeout(() => {
      this.syncTimer = null
      if (this.disposed) return
      const request = this.sidebarRequest
      if (request === null) return
      const frame = this.regions?.frame ?? null
      const collapsed = frame === null ? null : frame.hasAttribute(SHELL_SIDEBAR_COLLAPSED)
      if (collapsed !== null && (request.want === 'expand') === !collapsed) {
        this.sidebarExpandedByUs = request.want === 'expand'
        this.sidebarRequest = null
        this.syncPage()
        return
      }
      if (request.attempts === 0) {
        this.sidebarRequest = { want: request.want, attempts: 1 }
        this.layout?.toggleSidebar()
        this.scheduleSync()
        return
      }
      this.sidebarRequest = null
      this.sidebarControlDisabled = true
      showToast(this.doc, this.win, '这台外壳不支持自动展开侧栏')
      this.syncPage()
    }, SIDEBAR_SETTLE_MS)
  }

  /** Drop a pending sidebar sync. */
  private cancelSync(): void {
    if (this.syncTimer === null) return
    this.win.clearTimeout(this.syncTimer)
    this.syncTimer = null
  }

  /** Restore the sidebar to what it was before the mode, best effort once. */
  private restoreSidebarOnExit(): void {
    if (this.sidebarControlDisabled || this.layout === undefined || this.regions === null) return
    if (this.sidebarRecordedCollapsed === null) return
    const current = this.regions.frame.hasAttribute(SHELL_SIDEBAR_COLLAPSED)
    if (current === this.sidebarRecordedCollapsed) return
    this.layout.toggleSidebar()
  }

  /** Keep the entry button in the sidebar's current DOM. */
  private startEntryWatch(): void {
    if (this.entry === null) return
    this.ensureEntryPlaced()
    // The sidebar root mounts a moment after the frame; watch its slot anchor
    // for the mount and for a full re-mount.
    const anchor = this.doc.querySelector(`[${SHELL_SLOT_ANCHOR}="sidebar"]`)
    if (anchor !== null) {
      const anchorObserver = new MutationObserver(() => { this.ensureEntryPlaced() })
      anchorObserver.observe(anchor, { childList: true })
      this.entryObservers.push(anchorObserver)
    }
  }

  /** Put the entry button into the shell's current sidebar root, or keep looking. */
  private ensureEntryPlaced(): void {
    if (this.disposed || this.entry === null) return
    const root = sidebarRootOf(this.doc)
    if (root === null) {
      this.scheduleEntryFind()
      return
    }
    this.stopEntryFind()
    this.entry.ensureIn(root)
    if (this.entryObservedRoot !== root) {
      // A re-render can drop the button; watch the root's subtree so the next
      // re-render that removes it puts it back.
      const rootObserver = new MutationObserver(() => {
        if (this.entry !== null && !this.entry.root.isConnected) this.ensureEntryPlaced()
      })
      rootObserver.observe(root, { childList: true, subtree: true })
      this.entryObservers.push(rootObserver)
      this.entryObservedRoot = root
    }
  }

  private entryFindTimer: number | null = null
  private entryFindAttempts = 0
  private entryObservedRoot: HTMLElement | null = null

  /** Poll for the sidebar root while the shell is still starting up. */
  private scheduleEntryFind(): void {
    if (this.entryFindTimer !== null || this.disposed) return
    if (this.entryFindAttempts >= FIND_ATTEMPTS) return
    this.entryFindAttempts += 1
    this.entryFindTimer = this.win.setTimeout(() => {
      this.entryFindTimer = null
      if (this.disposed) return
      const root = sidebarRootOf(this.doc)
      if (root === null) this.scheduleEntryFind()
      else this.ensureEntryPlaced()
    }, FIND_INTERVAL_MS)
  }

  private stopEntryFind(): void {
    if (this.entryFindTimer === null) return
    this.win.clearTimeout(this.entryFindTimer)
    this.entryFindTimer = null
  }

  private stopEntryWatch(): void {
    for (const observer of this.entryObservers) observer.disconnect()
    this.entryObservers = []
    this.entryObservedRoot = null
    this.stopEntryFind()
  }

  /** Start keeping the composer's primary button marked. */
  private startMarking(): void {
    if (this.markTimer !== null) return
    this.markPrimaryComposerButton()
    this.markTimer = this.win.setInterval(() => {
      if (this.disposed || !this.state.on) return
      if (this.doc.visibilityState === 'hidden') return
      this.markPrimaryComposerButton()
    }, MARK_INTERVAL_MS)
  }

  /** Stop marking, and drop the mark so the stylesheet stops matching it. */
  private stopMarking(): void {
    if (this.markTimer !== null) {
      this.win.clearInterval(this.markTimer)
      this.markTimer = null
    }
    this.doc.querySelector(`[${PRIMARY_ATTRIBUTE}]`)?.removeAttribute(PRIMARY_ATTRIBUTE)
  }

  /**
   * Mark the composer's primary button — the one that sends or stops.
   *
   * The shell publishes no attribute for it, and the two controls on either
   * side of it belong to slots. What is stable is position: inside the composer
   * card, the trailing row's last button is the primary action, in every
   * variant of the composer.
   */
  private markPrimaryComposerButton(): void {
    const card = this.doc.querySelector(`[${SHELL_COMPOSER_CARD}]`)
    if (card === null) return
    const buttons = card.querySelectorAll('button')
    const primary = buttons.length === 0 ? null : buttons[buttons.length - 1] ?? null
    if (primary === null) return
    const marked = this.doc.querySelector(`[${PRIMARY_ATTRIBUTE}]`)
    if (marked === primary) return
    marked?.removeAttribute(PRIMARY_ATTRIBUTE)
    primary.setAttribute(PRIMARY_ATTRIBUTE, '')
  }

  /** Re-measure on the next frame; resize fires in bursts. */
  private scheduleMeasure(): void {
    if (this.resizeScheduled || !this.state.on) return
    this.resizeScheduled = true
    this.win.requestAnimationFrame(() => {
      this.resizeScheduled = false
      if (this.disposed || !this.state.on) return
      this.measure()
      if (this.regions !== null && !this.regions.frame.isConnected) {
        this.regions = null
        this.syncRegions()
      }
      this.syncPage()
    })
  }

  /** Window resize handler; bound once. */
  private readonly onResize = (): void => { this.scheduleMeasure() }

  /** The page's storage, when it has one. */
  private sessionStorage(): Storage | undefined {
    try {
      return this.win.sessionStorage ?? undefined
    } catch {
      return undefined
    }
  }

  /** The page's local storage, when it has one. */
  private localStorage(): Storage | undefined {
    try {
      return this.win.localStorage ?? undefined
    } catch {
      return undefined
    }
  }

  /** Remember the current state. */
  private persist(): void {
    writeSaved(this.sessionStorage(), { on: this.state.on, page: this.state.page })
  }
}
