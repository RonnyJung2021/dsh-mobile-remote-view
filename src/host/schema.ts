/**
 * The row's schema, as the Loader resolves it before the plugin starts.
 *
 * Every field carries its default, so the published value is always complete and
 * the browser half never has to guess. The seven knobs are volatile — editing
 * one applies live and writes the profile patch — while `globalName` is
 * deployment configuration and stays out of the card's form.
 */

import z from '@deepseek-ai/schemastery'
import { BAR_MAX, BAR_MIN, FONT_MAX, FONT_MIN, SCALE_MAX, SCALE_MIN } from '../constants/config.ts'
import { GLOBAL_NAME } from '../constants/plugin.ts'
import type { MobileViewConfig } from '../types/config.ts'

/** Row config, as the Loader resolves it before the plugin starts. */
export interface Config extends MobileViewConfig {
  /** Global this host writes; only useful when two engines disagree. */
  readonly globalName?: string
}

/** The row's schema, built from the one table of bounds the halves share. */
export const Config = z.object({
  rotate: z.union([z.const(-90), z.const(90)]).default(-90)
    .description('整页旋转方向：-90 逆时针（默认），90 顺时针。控制条上的「翻转」写的就是它。').volatile(),
  barEdge: z.union(['top', 'bottom', 'left', 'right']).default('left')
    .description('控制条贴在手机屏幕的哪条边（按手机自己的方向），默认左边。').volatile(),
  barSize: z.number().min(BAR_MIN).max(BAR_MAX).default(58)
    .description(`控制条厚度（页面像素，${BAR_MIN}–${BAR_MAX}），默认 58；越小让出的画面越多。`).volatile(),
  scale: z.number().min(SCALE_MIN).max(SCALE_MAX).default(1.5)
    .description(`页面整体缩放（${SCALE_MIN}–${SCALE_MAX}），默认 1.5；控制条「页面缩放」浮窗写的就是它。`).volatile(),
  contentFontSize: z.number().min(FONT_MIN).max(FONT_MAX).default(19)
    .description(`正文与输入框字号（页面像素，${FONT_MIN}–${FONT_MAX}），默认 19；控制条「正文字号」浮窗写的就是它。`).volatile(),
  autoEnter: z.boolean().default(false)
    .description('打开 Web GUI 自动进入手机远程模式：勾上后，全新的会话一打开就直接进模式，默认不勾。').volatile(),
  virtualizeCoordinates: z.boolean().default(true)
    .description('是否把矩形与指针换算到旋转后的页面坐标（菜单、提示、拖拽要靠它），默认开。').volatile(),
  globalName: z.string().default(GLOBAL_NAME)
    .description('宿主写进页面的全局名，一般不用改。'),
})
