# Changelog

## 0.1.1 (2026-10-13)

- The control bar's default edge is now the left one (`barEdge: left`).
- Every piece of UI copy ships in Chinese and English — `locale/zh.json` and
  `locale/en.json`, the pair a DSH bundle carries. A language switch in Settings
  re-labels the bar, the strip, the entry row, the popovers and the card without
  a reload, and the plugin page reads the same files for its localized name and
  description.
- The README images point at the repository's raw URLs, so the npm page renders
  them without shipping `assets/` in the package.

## 0.1.0 (2026-10-13)

- First implementation: the whole Web GUI rotated a quarter turn with the
  sidebar, conversation and right panel as full-screen pages, one page key,
  a six-key control bar with scale/font popovers, the sidebar entry button,
  the coordinate layer, and the plugin card's seven knobs written to the
  profile patch.
