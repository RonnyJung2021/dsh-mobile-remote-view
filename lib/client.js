window.__ModuleLoader__.load({
	id: "dsh-mobile-remote-view",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);

// src/constants/plugin.ts
var PLUGIN_ID = "dsh-mobile-remote-view";
var SETTINGS_NAMESPACE = PLUGIN_ID;
var GLOBAL_NAME = "__DSH_MOBILE_REMOTE_VIEW__";
var SESSION_KEY = "dsh-mobile-remote-view:v1";
var PREFS_KEY = "dsh-mobile-remote-view:prefs";

// src/constants/config.ts
var SCALE_MIN = 0.6;
var SCALE_MAX = 2.5;
var SCALE_DEFAULT = 1.5;
var SCALE_STEP = 0.05;
var FONT_MIN = 12;
var FONT_MAX = 27;
var FONT_DEFAULT = 19;
var FONT_STEP = 1;
var BAR_MIN = 40;
var BAR_MAX = 120;
var TOOLS_SIZE = 46;
var BAR_KEY_MIN = 12;
var BAR_KEY_MAX = 34;
var BAR_PADDING = 6;
var BAR_GAP = 2;
var BAR_SLACK = 2;
var SECTION_FIELDS = [
  "rotate",
  "barEdge",
  "barSize",
  "scale",
  "contentFontSize",
  "autoEnter",
  "virtualizeCoordinates"
];
var SIDEBAR_SETTLE_MS = 400;
var RIGHTBAR_CLOSE_MS = 1500;
var MARK_INTERVAL_MS = 700;
var SIDEBAR_REACTION_MS = 1500;
var FIND_INTERVAL_MS = 250;
var FIND_ATTEMPTS = 40;
var TOAST_MS = 1400;
var POPOVER_GAP = 4;

// src/enums/barEdge.ts
var BAR_EDGES = ["top", "bottom", "left", "right"];
function isBarEdge(value) {
  return typeof value === "string" && BAR_EDGES.includes(value);
}

// src/enums/rotation.ts
function isRotation(value) {
  return value === -90 || value === 90;
}

// src/utils/config.ts
var DEFAULT_CONFIG = {
  rotate: -90,
  barEdge: "left",
  barSize: 58,
  scale: SCALE_DEFAULT,
  contentFontSize: FONT_DEFAULT,
  autoEnter: false,
  virtualizeCoordinates: true
};
var SECTION_DEFAULTS = {
  rotate: DEFAULT_CONFIG.rotate,
  barEdge: DEFAULT_CONFIG.barEdge,
  barSize: DEFAULT_CONFIG.barSize,
  scale: DEFAULT_CONFIG.scale,
  contentFontSize: DEFAULT_CONFIG.contentFontSize,
  autoEnter: DEFAULT_CONFIG.autoEnter,
  virtualizeCoordinates: DEFAULT_CONFIG.virtualizeCoordinates
};
var PUBLISHED_KEYS = [...SECTION_FIELDS];
function bounded(value, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value)) return void 0;
  return Math.min(max, Math.max(min, value));
}
function positive(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function readConfig(globals) {
  const raw = globals[GLOBAL_NAME];
  const source = isRecord(raw) ? raw : {};
  const rotate = isRotation(source.rotate) ? source.rotate : DEFAULT_CONFIG.rotate;
  const barEdge = isBarEdge(source.barEdge) ? source.barEdge : DEFAULT_CONFIG.barEdge;
  return {
    rotate,
    barEdge,
    barSize: bounded(source.barSize, BAR_MIN, BAR_MAX) ?? DEFAULT_CONFIG.barSize,
    scale: bounded(source.scale, SCALE_MIN, SCALE_MAX) ?? DEFAULT_CONFIG.scale,
    contentFontSize: bounded(source.contentFontSize, FONT_MIN, FONT_MAX) ?? DEFAULT_CONFIG.contentFontSize,
    autoEnter: typeof source.autoEnter === "boolean" ? source.autoEnter : DEFAULT_CONFIG.autoEnter,
    virtualizeCoordinates: typeof source.virtualizeCoordinates === "boolean" ? source.virtualizeCoordinates : DEFAULT_CONFIG.virtualizeCoordinates
  };
}
function hostPublished(globals) {
  const raw = globals[GLOBAL_NAME];
  if (!isRecord(raw)) return false;
  return PUBLISHED_KEYS.some((key) => key in raw);
}
function sectionOf(value) {
  if (!isRecord(value)) return {};
  const section = {};
  if (isRotation(value.rotate)) section.rotate = value.rotate;
  if (isBarEdge(value.barEdge)) section.barEdge = value.barEdge;
  const barSize = bounded(value.barSize, BAR_MIN, BAR_MAX);
  if (barSize !== void 0) section.barSize = barSize;
  const scale = bounded(value.scale, SCALE_MIN, SCALE_MAX);
  if (scale !== void 0) section.scale = scale;
  const contentFontSize = bounded(value.contentFontSize, FONT_MIN, FONT_MAX);
  if (contentFontSize !== void 0) section.contentFontSize = contentFontSize;
  if (typeof value.autoEnter === "boolean") section.autoEnter = value.autoEnter;
  if (typeof value.virtualizeCoordinates === "boolean") section.virtualizeCoordinates = value.virtualizeCoordinates;
  return section;
}
function clampScale(value) {
  return Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, positive(value, SCALE_DEFAULT))) * 100) / 100;
}
function clampFontSize(value) {
  return Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, positive(value, FONT_DEFAULT))));
}
function nextScale(current, direction) {
  return clampScale(current + direction * SCALE_STEP);
}
function nextFontSize(current, direction) {
  return clampFontSize(current + direction * FONT_STEP);
}

// src/client/components/configCard.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function unavailableNote(hostPublished2, t) {
  return t(hostPublished2 ? "card.note.unavailable" : "card.note.staleHost");
}
function useLocaleRevision(subscribeLocale2) {
  const [revision, setRevision] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => subscribeLocale2(() => {
    setRevision((value) => value + 1);
  }), [subscribeLocale2]);
  return revision;
}
function useFormView(form) {
  const [state, setState] = (0, import_react.useState)(() => form.getSnapshot());
  (0, import_react.useEffect)(() => form.subscribe(() => {
    setState(form.getSnapshot());
  }), [form]);
  return state;
}
function Field(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dshMrvField", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMrvFieldLabel", children: props.label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMrvFieldControl", children: props.children }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMrvFieldHint", children: props.hint })
  ] });
}
function Toggle(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dshMrvToggle", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        type: "checkbox",
        checked: props.checked,
        disabled: props.disabled,
        onChange: (event) => {
          props.onChange(event.target.checked);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMrvFieldLabel", children: props.label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMrvFieldHint", children: props.hint })
    ] })
  ] });
}
function MobileRemoteViewPanel(props) {
  const { form, hostPublished: hostPublished2, t, subscribeLocale: subscribeLocale2 } = props;
  useLocaleRevision(subscribeLocale2);
  const state = useFormView(form);
  const value = { ...SECTION_DEFAULTS, ...state.value ?? {} };
  const writable = state.status === "ready" && state.writable;
  const set = (field, next) => {
    void form.mutate([{ op: "set", path: [field], value: next }]);
  };
  const setAutoEnter = (next) => {
    if (!next) {
      set("autoEnter", false);
      return;
    }
    let confirmed = false;
    try {
      confirmed = window.confirm(t("card.autoEnter.confirm"));
    } catch {
      confirmed = false;
    }
    if (confirmed) set("autoEnter", true);
  };
  const note = state.status === "unavailable" ? unavailableNote(hostPublished2, t) : t(state.status === "loading" ? "card.note.loading" : "card.note");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshMrvPanel", "data-plugin-config": "dsh-mobile-remote-view", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dshMrvNote", children: note }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshMrvGrid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: t("card.rotate"), hint: t("card.rotate.hint"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "select",
        {
          value: String(value.rotate),
          disabled: !writable,
          onChange: (event) => {
            set("rotate", Number(event.target.value));
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "-90", children: t("card.rotate.ccw") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "90", children: t("card.rotate.cw") })
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: t("card.barEdge"), hint: t("card.barEdge.hint"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "select",
        {
          value: value.barEdge,
          disabled: !writable,
          onChange: (event) => {
            set("barEdge", event.target.value);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "top", children: t("card.barEdge.top") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "bottom", children: t("card.barEdge.bottom") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "left", children: t("card.barEdge.left") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "right", children: t("card.barEdge.right") })
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: t("card.barSize"), hint: t("card.barSize.hint", { min: BAR_MIN, max: BAR_MAX }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "number",
          min: BAR_MIN,
          max: BAR_MAX,
          step: 2,
          value: value.barSize,
          disabled: !writable,
          onChange: (event) => {
            set("barSize", Number(event.target.value));
          }
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: t("card.scale"), hint: t("card.scale.hint", { min: SCALE_MIN, max: SCALE_MAX }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "number",
          min: SCALE_MIN,
          max: SCALE_MAX,
          step: 0.05,
          value: value.scale,
          disabled: !writable,
          onChange: (event) => {
            set("scale", Number(event.target.value));
          }
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { label: t("card.font"), hint: t("card.font.hint", { min: FONT_MIN, max: FONT_MAX }), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "number",
          min: FONT_MIN,
          max: FONT_MAX,
          step: 1,
          value: value.contentFontSize,
          disabled: !writable,
          onChange: (event) => {
            set("contentFontSize", Number(event.target.value));
          }
        }
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshMrvToggles", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Toggle,
        {
          label: t("card.autoEnter"),
          hint: t("card.autoEnter.hint"),
          checked: value.autoEnter,
          disabled: !writable,
          onChange: setAutoEnter
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Toggle,
        {
          label: t("card.virtualize"),
          hint: t("card.virtualize.hint"),
          checked: value.virtualizeCoordinates,
          disabled: !writable,
          onChange: (next) => {
            set("virtualizeCoordinates", next);
          }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dshMrvFoot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          disabled: !writable,
          onClick: () => {
            void form.mutate(SECTION_FIELDS.map((field) => ({
              op: "set",
              path: [field],
              value: SECTION_DEFAULTS[field]
            })));
          },
          children: t("card.reset")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dshMrvStatus", children: t(writable ? "card.status.saved" : "card.status.readonly") })
    ] })
  ] });
}

// locale/en.json
var en_default = {
  meta: {
    title: "Mobile remote view",
    description: "Turns the DSH Web GUI a quarter turn so the sidebar, conversation and right panel each fill a phone screen."
  },
  "bar.aria": "Mobile remote view controls",
  "bar.fullscreen": "Full",
  "bar.fullscreen.enter": "Fill the screen with the app window",
  "bar.fullscreen.leave": "Leave fullscreen",
  "bar.pages.main": "Chat",
  "bar.pages.sidebar": "Sidebar",
  "bar.pages.closeRightbar": "Close",
  "bar.pages.title.main": "Chat fills the screen",
  "bar.pages.title.sidebar": "Sidebar fills the screen",
  "bar.pages.title.closeRightbar": "Close the right panel and return to the chat",
  "bar.scale": "Zoom",
  "bar.scale.title": "Zoom ({percent}%)",
  "bar.font": "Font",
  "bar.font.title": "Text size ({size}px)",
  "bar.flip": "Flip",
  "bar.flip.title": "Turn the other way",
  "bar.exit": "Exit",
  "bar.exit.title": "Leave mobile remote view",
  "strip.aria": "Scroll",
  "strip.up": "Up",
  "strip.down": "Down",
  "popover.scale": "zoom",
  "popover.font": "text size",
  "popover.group": "{label} adjustment",
  "popover.decrease": "Decrease {label}",
  "popover.increase": "Increase {label}",
  "entry.label": "Mobile remote view",
  "entry.enter": "Enter mobile remote view",
  "toast.rotate.ccw": "Turned 90\xB0 counter-clockwise",
  "toast.rotate.cw": "Turned 90\xB0 clockwise",
  "toast.scale.max": "Zoom is at its maximum",
  "toast.scale.min": "Zoom is at its minimum",
  "toast.scale.value": "Zoom {percent}%",
  "toast.font.max": "Text size is at its maximum",
  "toast.font.min": "Text size is at its minimum",
  "toast.font.value": "Text size {size}px",
  "toast.fullscreen.on": "The app now fills the screen",
  "toast.fullscreen.off": "Left fullscreen",
  "toast.fullscreen.refused": "Fullscreen was refused \u2014 tap again",
  "toast.fullscreen.unsupported": "Page fullscreen is unavailable here (as on iOS Safari)",
  "toast.scroll.empty": "Nothing to scroll on this page",
  "toast.settings.absent": "No settings transport: this choice applies to this page only",
  "toast.sidebar.unsupported": "This shell cannot expand the sidebar for us",
  "card.note": "Stored in the profile: they survive a new port, a restart and another window.",
  "card.note.loading": "Loading settings\u2026",
  "card.note.unavailable": "This engine serves no settings transport: changes apply to this page only.",
  "card.note.staleHost": "The engine still runs an older host half of this plugin, and a host half loads once per engine process \u2014 reloading the window or the desktop app only re-attaches to the same live engine. Restart the engine itself (VS Code: \u201CDeepSeek Harness: \u91CD\u542F Host\u201D; this page must be reopened) and these values start reaching the profile.",
  "card.rotate": "Direction",
  "card.rotate.hint": "What the bar\u2019s Flip key writes.",
  "card.rotate.ccw": "Counter-clockwise 90\xB0 (default)",
  "card.rotate.cw": "Clockwise 90\xB0",
  "card.barEdge": "Bar edge",
  "card.barEdge.hint": "In the phone\u2019s own terms; left by default.",
  "card.barEdge.top": "Top",
  "card.barEdge.bottom": "Bottom",
  "card.barEdge.left": "Left (default)",
  "card.barEdge.right": "Right",
  "card.barSize": "Bar thickness",
  "card.barSize.hint": "Page pixels, {min}\u2013{max}; a thinner bar gives the content more room.",
  "card.scale": "Page zoom",
  "card.scale.hint": "What the zoom popover writes: {min}\u2013{max}, 1.5 by default.",
  "card.font": "Text size",
  "card.font.hint": "Body and composer, {min}\u2013{max} page pixels, 19 by default.",
  "card.autoEnter": "Enter mobile remote view when the GUI opens",
  "card.autoEnter.hint": "Off by default; asking once before it turns on.",
  "card.autoEnter.confirm": "Every newly opened GUI page will enter mobile remote view and its layout will change. Turn it on?",
  "card.virtualize": "Coordinate layer",
  "card.virtualize.hint": "Translate rects and pointers into the rotated page; menus and drags drift 90\xB0 without it.",
  "card.reset": "Reset",
  "card.status.saved": "Applied at once, written to the profile",
  "card.status.readonly": "This form is read-only"
};

// locale/zh.json
var zh_default = {
  meta: {
    title: "\u624B\u673A\u8FDC\u7A0B\u89C6\u56FE",
    description: "\u628A DSH Web GUI \u6574\u4E2A\u8F6C 90\xB0\uFF0C\u4FA7\u680F / \u5BF9\u8BDD / \u53F3\u680F\u5404\u81EA\u5360\u6EE1\u4E00\u5C4F\uFF1B\u624B\u673A\u4E0A\u8FDC\u7A0B\u770B\u684C\u9762\u65F6\uFF0C\u5B57\u5927\u5230\u624B\u80FD\u70B9\u3002"
  },
  "bar.aria": "\u624B\u673A\u8FDC\u7A0B\u6A21\u5F0F\u63A7\u5236\u6761",
  "bar.fullscreen": "\u5168\u5C4F",
  "bar.fullscreen.enter": "\u8BA9\u6574\u4E2A App \u7A97\u53E3\u5360\u6EE1\u5C4F\u5E55\uFF08\u76F8\u5F53\u4E8E\u7A97\u53E3\u6807\u9898\u680F\u4E0A\u90A3\u9897\u7EFF\u8272\u6309\u94AE\uFF09",
  "bar.fullscreen.leave": "\u9000\u51FA\u5168\u5C4F\uFF0C\u628A\u684C\u9762\u8FD8\u7ED9\u7A97\u53E3",
  "bar.pages.main": "\u4E3B\u754C\u9762",
  "bar.pages.sidebar": "\u4FA7\u680F",
  "bar.pages.closeRightbar": "\u5173\u95ED\u53F3\u680F",
  "bar.pages.title.main": "\u4E3B\u754C\u9762\u5360\u6EE1\u4E00\u5C4F",
  "bar.pages.title.sidebar": "\u4FA7\u680F\u5360\u6EE1\u4E00\u5C4F",
  "bar.pages.title.closeRightbar": "\u5173\u6389\u53F3\u680F\u9762\u677F\u5E76\u56DE\u5230\u4E3B\u754C\u9762",
  "bar.scale": "\u9875\u9762\u7F29\u653E",
  "bar.scale.title": "\u9875\u9762\u7F29\u653E\uFF08\u5F53\u524D {percent}%\uFF09",
  "bar.font": "\u6B63\u6587\u5B57\u53F7",
  "bar.font.title": "\u6B63\u6587\u5B57\u53F7\uFF08\u5F53\u524D {size}px\uFF09",
  "bar.flip": "\u7FFB\u8F6C",
  "bar.flip.title": "\u6362\u4E00\u4E2A 90\xB0 \u65B9\u5411",
  "bar.exit": "\u9000\u51FA",
  "bar.exit.title": "\u9000\u51FA\u624B\u673A\u8FDC\u7A0B\u6A21\u5F0F\uFF08\u754C\u9762\u8F6C\u56DE\u539F\u6837\uFF09",
  "strip.aria": "\u6EDA\u52A8",
  "strip.up": "\u4E0A\u6EDA",
  "strip.down": "\u4E0B\u6EDA",
  "popover.scale": "\u9875\u9762\u7F29\u653E",
  "popover.font": "\u6B63\u6587\u5B57\u53F7",
  "popover.group": "{label}\u8C03\u8282",
  "popover.decrease": "\u51CF\u5C0F{label}",
  "popover.increase": "\u589E\u5927{label}",
  "entry.label": "\u624B\u673A\u8FDC\u7A0B\u6A21\u5F0F",
  "entry.enter": "\u8FDB\u5165\u624B\u673A\u8FDC\u7A0B\u6A21\u5F0F",
  "toast.rotate.ccw": "\u5DF2\u9006\u65F6\u9488\u65CB\u8F6C 90\xB0",
  "toast.rotate.cw": "\u5DF2\u987A\u65F6\u9488\u65CB\u8F6C 90\xB0",
  "toast.scale.max": "\u5DF2\u7ECF\u662F\u6700\u5927\u9875\u9762\u7F29\u653E",
  "toast.scale.min": "\u5DF2\u7ECF\u662F\u6700\u5C0F\u9875\u9762\u7F29\u653E",
  "toast.scale.value": "\u9875\u9762\u7F29\u653E {percent}%",
  "toast.font.max": "\u5DF2\u7ECF\u662F\u6700\u5927\u6B63\u6587\u5B57\u53F7",
  "toast.font.min": "\u5DF2\u7ECF\u662F\u6700\u5C0F\u6B63\u6587\u5B57\u53F7",
  "toast.font.value": "\u6B63\u6587\u5B57\u53F7 {size}px",
  "toast.fullscreen.on": "App \u5DF2\u5360\u6EE1\u6574\u4E2A\u5C4F\u5E55",
  "toast.fullscreen.off": "\u5DF2\u9000\u51FA\u5168\u5C4F",
  "toast.fullscreen.refused": "\u8FD9\u6B21\u5168\u5C4F\u6CA1\u88AB\u5141\u8BB8\uFF0C\u518D\u70B9\u4E00\u6B21\u8BD5\u8BD5",
  "toast.fullscreen.unsupported": "\u8FD9\u4E2A\u73AF\u5883\u4E0D\u5141\u8BB8\u9875\u9762\u5168\u5C4F\uFF08iOS Safari \u5C31\u662F\u8FD9\u79CD\uFF09",
  "toast.scroll.empty": "\u8FD9\u4E00\u9875\u6CA1\u6709\u53EF\u6EDA\u52A8\u7684\u5185\u5BB9",
  "toast.settings.absent": "\u8FD9\u53F0\u5F15\u64CE\u6CA1\u6709\u8BBE\u7F6E\u63A5\u53E3\uFF1A\u8FD9\u4E2A\u9009\u62E9\u53EA\u5BF9\u5F53\u524D\u9875\u9762\u6709\u6548",
  "toast.sidebar.unsupported": "\u8FD9\u53F0\u5916\u58F3\u4E0D\u652F\u6301\u81EA\u52A8\u5C55\u5F00\u4FA7\u680F",
  "card.note": "\u8FD9\u4E9B\u503C\u5199\u8FDB profile \u7684\u914D\u7F6E\u91CC\uFF1A\u6362\u7AEF\u53E3\u3001\u91CD\u542F\u3001\u5728\u9762\u677F\u4E0E\u684C\u9762\u7A97\u53E3\u4E4B\u95F4\u5207\u6362\u90FD\u8FD8\u5728\u3002",
  "card.note.loading": "\u6B63\u5728\u8BFB\u53D6\u8BBE\u7F6E\u2026",
  "card.note.unavailable": "\u8FD9\u53F0\u5F15\u64CE\u6CA1\u6709\u63D0\u4F9B\u8BBE\u7F6E\u63A5\u53E3\uFF1A\u8FD9\u91CC\u7684\u6539\u52A8\u53EA\u5BF9\u5F53\u524D\u9875\u9762\u6709\u6548\uFF0C\u6362\u7AEF\u53E3\u5C31\u4F1A\u56DE\u5230 profile \u91CC\u7684\u503C\u3002",
  "card.note.staleHost": "\u5F15\u64CE\u91CC\u8DD1\u7684\u8FD8\u662F\u672C\u63D2\u4EF6\u7684\u65E7\u5BBF\u4E3B\u534A\u8FB9\uFF08\u672C\u9875\u5DF2\u662F\u65B0\u7248\u672C\uFF09\uFF1A\u5BBF\u4E3B\u534A\u8FB9\u53EA\u5728\u5F15\u64CE\u8FDB\u7A0B\u542F\u52A8\u65F6\u52A0\u8F7D\u4E00\u6B21\uFF0C\u91CD\u8F7D VS Code \u7A97\u53E3\u6216\u91CD\u542F DSH Desktop \u90FD\u53EA\u662F\u590D\u7528\u540C\u4E00\u53F0\u6D3B\u5F15\u64CE\uFF0C\u6362\u4E0D\u6389\u5B83\u3002\u8981\u91CD\u542F\u7684\u662F\u5F15\u64CE\u672C\u8EAB\u2014\u2014VS Code \u547D\u4EE4\u9762\u677F \u2192\u300CDeepSeek Harness: \u91CD\u542F Host\u300D\uFF08\u4F1A\u6253\u65AD\u6D4F\u89C8\u5668\u90A3\u8FB9\u6B63\u5728\u8DD1\u7684\u5BF9\u8BDD\uFF0C\u672C\u9875\u8981\u91CD\u5F00\uFF09\uFF1B\u91CD\u542F\u540E\u8FD9\u91CC\u7684\u6539\u52A8\u5C31\u80FD\u5B58\u8FDB profile \u914D\u7F6E\u3002",
  "card.rotate": "\u65CB\u8F6C\u65B9\u5411",
  "card.rotate.hint": "\u63A7\u5236\u6761\u4E0A\u7684\u300C\u7FFB\u8F6C\u300D\u5199\u7684\u5C31\u662F\u5B83\u3002",
  "card.rotate.ccw": "\u9006\u65F6\u9488 90\xB0\uFF08\u9ED8\u8BA4\uFF09",
  "card.rotate.cw": "\u987A\u65F6\u9488 90\xB0",
  "card.barEdge": "\u63A7\u5236\u6761\u4F4D\u7F6E",
  "card.barEdge.hint": "\u6309\u624B\u673A\u81EA\u5DF1\u7684\u65B9\u5411\u7B97\uFF0C\u9ED8\u8BA4\u5DE6\u8FB9\u3002",
  "card.barEdge.top": "\u4E0A\u8FB9",
  "card.barEdge.bottom": "\u4E0B\u8FB9",
  "card.barEdge.left": "\u5DE6\u8FB9\uFF08\u9ED8\u8BA4\uFF09",
  "card.barEdge.right": "\u53F3\u8FB9",
  "card.barSize": "\u63A7\u5236\u6761\u539A\u5EA6",
  "card.barSize.hint": "\u9875\u9762\u50CF\u7D20\uFF0C{min}\u2013{max}\uFF1B\u8D8A\u5C0F\u8BA9\u51FA\u7684\u753B\u9762\u8D8A\u591A\u3002",
  "card.scale": "\u9875\u9762\u7F29\u653E",
  "card.scale.hint": "\u300C\u9875\u9762\u7F29\u653E\u300D\u6D6E\u7A97\u5199\u7684\u5C31\u662F\u5B83\uFF1A{min}\u2013{max}\uFF0C\u9ED8\u8BA4 1.5\u3002",
  "card.font": "\u6B63\u6587\u5B57\u53F7",
  "card.font.hint": "\u6B63\u6587\u4E0E\u8F93\u5165\u6846\uFF0C{min}\u2013{max} \u9875\u9762\u50CF\u7D20\uFF0C\u9ED8\u8BA4 19\u3002",
  "card.autoEnter": "\u6253\u5F00 Web GUI \u81EA\u52A8\u8FDB\u5165\u624B\u673A\u8FDC\u7A0B\u6A21\u5F0F",
  "card.autoEnter.hint": "\u9ED8\u8BA4\u4E0D\u52FE\uFF1B\u52FE\u4E0A\u540E\uFF0C\u65B0\u6253\u5F00\u7684\u9875\u9762\u76F4\u63A5\u8FDB\u6A21\u5F0F\uFF08\u52FE\u9009\u65F6\u8981\u786E\u8BA4\u4E00\u6B21\uFF09\u3002",
  "card.autoEnter.confirm": "\u6253\u5F00\u540E\uFF0C\u6BCF\u6B21\u65B0\u6253\u5F00\u7684 Web GUI \u9875\u9762\u4F1A\u81EA\u52A8\u8FDB\u5165\u624B\u673A\u8FDC\u7A0B\u6A21\u5F0F\uFF0C\u6253\u5F00\u65F6\u7684\u9875\u9762\u7248\u9762\u4F1A\u8DDF\u7740\u6539\u53D8\u3002\u786E\u8BA4\u6253\u5F00\u5417\uFF1F",
  "card.virtualize": "\u6362\u7B97\u5750\u6807",
  "card.virtualize.hint": "\u628A\u77E9\u5F62\u4E0E\u6307\u9488\u6362\u7B97\u5230\u65CB\u8F6C\u540E\u7684\u9875\u9762\u5750\u6807\uFF1B\u83DC\u5355\u3001\u63D0\u793A\u3001\u62D6\u62FD\u8981\u9760\u5B83\uFF0C\u5173\u6389\u4F1A\u9519\u4F4D\u3002",
  "card.reset": "\u6062\u590D\u9ED8\u8BA4",
  "card.status.saved": "\u6539\u52A8\u7ACB\u5373\u751F\u6548\uFF0C\u5E76\u5199\u8FDB profile \u914D\u7F6E",
  "card.status.readonly": "\u8FD9\u4EFD\u8868\u5355\u5F53\u524D\u4E0D\u53EF\u5199"
};

// src/client/locale.ts
var LOCALE_NAMESPACE = "dsh-mobile-remote-view";
var { meta: _zhMeta, ...ZH } = zh_default;
var { meta: _enMeta, ...EN_TEXT } = en_default;
var EN = EN_TEXT;
function fill(text, params) {
  if (params === void 0) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name2) => {
    const value = params[name2];
    return value === void 0 ? whole : String(value);
  });
}
function browserLanguage() {
  const language = typeof navigator === "undefined" ? "" : navigator.language;
  return language.toLowerCase().startsWith("zh") ? "zh" : "en";
}
function installLocale(ctx) {
  const service = ctx.get("locale");
  if (service === void 0 || typeof service.bind !== "function") {
    const table = browserLanguage() === "zh" ? ZH : EN;
    return (key, params) => fill(table[key], params);
  }
  ctx.effect(() => {
    const offZh = service.register(LOCALE_NAMESPACE, "zh", ZH);
    const offEn = service.register(LOCALE_NAMESPACE, "en", EN);
    return () => {
      offZh();
      offEn();
    };
  }, "dsh-mobile-remote-view: UI text");
  const bound = service.bind(LOCALE_NAMESPACE);
  return (key, params) => {
    const text = bound(key, params);
    return text === key ? fill(EN[key], params) : text;
  };
}
function subscribeLocale(ctx, listener) {
  const service = ctx.get("locale");
  if (service === void 0 || typeof service.subscribe !== "function") return () => {
  };
  return service.subscribe(listener);
}

// src/constants/dom.ts
var MODE_ATTRIBUTE = "data-mobile-remote-view";
var ROTATE_ATTRIBUTE = "data-mobile-remote-view-rotate";
var PAGE_ATTRIBUTE = "data-mobile-remote-view-page";
var BAR_ATTRIBUTE = "data-mobile-remote-view-bar";
var HAS_RIGHTBAR_ATTRIBUTE = "data-mobile-remote-view-has-rightbar";
var FRAME_ATTRIBUTE = "data-mobile-remote-view-frame";
var REGION_ATTRIBUTE = "data-mobile-remote-view-region";
var ENTRY_ATTRIBUTE = "data-mobile-remote-view-entry";
var BAR_ROOT_ATTRIBUTE = "data-mobile-remote-view-bar-root";
var BAR_ACTION_ATTRIBUTE = "data-mobile-remote-view-action";
var BAR_DANGER_ATTRIBUTE = "data-mobile-remote-view-danger";
var BAR_ACTIVE_ATTRIBUTE = "data-mobile-remote-view-active";
var SCROLL_ROOT_ATTRIBUTE = "data-mobile-remote-view-scroll-root";
var SCROLL_ATTRIBUTE = "data-mobile-remote-view-scroll";
var POPOVER_ATTRIBUTE = "data-mobile-remote-view-popover";
var POPOVER_MINUS_ATTRIBUTE = "data-mobile-remote-view-popover-minus";
var POPOVER_PLUS_ATTRIBUTE = "data-mobile-remote-view-popover-plus";
var TOAST_ATTRIBUTE = "data-mobile-remote-view-toast";
var PRIMARY_ATTRIBUTE = "data-mobile-remote-view-primary";
var CSS_VAR_VIEWPORT_W = "--dsh-mrv-vw";
var CSS_VAR_VIEWPORT_H = "--dsh-mrv-vh";
var CSS_VAR_SCALE = "--dsh-mrv-scale";
var CSS_VAR_BAR = "--dsh-mrv-bar";
var CSS_VAR_BAR_KEY = "--dsh-mrv-bar-btn";
var CSS_VAR_TOOLS = "--dsh-mrv-tools";
var CSS_VAR_FONT = "--dsh-mrv-content-font";
var SHELL_SLOT_ANCHOR = "data-slot";
var SHELL_SIDEBAR_COLLAPSED = "data-sidebar-collapsed";
var SHELL_WINDOW_DRAG = "data-window-drag";
var SHELL_RIGHTBAR_OPEN = "data-sidebar-right-open";
var SHELL_RIGHTBAR_TOGGLE = "data-sidebar-right-toggle";
var SHELL_SESSION_ROW = "data-row-key";
var SHELL_SESSION_PREFIX = "session:";
var SHELL_SESSION_ID = "data-session-id";
var SHELL_COMPOSER_CARD = "data-composer-card";
var SHELL_OVERLAY = "data-shell-overlay";

// src/utils/geometry.ts
function appBox(viewport, scale) {
  return {
    width: viewport.height / scale,
    height: viewport.width / scale
  };
}
function appPointFromVisual(point, viewport, scale, rotation) {
  if (rotation === -90) {
    return {
      x: (viewport.height - point.y) / scale,
      y: point.x / scale
    };
  }
  return {
    x: point.y / scale,
    y: (viewport.width - point.x) / scale
  };
}
function visualPointFromApp(point, viewport, scale, rotation) {
  if (rotation === -90) {
    return {
      x: point.y * scale,
      y: viewport.height - point.x * scale
    };
  }
  return {
    x: viewport.width - point.y * scale,
    y: point.x * scale
  };
}
function appRectFromVisual(rect, viewport, scale, rotation) {
  const first = appPointFromVisual({ x: rect.left, y: rect.top }, viewport, scale, rotation);
  const second = appPointFromVisual({ x: rect.left + rect.width, y: rect.top + rect.height }, viewport, scale, rotation);
  return {
    left: Math.min(first.x, second.x),
    top: Math.min(first.y, second.y),
    width: Math.abs(second.x - first.x),
    height: Math.abs(second.y - first.y)
  };
}
function appEdgeFromScreenEdge(edge, rotation) {
  if (rotation === -90) {
    switch (edge) {
      case "top":
        return "right";
      case "bottom":
        return "left";
      case "left":
        return "top";
      case "right":
        return "bottom";
    }
  }
  switch (edge) {
    case "top":
      return "left";
    case "bottom":
      return "right";
    case "left":
      return "bottom";
    case "right":
      return "top";
  }
}
function isHorizontalEdge(edge) {
  return edge === "top" || edge === "bottom";
}
function isEndEdge(edge) {
  return edge === "right" || edge === "bottom";
}

// src/enums/mobilePage.ts
var MOBILE_PAGES = ["main", "sidebar", "rightbar"];
function isMobilePage(value) {
  return typeof value === "string" && MOBILE_PAGES.includes(value);
}

// src/utils/storage.ts
function readSaved(storage) {
  const text = readText(storage, SESSION_KEY);
  if (text === null) return null;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const source = parsed;
  if (typeof source.on !== "boolean") return null;
  return {
    on: source.on,
    page: isMobilePage(source.page) ? source.page : "main"
  };
}
function writeSaved(storage, state) {
  writeText(storage, SESSION_KEY, JSON.stringify(state));
}
function readPrefs(storage) {
  const text = readText(storage, PREFS_KEY);
  if (text === null) return null;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const source = parsed;
  const scale = typeof source.scale === "number" ? clampScale(source.scale) : null;
  const contentFontSize = typeof source.contentFontSize === "number" ? clampFontSize(source.contentFontSize) : null;
  if (scale === null || contentFontSize === null) return null;
  return { scale, contentFontSize };
}
function writePrefs(storage, prefs) {
  writeText(storage, PREFS_KEY, JSON.stringify({ scale: clampScale(prefs.scale), contentFontSize: clampFontSize(prefs.contentFontSize) }));
}
function readText(storage, key) {
  if (storage === void 0) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}
function writeText(storage, key, value) {
  if (storage === void 0) return;
  try {
    storage.setItem(key, value);
  } catch {
  }
}

// src/utils/dom.ts
var ICON_PATHS = {
  fullscreen: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>',
  sidebar: '<path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm5-1v16"/>',
  conversation: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H12l-5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8z"/>',
  closeRightbar: '<path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M3 4h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/>',
  scale: '<path d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 3v6m-3-3h6M14.5 14.5 20 20"/>',
  font: '<path d="M5 20 9.5 7h5L19 20m-8.6-5h7.2M12 7v-1"/>',
  flip: '<path d="M5 7a8 8 0 0 1 14 0M19 17a8 8 0 0 1-14 0M19 3v4h-4M5 17v4h4"/>',
  exit: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M14 8l4 4-4 4M10 12h8"/>',
  scrollUp: '<path d="M6 15l6-6 6 6"/>',
  scrollDown: '<path d="M6 9l6 6 6-6"/>',
  minus: '<path d="M6 12h12"/>',
  plus: '<path d="M12 6v12M6 12h12"/>',
  phone: '<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 15h4"/>'
};
function createElement(doc, tag, attrs = {}, children = []) {
  const node = doc.createElement(tag);
  for (const [name2, value] of Object.entries(attrs)) node.setAttribute(name2, value);
  for (const child of children) {
    node.append(typeof child === "string" ? doc.createTextNode(child) : child);
  }
  return node;
}
function icon(doc, name2) {
  const body = ICON_PATHS[name2];
  const span = createElement(doc, "span", { "aria-hidden": "true" });
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return span;
}

// src/client/utils/barState.ts
function pageKeyAction(state) {
  return state.rightbarAvailable ? "closeRightbar" : "pages";
}
function pageKeyLabel(state, t) {
  return t(pageKeyTextKey(state));
}
function pageKeyTextKey(state) {
  if (state.rightbarAvailable) return "bar.pages.closeRightbar";
  return state.page === "main" ? "bar.pages.sidebar" : "bar.pages.main";
}
function pageKeyTitleKey(state) {
  if (state.rightbarAvailable) return "bar.pages.title.closeRightbar";
  return state.page === "main" ? "bar.pages.title.sidebar" : "bar.pages.title.main";
}
function pageKeyIcon(state) {
  if (state.rightbarAvailable) return "closeRightbar";
  return state.page === "main" ? "sidebar" : "conversation";
}

// src/client/components/controlBar.ts
var KEYS = [
  {
    action: "fullscreen",
    icon: "fullscreen",
    label: (_state, t) => t("bar.fullscreen"),
    title: (state, t) => t(state.fullscreen ? "bar.fullscreen.leave" : "bar.fullscreen.enter"),
    visible: (state) => state.fullscreenAvailable,
    active: (state) => state.fullscreen
  },
  {
    action: "pages",
    icon: (state) => pageKeyIcon(state),
    label: (state, t) => pageKeyLabel(state, t),
    title: (state, t) => t(pageKeyTitleKey(state)),
    active: (state) => pageKeyAction(state) === "closeRightbar"
  },
  {
    action: "scale",
    icon: "scale",
    label: (_state, t) => t("bar.scale"),
    title: (state, t) => t("bar.scale.title", { percent: Math.round(state.scale * 100) }),
    active: (state) => state.popoverOpen === "scale"
  },
  {
    action: "font",
    icon: "font",
    label: (_state, t) => t("bar.font"),
    title: (state, t) => t("bar.font.title", { size: state.contentFontSize }),
    active: (state) => state.popoverOpen === "font"
  },
  {
    action: "flip",
    icon: "flip",
    label: (_state, t) => t("bar.flip"),
    title: (_state, t) => t("bar.flip.title")
  },
  {
    action: "exit",
    icon: "exit",
    label: (_state, t) => t("bar.exit"),
    title: (_state, t) => t("bar.exit.title"),
    danger: true
  }
];
var BAR_KEY_COUNT = KEYS.length;
function createBar(doc, t, handlers) {
  const root = createElement(doc, "div", {
    [BAR_ROOT_ATTRIBUTE]: "",
    role: "toolbar",
    "aria-label": t("bar.aria")
  });
  const keys = /* @__PURE__ */ new Map();
  const renderLabel = (spec, state) => spec.label(state, t);
  const renderIcon = (spec, state) => typeof spec.icon === "string" ? spec.icon : spec.icon(state);
  const renderTitle = (spec, state) => spec.title(state, t);
  const empty = {
    page: "main",
    rightbarAvailable: false,
    fullscreen: false,
    fullscreenAvailable: true,
    popoverOpen: null,
    scale: 1,
    contentFontSize: 19
  };
  for (const spec of KEYS) {
    const iconSpan = icon(doc, renderIcon(spec, empty));
    const labelSpan = createElement(doc, "span", {}, [renderLabel(spec, empty)]);
    const key = createElement(doc, "button", {
      type: "button",
      [BAR_ACTION_ATTRIBUTE]: spec.action,
      ...spec.danger === true ? { [BAR_DANGER_ATTRIBUTE]: "" } : {}
    }, [iconSpan, labelSpan]);
    keys.set(spec.action, {
      key,
      iconSpan,
      labelSpan,
      icon: renderIcon(spec, empty),
      label: renderLabel(spec, empty)
    });
    root.append(key);
  }
  const refresh = (state) => {
    for (const spec of KEYS) {
      const entry = keys.get(spec.action);
      if (entry === void 0) continue;
      const label = renderLabel(spec, state);
      const iconName = renderIcon(spec, state);
      if (label !== entry.label) {
        entry.labelSpan.textContent = label;
        entry.label = label;
      }
      if (iconName !== entry.icon) {
        const next = icon(doc, iconName);
        entry.iconSpan.replaceWith(next);
        entry.iconSpan = next;
        entry.icon = iconName;
      }
      const title = renderTitle(spec, state);
      entry.key.title = title;
      entry.key.setAttribute("aria-label", title);
      if (spec.visible?.(state) ?? true) entry.key.removeAttribute("hidden");
      else entry.key.setAttribute("hidden", "");
      if (spec.active?.(state) === true) entry.key.setAttribute(BAR_ACTIVE_ATTRIBUTE, "");
      else entry.key.removeAttribute(BAR_ACTIVE_ATTRIBUTE);
    }
  };
  let currentState = {
    page: "main",
    rightbarAvailable: false,
    fullscreen: false,
    fullscreenAvailable: true,
    popoverOpen: null,
    scale: 1,
    contentFontSize: 19
  };
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const key = target.closest(`button[${BAR_ACTION_ATTRIBUTE}]`);
    const action = key?.getAttribute(BAR_ACTION_ATTRIBUTE);
    if (action === void 0) return;
    event.preventDefault();
    event.stopPropagation();
    switch (action) {
      case "fullscreen":
        handlers.toggleFullscreen();
        break;
      case "pages": {
        if (pageKeyAction(currentState) === "closeRightbar") handlers.closeRightbar();
        else handlers.pages();
        break;
      }
      case "scale":
        handlers.togglePopover("scale");
        break;
      case "font":
        handlers.togglePopover("font");
        break;
      case "flip":
        handlers.flip();
        break;
      case "exit":
        handlers.exit();
        break;
    }
  });
  const statefulRefresh = (state) => {
    currentState = state;
    refresh(state);
  };
  return {
    root,
    refresh: statefulRefresh,
    keyElement(action) {
      return keys.get(action)?.key ?? null;
    }
  };
}

// src/client/components/entryButton.ts
function createEntryButton(doc, t, onEnter) {
  const label = createElement(doc, "span", {}, [t("entry.label")]);
  const root = createElement(doc, "button", {
    type: "button",
    [ENTRY_ATTRIBUTE]: "",
    title: t("entry.enter"),
    "aria-label": t("entry.enter")
  }, [icon(doc, "phone"), label]);
  root.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onEnter();
  });
  const ensureIn = (sidebarRoot) => {
    const marks = sidebarRoot.querySelectorAll(`[${SHELL_WINDOW_DRAG}]`);
    const anchor = marks[marks.length - 1];
    if (anchor instanceof HTMLElement && anchor !== root) {
      const after = anchor.nextElementSibling;
      if (after !== root) sidebarRoot.insertBefore(root, after);
    } else if (!(anchor instanceof HTMLElement)) {
      if (sidebarRoot.firstElementChild !== root) sidebarRoot.insertBefore(root, sidebarRoot.firstElementChild);
    }
  };
  return {
    root,
    refresh() {
      label.textContent = t("entry.label");
      root.title = t("entry.enter");
      root.setAttribute("aria-label", t("entry.enter"));
    },
    ensureIn,
    remove() {
      root.remove();
    }
  };
}

// src/client/components/floatPanel.ts
function createPopover(doc, kind, t, handlers) {
  const label = t(kind === "scale" ? "popover.scale" : "popover.font");
  const root = createElement(doc, "div", {
    [POPOVER_ATTRIBUTE]: kind,
    role: "group",
    "aria-label": t("popover.group", { label })
  });
  const value = createElement(doc, "span", { "aria-live": "polite" }, [handlers.format(kind, handlers.value(kind))]);
  const minusTitle = t("popover.decrease", { label });
  const minus = createElement(doc, "button", {
    type: "button",
    [POPOVER_MINUS_ATTRIBUTE]: "",
    title: minusTitle,
    "aria-label": minusTitle
  }, [icon(doc, "minus")]);
  const plusTitle = t("popover.increase", { label });
  const plus = createElement(doc, "button", {
    type: "button",
    [POPOVER_PLUS_ATTRIBUTE]: "",
    title: plusTitle,
    "aria-label": plusTitle
  }, [icon(doc, "plus")]);
  root.append(minus, value, plus);
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    event.preventDefault();
    event.stopPropagation();
    if (target.closest(`button[${POPOVER_MINUS_ATTRIBUTE}]`) !== null) handlers.step(kind, -1);
    else if (target.closest(`button[${POPOVER_PLUS_ATTRIBUTE}]`) !== null) handlers.step(kind, 1);
  });
  const refresh = () => {
    value.textContent = handlers.format(kind, handlers.value(kind));
  };
  return {
    root,
    place(trigger, edge) {
      const horizontal = isHorizontalEdge(edge);
      const end = isEndEdge(edge);
      const barLength = horizontal ? trigger.parentElement?.clientWidth ?? 0 : trigger.parentElement?.clientHeight ?? 0;
      const span = horizontal ? trigger.offsetLeft : trigger.offsetTop;
      const size = horizontal ? trigger.offsetWidth : trigger.offsetHeight;
      const popoverSpan = horizontal ? root.offsetWidth : root.offsetHeight;
      const along = Math.max(0, Math.min(barLength - popoverSpan, span - POPOVER_GAP + (size - popoverSpan) / 2));
      const clear = () => {
        root.style.removeProperty("left");
        root.style.removeProperty("right");
        root.style.removeProperty("top");
        root.style.removeProperty("bottom");
      };
      clear();
      if (horizontal) {
        root.style.left = `${String(along)}px`;
        if (end) root.style.top = `-${String(root.offsetHeight + POPOVER_GAP)}px`;
        else root.style.top = `${String(trigger.offsetHeight + POPOVER_GAP)}px`;
      } else {
        root.style.top = `${String(along)}px`;
        if (end) root.style.right = `${String(trigger.offsetWidth + POPOVER_GAP)}px`;
        else root.style.left = `${String(trigger.offsetWidth + POPOVER_GAP)}px`;
      }
      refresh();
    },
    refresh,
    remove() {
      root.remove();
    }
  };
}

// src/client/components/scrollStrip.ts
function createScrollStrip(doc, t, handlers) {
  const root = createElement(doc, "div", {
    [SCROLL_ROOT_ATTRIBUTE]: "",
    role: "toolbar",
    "aria-label": t("strip.aria")
  });
  const rows = [
    { action: "scroll:up", textKey: "strip.up", icon: "scrollUp", direction: -1 },
    { action: "scroll:down", textKey: "strip.down", icon: "scrollDown", direction: 1 }
  ];
  const labels = [];
  const keys = [];
  for (const row of rows) {
    const label = t(row.textKey);
    const span = createElement(doc, "span", {}, [label]);
    const button = createElement(doc, "button", {
      type: "button",
      [SCROLL_ATTRIBUTE]: String(row.direction),
      title: label,
      "aria-label": label
    }, [icon(doc, row.icon), span]);
    keys.push(button);
    labels.push(span);
    root.append(button);
  }
  const refresh = () => {
    rows.forEach((row, index) => {
      const label = t(row.textKey);
      const button = keys[index];
      const span = labels[index];
      if (button !== void 0) {
        button.title = label;
        button.setAttribute("aria-label", label);
      }
      if (span !== void 0) span.textContent = label;
    });
    root.setAttribute("aria-label", t("strip.aria"));
  };
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest(`button[${SCROLL_ATTRIBUTE}]`);
    if (button === null) return;
    event.preventDefault();
    event.stopPropagation();
    handlers.scroll(Number(button.getAttribute(SCROLL_ATTRIBUTE)));
  });
  return { root, refresh };
}

// src/client/components/toast.ts
var live = null;
function showToast(doc, win, text) {
  if (live !== null) {
    win.clearTimeout(live.timer);
    live.element.remove();
    live = null;
  }
  const node = createElement(doc, "div", { [TOAST_ATTRIBUTE]: "", role: "status" }, [text]);
  doc.body.append(node);
  const timer = win.setTimeout(() => {
    node.remove();
    if (live?.element === node) live = null;
  }, TOAST_MS);
  live = { element: node, timer };
}

// src/client/utils/coordinateLayer.ts
function rawViewportReader(win) {
  const descriptors = prototypeGetters(win, "innerWidth", "innerHeight");
  let last = { width: read("innerWidth", win.innerWidth), height: read("innerHeight", win.innerHeight) };
  function read(name2, fallback) {
    const getter = descriptors[name2];
    if (getter === void 0) return fallback;
    const value = getter.call(win);
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
  }
  return () => {
    last = {
      width: Math.max(1, Math.round(read("innerWidth", last.width))),
      height: Math.max(1, Math.round(read("innerHeight", last.height)))
    };
    return last;
  };
}
function prototypeGetters(win, ...names) {
  const found = {};
  let proto = win;
  while (proto !== null) {
    for (const name2 of names) {
      if (found[name2] !== void 0) continue;
      const descriptor = Object.getOwnPropertyDescriptor(proto, name2);
      if (descriptor?.get !== void 0) found[name2] = descriptor.get;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return found;
}
function installCoordinateLayer(win, mapping) {
  const restores = [];
  const viewport = () => mapping().viewport;
  const scale = () => mapping().scale;
  const rotation = () => mapping().rotation;
  const sizeOf = () => appBox(viewport(), scale());
  const patch = (object, name2, get) => {
    const own = Object.getOwnPropertyDescriptor(object, name2);
    const restore = () => {
      if (own === void 0) delete object[name2];
      else Object.defineProperty(object, name2, own);
    };
    Object.defineProperty(object, name2, { configurable: true, get });
    restores.push(restore);
  };
  const patchPointGetters = (proto, names) => {
    const raw = {};
    for (const name2 of names) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, name2);
      if (descriptor?.get !== void 0) raw[name2] = descriptor.get;
    }
    const clientX = raw.clientX;
    const clientY = raw.clientY;
    if (clientX === void 0 || clientY === void 0) return;
    const readVisual = function() {
      return { x: clientX.call(this), y: clientY.call(this) };
    };
    for (const name2 of names) {
      const own = Object.getOwnPropertyDescriptor(proto, name2);
      if (own?.get === void 0) continue;
      const appAxis = name2 === "clientX" || name2 === "pageX" ? "x" : "y";
      Object.defineProperty(proto, name2, {
        configurable: true,
        get() {
          return appPointFromVisual(readVisual.call(this), viewport(), scale(), rotation())[appAxis];
        }
      });
      restores.push(() => {
        Object.defineProperty(proto, name2, own);
      });
    }
  };
  const fromAppPoint = (app) => visualPointFromApp(app, viewport(), scale(), rotation());
  const elementProto = win.Element.prototype;
  const mouseProto = win.MouseEvent.prototype;
  {
    const original = Object.getOwnPropertyDescriptor(elementProto, "getBoundingClientRect");
    if (original?.get !== void 0 || original?.value !== void 0) {
      const getter = original.get;
      const patchRect = (rect) => appRectFromVisual(rect, viewport(), scale(), rotation());
      const own = Object.getOwnPropertyDescriptor(elementProto, "getBoundingClientRect");
      Object.defineProperty(elementProto, "getBoundingClientRect", {
        configurable: true,
        get() {
          if (getter !== void 0) return function() {
            const visual = getter.call(this);
            const app = patchRect(toRect(visual));
            return makeRect(app);
          };
          const base = original.value;
          return function() {
            const visual = base.call(this);
            const app = patchRect(toRect(visual));
            return makeRect(app);
          };
        }
      });
      restores.push(() => {
        if (own === void 0) delete elementProto.getBoundingClientRect;
        else Object.defineProperty(elementProto, "getBoundingClientRect", own);
      });
    }
  }
  {
    const original = Object.getOwnPropertyDescriptor(elementProto, "getClientRects");
    if (original?.get !== void 0 || original?.value !== void 0) {
      const getter = original.get;
      const own = Object.getOwnPropertyDescriptor(elementProto, "getClientRects");
      Object.defineProperty(elementProto, "getClientRects", {
        configurable: true,
        get() {
          if (getter !== void 0) return function() {
            const visual = getter.call(this);
            return mapRectList(visual, (rect) => appRectFromVisual(rect, viewport(), scale(), rotation()));
          };
          const base = original.value;
          return function() {
            const visual = base.call(this);
            return mapRectList(visual, (rect) => appRectFromVisual(rect, viewport(), scale(), rotation()));
          };
        }
      });
      restores.push(() => {
        if (own === void 0) delete elementProto.getClientRects;
        else Object.defineProperty(elementProto, "getClientRects", own);
      });
    }
  }
  patchPointGetters(mouseProto, ["clientX", "clientY", "pageX", "pageY"]);
  const TouchCtor = win.Touch;
  if (TouchCtor !== void 0) {
    patchPointGetters(TouchCtor.prototype, ["clientX", "clientY", "pageX", "pageY"]);
  }
  patch(win, "innerWidth", () => sizeOf().width);
  patch(win, "innerHeight", () => sizeOf().height);
  if (win.document.documentElement !== null) {
    patch(win.document.documentElement, "clientWidth", () => sizeOf().width);
    patch(win.document.documentElement, "clientHeight", () => sizeOf().height);
  }
  if (win.document.body !== null) {
    patch(win.document.body, "clientWidth", () => sizeOf().width);
    patch(win.document.body, "clientHeight", () => sizeOf().height);
  }
  patchDocumentPointMethod(win, "elementFromPoint", fromAppPoint, restores);
  patchDocumentPointMethod(win, "elementsFromPoint", fromAppPoint, restores);
  patchDocumentPointMethod(win, "caretRangeFromPoint", fromAppPoint, restores);
  patchDocumentPointMethod(win, "caretPositionFromPoint", fromAppPoint, restores);
  return () => {
    for (const restore of restores.reverse()) restore();
  };
}
function patchDocumentPointMethod(win, name2, fromAppPoint, restores) {
  const original = Object.getOwnPropertyDescriptor(win.document, name2);
  Object.defineProperty(win.document, name2, {
    configurable: true,
    value(x, y) {
      const visual = fromAppPoint({ x, y });
      const base = original?.value;
      return base?.call(win.document, visual.x, visual.y) ?? null;
    }
  });
  restores.push(() => {
    if (original === void 0) delete win.document[name2];
    else Object.defineProperty(win.document, name2, original);
  });
}
function toRect(rect) {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}
function makeRect(rect) {
  return new DOMRect(rect.left, rect.top, rect.width, rect.height);
}
function mapRectList(list, map) {
  const rects = [];
  for (let index = 0; index < list.length; index += 1) {
    const item = list.item(index);
    if (item !== null) rects.push(makeRect(map(toRect(item))));
  }
  return makeRectList(rects);
}
function makeRectList(rects) {
  const values = [...rects];
  return {
    length: values.length,
    item(index) {
      return values[index] ?? null;
    },
    [Symbol.iterator]() {
      return values[Symbol.iterator]();
    }
  };
}

// src/client/utils/regions.ts
function findRegions(doc) {
  const main = doc.querySelector(`[${SHELL_SLOT_ANCHOR}="main"]`);
  const center = main?.parentElement ?? null;
  const frame = center?.parentElement ?? null;
  if (frame === null) return null;
  if (!looksLikeFrame(frame)) return null;
  return {
    frame,
    sidebar: doc.querySelector(`[${SHELL_SLOT_ANCHOR}="sidebar"]`)?.parentElement ?? null,
    center,
    rightbar: doc.querySelector(`[${SHELL_SLOT_ANCHOR}="rightbar"]`)?.parentElement ?? null
  };
}
function looksLikeFrame(element) {
  if (element.style.gridTemplateColumns !== "") return true;
  return element.hasAttribute(SHELL_SIDEBAR_COLLAPSED) || element.hasAttribute("data-rightbar-collapsed") || element.querySelector(`[${SHELL_OVERLAY}]`) !== null;
}
function markRegions(regions) {
  regions.frame.setAttribute(FRAME_ATTRIBUTE, "");
  if (regions.sidebar !== null) regions.sidebar.setAttribute(REGION_ATTRIBUTE, "sidebar");
  if (regions.center !== null) regions.center.setAttribute(REGION_ATTRIBUTE, "center");
  if (regions.rightbar !== null) regions.rightbar.setAttribute(REGION_ATTRIBUTE, "rightbar");
}
function sidebarRootOf(doc) {
  const anchor = doc.querySelector(`[${SHELL_SLOT_ANCHOR}="sidebar"]`);
  const root = anchor?.firstElementChild;
  return root instanceof HTMLElement ? root : null;
}

// src/client/services/fullscreen.ts
function fullscreenFace(doc) {
  const element = doc.documentElement;
  const full = doc;
  return {
    isOn: () => doc.fullscreenElement !== null,
    isSupported: () => typeof element.requestFullscreen === "function",
    async toggle() {
      try {
        if (doc.fullscreenElement !== null) {
          if (typeof full.exitFullscreen !== "function") return "unsupported";
          await full.exitFullscreen();
          return "off";
        }
        if (typeof element.requestFullscreen !== "function") return "unsupported";
        await element.requestFullscreen();
        return "on";
      } catch (error) {
        console.warn("dsh-mobile-remote-view: \u5168\u5C4F\u8BF7\u6C42\u88AB\u62D2\u7EDD", error);
        return "refused";
      }
    },
    subscribe(listener) {
      doc.addEventListener("fullscreenchange", listener);
      return () => {
        doc.removeEventListener("fullscreenchange", listener);
      };
    }
  };
}

// src/client/services/controller.ts
var ROOT_ATTRIBUTES = [
  MODE_ATTRIBUTE,
  ROTATE_ATTRIBUTE,
  BAR_ATTRIBUTE,
  PAGE_ATTRIBUTE,
  HAS_RIGHTBAR_ATTRIBUTE
];
var ROOT_PROPERTIES = [
  CSS_VAR_VIEWPORT_W,
  CSS_VAR_VIEWPORT_H,
  CSS_VAR_SCALE,
  CSS_VAR_BAR,
  CSS_VAR_BAR_KEY,
  CSS_VAR_TOOLS,
  CSS_VAR_FONT
];
var MobileViewController = class {
  doc;
  win;
  config;
  layout;
  t;
  onLocaleChange;
  readViewport;
  fullscreen;
  state;
  section = {};
  prefs = null;
  writer;
  regions = null;
  bar = null;
  scrollView = null;
  entry = null;
  popover = null;
  popoverKind = null;
  /** The key the open popover hangs off; kept so a value change can re-anchor it. */
  popoverTrigger = null;
  findTimer = null;
  findAttempts = 0;
  entryObservers = [];
  rightbarWatch = null;
  rightbarAvailable = false;
  rightbarClosing = false;
  rightbarCloseTimer = null;
  sideSelections = null;
  lastSidebarSelection = "";
  sidebarTouchedAt = 0;
  /** The sidebar state the shell had when the mode was entered; null until seen. */
  sidebarRecordedCollapsed = null;
  sidebarExpandedByUs = false;
  sidebarRequest = null;
  sidebarControlDisabled = false;
  syncTimer = null;
  unfullscreenChange = null;
  unlocaleChange = null;
  unvirtual = null;
  resizeScheduled = false;
  markTimer = null;
  disposed = false;
  /**
   * @param deps - the page, the config, and the shell face.
   */
  constructor(deps) {
    this.doc = deps.doc;
    this.win = deps.win;
    this.config = deps.config;
    this.layout = deps.layout;
    this.t = deps.t;
    this.onLocaleChange = deps.onLocaleChange;
    this.readViewport = rawViewportReader(deps.win);
    this.fullscreen = fullscreenFace(deps.doc);
    this.prefs = readPrefs(this.localStorage());
    const saved = readSaved(this.sessionStorage());
    this.state = saved ?? { on: deps.config.autoEnter, page: "main" };
  }
  /** Attach the controls and apply the remembered state. */
  start() {
    if (this.doc.head === null || this.doc.body === null) return;
    this.bar = createBar(this.doc, this.t, {
      toggleFullscreen: () => {
        void this.toggleAppFullscreen();
      },
      pages: () => {
        this.togglePages();
      },
      closeRightbar: () => {
        this.closeRightbar();
      },
      togglePopover: (kind) => {
        this.togglePopover(kind);
      },
      flip: () => {
        this.flip();
      },
      exit: () => {
        this.exit();
      }
    });
    this.doc.body.append(this.bar.root);
    this.scrollView = createScrollStrip(this.doc, this.t, { scroll: (direction) => {
      this.scrollPage(direction);
    } });
    this.doc.body.append(this.scrollView.root);
    this.entry = createEntryButton(this.doc, this.t, () => {
      this.enter();
    });
    this.startEntryWatch();
    this.win.addEventListener("resize", this.onResize);
    this.win.addEventListener("orientationchange", this.onResize);
    this.unfullscreenChange = this.fullscreen.subscribe(() => {
      this.refreshBar();
    });
    this.unlocaleChange = this.onLocaleChange(() => {
      this.relabel();
    });
    this.doc.addEventListener("keydown", this.onKeydown, true);
    this.doc.addEventListener("click", this.onSidebarClick, true);
    this.doc.addEventListener("click", this.onOutsideClick);
    if (this.state.on) this.enter();
  }
  /** Remove every trace of the plugin from the page. */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.win.removeEventListener("resize", this.onResize);
    this.win.removeEventListener("orientationchange", this.onResize);
    this.unfullscreenChange?.();
    this.unfullscreenChange = null;
    this.unlocaleChange?.();
    this.unlocaleChange = null;
    this.doc.removeEventListener("keydown", this.onKeydown, true);
    this.doc.removeEventListener("click", this.onSidebarClick, true);
    this.doc.removeEventListener("click", this.onOutsideClick);
    this.stopFinding();
    this.stopEntryWatch();
    this.cancelSync();
    this.stopMarking();
    this.rightbarWatch?.disconnect();
    this.rightbarWatch = null;
    this.sideSelections?.disconnect();
    this.sideSelections = null;
    this.clearRightbarCloseTimer();
    this.closePopover();
    this.exit();
    this.bar?.root.remove();
    this.scrollView?.root.remove();
    this.entry?.remove();
    this.unvirtual?.();
    this.unvirtual = null;
  }
  /** Enter the mode: turn the page, mark the shell, show the bar. */
  enter() {
    if (this.disposed) return;
    this.state.on = true;
    this.persist();
    this.syncRegions();
    this.applyRoot();
    this.measure();
    this.syncVirtualization();
    this.startMarking();
    this.syncPage();
  }
  /** Leave the mode and hand the sidebar back to the shell. */
  exit() {
    if (!this.state.on) return;
    this.state.on = false;
    this.state.page = "main";
    this.persist();
    if (this.fullscreen.isOn()) void this.fullscreen.toggle();
    this.restoreSidebarOnExit();
    const root = this.doc.documentElement;
    for (const name2 of ROOT_ATTRIBUTES) root.removeAttribute(name2);
    for (const name2 of ROOT_PROPERTIES) root.style.removeProperty(name2);
    this.stopMarking();
    this.closePopover();
    this.unvirtual?.();
    this.unvirtual = null;
    this.cancelSync();
    this.sidebarRequest = null;
    this.refreshBar();
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
  applySection(section) {
    this.section = section;
    if (!this.state.on) return;
    this.applyRoot();
    this.measure();
    this.syncVirtualization();
    this.syncPage();
    this.repositionPopover();
  }
  /** Hand this controller the Settings writer. */
  setWriter(writer) {
    this.writer = writer;
  }
  /** Swap the two everyday pages; unreachable while a right panel is open. */
  togglePages() {
    if (this.rightbarAvailable) return;
    this.setPage(this.state.page === "main" ? "sidebar" : "main");
  }
  /** Show one region full screen. */
  setPage(page) {
    this.state.page = page;
    this.persist();
    this.syncPage();
  }
  /** Turn the page the other way; the preference goes to the profile. */
  flip() {
    const next = this.rotation() === -90 ? 90 : -90;
    this.write({ rotate: next }, ["rotate"], next);
    showToast(this.doc, this.win, this.t(next === -90 ? "toast.rotate.ccw" : "toast.rotate.cw"));
  }
  /** Step the scale one popover notch and remember it. */
  stepScale(direction) {
    const next = nextScale(this.activeScale(), direction);
    if (next === this.activeScale()) {
      showToast(this.doc, this.win, this.t(direction > 0 ? "toast.scale.max" : "toast.scale.min"));
      return;
    }
    this.write({ scale: next }, ["scale"], next);
    showToast(this.doc, this.win, this.t("toast.scale.value", { percent: Math.round(this.activeScale() * 100) }));
  }
  /** Step the font size one popover notch and remember it. */
  stepFont(direction) {
    const next = nextFontSize(this.activeFont(), direction);
    if (next === this.activeFont()) {
      showToast(this.doc, this.win, this.t(direction > 0 ? "toast.font.max" : "toast.font.min"));
      return;
    }
    this.write({ contentFontSize: next }, ["contentFontSize"], next);
    showToast(this.doc, this.win, this.t("toast.font.value", { size: this.activeFont() }));
  }
  /** Open or close one of the two value popovers. */
  togglePopover(kind) {
    if (this.popoverKind === kind) {
      this.closePopover();
      return;
    }
    this.closePopover();
    if (this.bar === null) return;
    const trigger = this.bar.keyElement(kind);
    if (trigger === null) return;
    this.popoverKind = kind;
    this.popoverTrigger = trigger;
    this.popover = createPopover(this.doc, kind, this.t, {
      step: (popKind, direction) => {
        if (popKind === "scale") this.stepScale(direction);
        else this.stepFont(direction);
      },
      value: (popKind) => popKind === "scale" ? this.activeScale() : this.activeFont(),
      format: (popKind, value) => popKind === "scale" ? `${String(Math.round(value * 100))}%` : `${String(value)}px`,
      close: () => {
        this.closePopover();
      }
    });
    this.bar.root.append(this.popover.root);
    this.popover.place(trigger, this.barEdgeApp());
    this.refreshBar();
  }
  /** Keep the open popover anchored to its key and showing the current value. */
  repositionPopover() {
    if (this.popover === null || this.popoverTrigger === null) return;
    this.popover.place(this.popoverTrigger, this.barEdgeApp());
  }
  /** Close the popover, if one is open. */
  closePopover() {
    this.popover?.remove();
    this.popover = null;
    this.popoverTrigger = null;
    this.popoverKind = null;
    this.refreshBar();
  }
  /** Give the app's own window the whole screen, or give it back. */
  async toggleAppFullscreen() {
    const result = await this.fullscreen.toggle();
    this.refreshBar();
    if (result === "on") showToast(this.doc, this.win, this.t("toast.fullscreen.on"));
    else if (result === "off") showToast(this.doc, this.win, this.t("toast.fullscreen.off"));
    else if (result === "refused") showToast(this.doc, this.win, this.t("toast.fullscreen.refused"));
    else showToast(this.doc, this.win, this.t("toast.fullscreen.unsupported"));
  }
  /** Close the open right panel through the shell's own control. */
  closeRightbar() {
    if (!this.rightbarAvailable) return;
    const panel = this.regions?.rightbar?.querySelector(`[${SHELL_RIGHTBAR_OPEN}]`);
    const toggle = panel instanceof HTMLElement ? panel.querySelector(`[${SHELL_RIGHTBAR_TOGGLE}]`) : null;
    if (toggle instanceof HTMLElement) toggle.click();
    this.rightbarClosing = true;
    this.clearRightbarCloseTimer();
    this.rightbarCloseTimer = this.win.setTimeout(() => {
      this.rightbarCloseTimer = null;
      if (this.rightbarClosing) {
        this.rightbarClosing = false;
        this.setPage("main");
      }
    }, RIGHTBAR_CLOSE_MS);
  }
  clearRightbarCloseTimer() {
    if (this.rightbarCloseTimer !== null) {
      this.win.clearTimeout(this.rightbarCloseTimer);
      this.rightbarCloseTimer = null;
    }
  }
  /** Scroll the page that is showing. */
  scrollPage(direction) {
    const scroller = this.findScroller();
    if (scroller === null) {
      showToast(this.doc, this.win, this.t("toast.scroll.empty"));
      return;
    }
    const distance = Math.max(80, Math.round(scroller.clientHeight * 0.7));
    try {
      scroller.scrollBy({ top: direction * distance, behavior: "smooth" });
    } catch (error) {
      console.warn("dsh-mobile-remote-view: scroll failed", error);
    }
  }
  /** The largest scrollable box inside the region that is showing. */
  findScroller() {
    const region = this.state.page === "sidebar" ? this.regions?.sidebar ?? null : this.state.page === "rightbar" ? this.regions?.rightbar ?? null : this.regions?.center ?? null;
    if (region === null) return null;
    let best = null;
    let bestOverflow = 24;
    for (const element of region.querySelectorAll("*")) {
      const overflow = element.scrollHeight - element.clientHeight;
      if (overflow <= bestOverflow || element.clientHeight < 80) continue;
      const overflowY = this.win.getComputedStyle(element).overflowY;
      if (overflowY !== "auto" && overflowY !== "scroll" && overflowY !== "overlay") continue;
      best = element;
      bestOverflow = overflow;
    }
    return best;
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
  opensMainRegion(target) {
    if (target.closest("nav") !== null) return true;
    const row = target.closest(`[${SHELL_SESSION_ROW}^="${SHELL_SESSION_PREFIX}"], [${SHELL_SESSION_ID}]`);
    if (row === null) return false;
    return target.closest('button, a[href], input, textarea, select, [role="menuitem"], [role="menu"], [role="switch"]') === null;
  }
  /** What the sidebar currently says is selected: one session row and one panel. */
  sidebarSelection() {
    const sidebar = this.regions?.sidebar ?? null;
    if (sidebar === null) return "";
    const selected = sidebar.querySelector(`[${SHELL_SESSION_ROW}][aria-selected="true"], [${SHELL_SESSION_ID}][aria-selected="true"]`);
    const row = selected?.getAttribute(SHELL_SESSION_ROW) ?? selected?.getAttribute(SHELL_SESSION_ID) ?? "";
    const panel = sidebar.querySelector("nav [aria-current]")?.textContent?.trim() ?? "";
    return `${row}|${panel}`;
  }
  /** Watch the sidebar's own selection, so a tap that only selects still switches. */
  watchSidebarSelection(region) {
    this.sideSelections?.disconnect();
    this.sideSelections = null;
    if (region === null) return;
    this.lastSidebarSelection = this.sidebarSelection();
    const observer = new MutationObserver(() => {
      this.onSidebarMutation();
    });
    observer.observe(region, {
      attributes: true,
      attributeFilter: ["aria-selected", "aria-current"],
      childList: true,
      subtree: true
    });
    this.sideSelections = observer;
  }
  /** A selection moved shortly after a sidebar tap: the shell opened something. */
  onSidebarMutation() {
    const next = this.sidebarSelection();
    const changed = next !== this.lastSidebarSelection;
    this.lastSidebarSelection = next;
    if (!changed) return;
    if (!this.state.on || this.state.page !== "sidebar") return;
    if (Date.now() - this.sidebarTouchedAt > SIDEBAR_REACTION_MS) return;
    this.setPage("main");
  }
  /** A tap anywhere in the sidebar, whether or not it is one this plugin acts on. */
  onSidebarClick = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const sidebar = this.regions?.sidebar ?? null;
    if (sidebar === null || !sidebar.contains(target)) return;
    this.sidebarTouchedAt = Date.now();
    if (!this.state.on || this.state.page !== "sidebar") return;
    if (!this.opensMainRegion(target)) return;
    this.win.requestAnimationFrame(() => {
      if (this.state.on && this.state.page === "sidebar") this.setPage("main");
    });
  };
  /** A tap outside the open popover closes it. */
  onOutsideClick = (event) => {
    if (this.popover === null) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (this.popover.root.contains(target)) return;
    this.closePopover();
  };
  /** Escape closes the open popover. */
  onKeydown = (event) => {
    if (event.key !== "Escape" || this.popover === null) return;
    event.preventDefault();
    this.closePopover();
  };
  /** Change one knob: through the profile when served, and in this page only when not. */
  write(patch, path, value) {
    if (this.writer === void 0) {
      showToast(this.doc, this.win, this.t("toast.settings.absent"));
    } else {
      this.writer(path, value);
    }
    this.applySection({ ...this.section, ...patch });
    if (patch.scale !== void 0 || patch.contentFontSize !== void 0) {
      writePrefs(this.localStorage(), { scale: this.activeScale(), contentFontSize: this.activeFont() });
    }
  }
  /** Everything the bar's faces are derived from. */
  /**
   * Re-read every label after the shell's language changed.
   *
   * The bar's own refresh re-renders its keys, so only the two builders that
   * write their text once need a nudge.
   */
  relabel() {
    this.refreshBar();
    this.scrollView?.refresh();
    this.entry?.refresh();
    if (this.popoverKind !== null) {
      const kind = this.popoverKind;
      this.closePopover();
      this.togglePopover(kind);
    }
  }
  barState() {
    return {
      page: this.state.page,
      rightbarAvailable: this.rightbarAvailable,
      fullscreen: this.fullscreen.isOn(),
      fullscreenAvailable: this.fullscreen.isSupported(),
      popoverOpen: this.popoverKind,
      scale: this.activeScale(),
      contentFontSize: this.activeFont()
    };
  }
  refreshBar() {
    if (this.disposed) return;
    this.bar?.refresh(this.barState());
  }
  /** The rotation in force: the card's value, else the boot config. */
  rotation() {
    return this.section.rotate ?? this.config.rotate;
  }
  /** The screen edge the bar sits on, in force. */
  screenBarEdge() {
    return this.section.barEdge ?? this.config.barEdge;
  }
  /** The app edge the bar occupies after the rotation. */
  barEdgeApp() {
    return appEdgeFromScreenEdge(this.screenBarEdge(), this.rotation());
  }
  /** The bar thickness in force, in app pixels. */
  barSize() {
    return this.section.barSize ?? this.config.barSize;
  }
  /** The content scale in force, within the range the page can survive. */
  activeScale() {
    const wanted = this.section.scale ?? this.prefs?.scale ?? this.config.scale;
    return clampScale(wanted);
  }
  /** The content font size in force. */
  activeFont() {
    const wanted = this.section.contentFontSize ?? this.prefs?.contentFontSize ?? this.config.contentFontSize;
    return Math.round(wanted);
  }
  /** Whether the coordinate layer is wanted. */
  virtualize() {
    return this.section.virtualizeCoordinates ?? this.config.virtualizeCoordinates;
  }
  /** Install or drop the coordinate layer to match the flag in force. */
  syncVirtualization() {
    const wanted = this.state.on && this.virtualize();
    if (wanted && this.unvirtual === null) {
      this.unvirtual = installCoordinateLayer(this.win, () => this.mapping());
    } else if (!wanted && this.unvirtual !== null) {
      this.unvirtual();
      this.unvirtual = null;
    }
  }
  /** The mapping the coordinate layer translates with. */
  mapping() {
    return { viewport: this.readViewport(), scale: this.activeScale(), rotation: this.rotation() };
  }
  /** Write the attributes and custom properties the stylesheet keys on. */
  applyRoot() {
    const root = this.doc.documentElement;
    root.setAttribute(MODE_ATTRIBUTE, "");
    if (this.rotation() === 90) root.setAttribute(ROTATE_ATTRIBUTE, "90");
    else root.removeAttribute(ROTATE_ATTRIBUTE);
    root.setAttribute(BAR_ATTRIBUTE, this.barEdgeApp());
    root.setAttribute(PAGE_ATTRIBUTE, this.state.page);
    root.setAttribute(HAS_RIGHTBAR_ATTRIBUTE, this.rightbarAvailable ? "yes" : "no");
  }
  /** Publish the live screen size and the current knobs to the stylesheet. */
  measure() {
    const viewport = this.readViewport();
    const root = this.doc.documentElement;
    root.style.setProperty(CSS_VAR_VIEWPORT_W, `${String(Math.round(viewport.width))}px`);
    root.style.setProperty(CSS_VAR_VIEWPORT_H, `${String(Math.round(viewport.height))}px`);
    root.style.setProperty(CSS_VAR_SCALE, String(this.activeScale()));
    root.style.setProperty(CSS_VAR_BAR, `${String(Math.round(this.barSize()))}px`);
    root.style.setProperty(CSS_VAR_BAR_KEY, `${String(this.keySize())}px`);
    root.style.setProperty(CSS_VAR_TOOLS, `${String(TOOLS_SIZE)}px`);
    root.style.setProperty(CSS_VAR_FONT, `${String(this.activeFont())}px`);
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
  keySize() {
    const viewport = this.readViewport();
    const edge = this.barEdgeApp();
    const box = appBox(viewport, this.activeScale());
    const length = isHorizontalEdge(edge) ? box.width : box.height;
    const free = Math.floor(length) - BAR_PADDING - BAR_GAP * (BAR_KEY_COUNT - 1) - BAR_SLACK;
    return Math.max(BAR_KEY_MIN, Math.min(BAR_KEY_MAX, Math.floor(free / BAR_KEY_COUNT)));
  }
  /** Locate and mark the shell's regions. */
  syncRegions() {
    const found = findRegions(this.doc);
    if (found === null) {
      this.scheduleFinding();
      return false;
    }
    this.regions = found;
    markRegions(found);
    if (this.sidebarRecordedCollapsed === null) {
      this.sidebarRecordedCollapsed = found.frame.hasAttribute(SHELL_SIDEBAR_COLLAPSED);
    }
    this.watchRightbar(found.rightbar);
    this.watchSidebarSelection(found.sidebar);
    this.syncRightbar();
    this.stopFinding();
    return true;
  }
  /** Poll for the shell's frame while the shell is still starting up. */
  scheduleFinding() {
    if (this.findTimer !== null || !this.state.on) return;
    if (this.findAttempts >= FIND_ATTEMPTS) return;
    this.findAttempts += 1;
    this.findTimer = this.win.setTimeout(() => {
      this.findTimer = null;
      if (this.disposed || !this.state.on) return;
      if (this.syncRegions()) this.syncPage();
      else this.scheduleFinding();
    }, FIND_INTERVAL_MS);
  }
  /** Stop polling for the frame. */
  stopFinding() {
    if (this.findTimer === null) return;
    this.win.clearTimeout(this.findTimer);
    this.findTimer = null;
  }
  /** Follow the right panel's expanded state, so it becomes a page of its own. */
  watchRightbar(region) {
    this.rightbarWatch?.disconnect();
    this.rightbarWatch = null;
    if (region === null) return;
    const observer = new MutationObserver(() => {
      this.syncRightbar();
    });
    observer.observe(region, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: [SHELL_RIGHTBAR_OPEN]
    });
    this.rightbarWatch = observer;
  }
  /** Re-read whether a right panel is expanded, and follow it with the page. */
  syncRightbar() {
    const expanded = this.regions?.rightbar?.querySelector(`[${SHELL_RIGHTBAR_OPEN}]`) != null;
    const changed = expanded !== this.rightbarAvailable;
    this.rightbarAvailable = expanded;
    if (!this.state.on) return;
    if (changed) this.doc.documentElement.setAttribute(HAS_RIGHTBAR_ATTRIBUTE, expanded ? "yes" : "no");
    if (this.rightbarClosing && !expanded) {
      this.rightbarClosing = false;
      this.clearRightbarCloseTimer();
      this.setPage("main");
      return;
    }
    if (expanded && this.state.page !== "rightbar") this.setPage("rightbar");
    else if (!expanded && this.state.page === "rightbar") this.setPage("main");
    else this.refreshBar();
  }
  /**
   * Keep the page attributes in step with the shell's sidebar state.
   *
   * The shell owns whether its sidebar is expanded; this only asks for the state
   * the current page needs, and only when the shell has not already reached it.
   */
  syncPage() {
    const frame = this.regions?.frame ?? null;
    const collapsed = frame === null ? null : frame.hasAttribute(SHELL_SIDEBAR_COLLAPSED);
    if (this.sidebarRequest !== null && collapsed !== null && this.sidebarRequest.want === "expand" === !collapsed) {
      this.sidebarExpandedByUs = this.sidebarRequest.want === "expand";
      this.sidebarRequest = null;
      this.cancelSync();
    }
    if (frame !== null && this.layout !== void 0 && this.sidebarRequest === null && !this.sidebarControlDisabled) {
      const wantsExpanded = this.state.page === "sidebar";
      if (wantsExpanded && collapsed === true) {
        this.layout.toggleSidebar();
        this.sidebarRequest = { want: "expand", attempts: 0 };
        this.scheduleSync();
      } else if (!wantsExpanded && collapsed === false && this.sidebarExpandedByUs) {
        this.layout.toggleSidebar();
        this.sidebarRequest = { want: "collapse", attempts: 0 };
        this.scheduleSync();
      }
    }
    if (this.state.on) this.doc.documentElement.setAttribute(PAGE_ATTRIBUTE, this.state.page);
    this.refreshBar();
  }
  /**
   * Check again shortly, in case the shell never answered: an unanswered request
   * blocks further ones, and a lost answer must not freeze the sidebar state.
   * Two misses disable sidebar control for the rest of the session.
   */
  scheduleSync() {
    if (this.syncTimer !== null || this.sidebarRequest === null) return;
    this.syncTimer = this.win.setTimeout(() => {
      this.syncTimer = null;
      if (this.disposed) return;
      const request = this.sidebarRequest;
      if (request === null) return;
      const frame = this.regions?.frame ?? null;
      const collapsed = frame === null ? null : frame.hasAttribute(SHELL_SIDEBAR_COLLAPSED);
      if (collapsed !== null && request.want === "expand" === !collapsed) {
        this.sidebarExpandedByUs = request.want === "expand";
        this.sidebarRequest = null;
        this.syncPage();
        return;
      }
      if (request.attempts === 0) {
        this.sidebarRequest = { want: request.want, attempts: 1 };
        this.layout?.toggleSidebar();
        this.scheduleSync();
        return;
      }
      this.sidebarRequest = null;
      this.sidebarControlDisabled = true;
      showToast(this.doc, this.win, this.t("toast.sidebar.unsupported"));
      this.syncPage();
    }, SIDEBAR_SETTLE_MS);
  }
  /** Drop a pending sidebar sync. */
  cancelSync() {
    if (this.syncTimer === null) return;
    this.win.clearTimeout(this.syncTimer);
    this.syncTimer = null;
  }
  /** Restore the sidebar to what it was before the mode, best effort once. */
  restoreSidebarOnExit() {
    if (this.sidebarControlDisabled || this.layout === void 0 || this.regions === null) return;
    if (this.sidebarRecordedCollapsed === null) return;
    const current = this.regions.frame.hasAttribute(SHELL_SIDEBAR_COLLAPSED);
    if (current === this.sidebarRecordedCollapsed) return;
    this.layout.toggleSidebar();
  }
  /** Keep the entry button in the sidebar's current DOM. */
  startEntryWatch() {
    if (this.entry === null) return;
    this.ensureEntryPlaced();
    const anchor = this.doc.querySelector(`[${SHELL_SLOT_ANCHOR}="sidebar"]`);
    if (anchor !== null) {
      const anchorObserver = new MutationObserver(() => {
        this.ensureEntryPlaced();
      });
      anchorObserver.observe(anchor, { childList: true });
      this.entryObservers.push(anchorObserver);
    }
  }
  /** Put the entry button into the shell's current sidebar root, or keep looking. */
  ensureEntryPlaced() {
    if (this.disposed || this.entry === null) return;
    const root = sidebarRootOf(this.doc);
    if (root === null) {
      this.scheduleEntryFind();
      return;
    }
    this.stopEntryFind();
    this.entry.ensureIn(root);
    if (this.entryObservedRoot !== root) {
      const rootObserver = new MutationObserver(() => {
        if (this.entry !== null && !this.entry.root.isConnected) this.ensureEntryPlaced();
      });
      rootObserver.observe(root, { childList: true, subtree: true });
      this.entryObservers.push(rootObserver);
      this.entryObservedRoot = root;
    }
  }
  entryFindTimer = null;
  entryFindAttempts = 0;
  entryObservedRoot = null;
  /** Poll for the sidebar root while the shell is still starting up. */
  scheduleEntryFind() {
    if (this.entryFindTimer !== null || this.disposed) return;
    if (this.entryFindAttempts >= FIND_ATTEMPTS) return;
    this.entryFindAttempts += 1;
    this.entryFindTimer = this.win.setTimeout(() => {
      this.entryFindTimer = null;
      if (this.disposed) return;
      const root = sidebarRootOf(this.doc);
      if (root === null) this.scheduleEntryFind();
      else this.ensureEntryPlaced();
    }, FIND_INTERVAL_MS);
  }
  stopEntryFind() {
    if (this.entryFindTimer === null) return;
    this.win.clearTimeout(this.entryFindTimer);
    this.entryFindTimer = null;
  }
  stopEntryWatch() {
    for (const observer of this.entryObservers) observer.disconnect();
    this.entryObservers = [];
    this.entryObservedRoot = null;
    this.stopEntryFind();
  }
  /** Start keeping the composer's primary button marked. */
  startMarking() {
    if (this.markTimer !== null) return;
    this.markPrimaryComposerButton();
    this.markTimer = this.win.setInterval(() => {
      if (this.disposed || !this.state.on) return;
      if (this.doc.visibilityState === "hidden") return;
      this.markPrimaryComposerButton();
    }, MARK_INTERVAL_MS);
  }
  /** Stop marking, and drop the mark so the stylesheet stops matching it. */
  stopMarking() {
    if (this.markTimer !== null) {
      this.win.clearInterval(this.markTimer);
      this.markTimer = null;
    }
    this.doc.querySelector(`[${PRIMARY_ATTRIBUTE}]`)?.removeAttribute(PRIMARY_ATTRIBUTE);
  }
  /**
   * Mark the composer's primary button — the one that sends or stops.
   *
   * The shell publishes no attribute for it, and the two controls on either
   * side of it belong to slots. What is stable is position: inside the composer
   * card, the trailing row's last button is the primary action, in every
   * variant of the composer.
   */
  markPrimaryComposerButton() {
    const card = this.doc.querySelector(`[${SHELL_COMPOSER_CARD}]`);
    if (card === null) return;
    const buttons = card.querySelectorAll("button");
    const primary = buttons.length === 0 ? null : buttons[buttons.length - 1] ?? null;
    if (primary === null) return;
    const marked = this.doc.querySelector(`[${PRIMARY_ATTRIBUTE}]`);
    if (marked === primary) return;
    marked?.removeAttribute(PRIMARY_ATTRIBUTE);
    primary.setAttribute(PRIMARY_ATTRIBUTE, "");
  }
  /** Re-measure on the next frame; resize fires in bursts. */
  scheduleMeasure() {
    if (this.resizeScheduled || !this.state.on) return;
    this.resizeScheduled = true;
    this.win.requestAnimationFrame(() => {
      this.resizeScheduled = false;
      if (this.disposed || !this.state.on) return;
      this.measure();
      if (this.regions !== null && !this.regions.frame.isConnected) {
        this.regions = null;
        this.syncRegions();
      }
      this.syncPage();
    });
  }
  /** Window resize handler; bound once. */
  onResize = () => {
    this.scheduleMeasure();
  };
  /** The page's storage, when it has one. */
  sessionStorage() {
    try {
      return this.win.sessionStorage ?? void 0;
    } catch {
      return void 0;
    }
  }
  /** The page's local storage, when it has one. */
  localStorage() {
    try {
      return this.win.localStorage ?? void 0;
    } catch {
      return void 0;
    }
  }
  /** Remember the current state. */
  persist() {
    writeSaved(this.sessionStorage(), { on: this.state.on, page: this.state.page });
  }
};

// src/client/styles.ts
var STYLES = `
html[${MODE_ATTRIBUTE}] {
  /* Screen size in CSS px; the script refreshes these from the live viewport. */
  --dsh-mrv-vw: 100vw;
  --dsh-mrv-vh: 100vh;
  --dsh-mrv-scale: 1;
  /* Bar thickness, in app px. */
  --dsh-mrv-bar: 58px;
  /* Floor for one bar key measured along the strip. */
  --dsh-mrv-bar-btn: 34px;
  /* The scroll strip beside the bar. */
  --dsh-mrv-tools: 46px;
  /* Conversation and composer text size; the script refreshes it from config. */
  --dsh-mrv-content-font: 19px;
  /* No window chrome band: the desktop window's top strip is not where the
     person is looking any more, and the clearance would pad the rotated page. */
  --dsh-frame-leading-clearance: 0px !important;
  box-sizing: border-box !important;
  width: calc(var(--dsh-mrv-vh) / var(--dsh-mrv-scale)) !important;
  height: calc(var(--dsh-mrv-vw) / var(--dsh-mrv-scale)) !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  overflow: hidden !important;
  overscroll-behavior: none !important;
  -webkit-text-size-adjust: 100%;
  transform-origin: 0 0 !important;
  transform: translateY(var(--dsh-mrv-vh)) rotate(-90deg) scale(var(--dsh-mrv-scale)) !important;
  background: var(--dsw-alias-bg-base, #ffffff) !important;
}

html[${MODE_ATTRIBUTE}][data-mobile-remote-view-rotate="90"] {
  transform: translateX(var(--dsh-mrv-vw)) rotate(90deg) scale(var(--dsh-mrv-scale)) !important;
}

html[${MODE_ATTRIBUTE}] body {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: var(--dsw-alias-bg-base, #ffffff) !important;
}

html[${MODE_ATTRIBUTE}] #root {
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* ---- the frame becomes the app surface, laid out in the rotated box ---- */

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-frame] {
  position: absolute !important;
  inset: 0 !important;
  box-sizing: border-box !important;
  grid-template-columns: minmax(0, 1fr) !important;
  grid-template-rows: minmax(0, 1fr) !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* The bar and the scroll strip reserve one edge; the frame keeps clear of it. */
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="right"] [data-mobile-remote-view-frame] {
  padding-right: calc(var(--dsh-mrv-bar) + var(--dsh-mrv-tools)) !important;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="left"] [data-mobile-remote-view-frame] {
  padding-left: calc(var(--dsh-mrv-bar) + var(--dsh-mrv-tools)) !important;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="top"] [data-mobile-remote-view-frame] {
  padding-top: calc(var(--dsh-mrv-bar) + var(--dsh-mrv-tools)) !important;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="bottom"] [data-mobile-remote-view-frame] {
  padding-bottom: calc(var(--dsh-mrv-bar) + var(--dsh-mrv-tools)) !important;
}

/* One column at a time: the page attribute names the visible one. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-region] {
  display: none !important;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-page="main"] [data-mobile-remote-view-region="center"],
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-page="sidebar"] [data-mobile-remote-view-region="sidebar"],
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-page="rightbar"] [data-mobile-remote-view-region="rightbar"] {
  display: block !important;
  grid-area: 1 / 1 !important;
  min-width: 0 !important;
  min-height: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* Anything else direct in the frame grid is not one of the three columns. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-frame] > :not([data-mobile-remote-view-region]) {
  display: none !important;
}

/* ---- the sidebar page fills the box, and its rows grow for a thumb ----
   The shell sizes its own sidebar with an inline width (260\u2013280px) meant for
   the three-column layout; on the sidebar page that column is the whole screen,
   so the shell's width is overridden rather than respected. The rows are 32\u201336px
   mouse targets in the desktop layout and become real touch targets here. */

html[${MODE_ATTRIBUTE}][data-mobile-remote-view-page="sidebar"] [data-mobile-remote-view-region="sidebar"] [data-slot="sidebar"] > * {
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box !important;
}

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-region="sidebar"] button,
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-region="sidebar"] [role="treeitem"] {
  min-height: 48px !important;
}

/* The rail keeps its 36px square icons; only the label is dropped. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-region="sidebar"] [data-slot="sidebar"] nav button {
  min-height: 44px !important;
}

/* ---- the control bar and the scroll strip, along one app edge ---- */

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] {
  position: absolute !important;
  z-index: 2147483000;
  display: flex !important;
  box-sizing: border-box !important;
  padding: 3px !important;
  gap: 2px !important;
  margin: 0 !important;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 0.5px solid var(--dsw-alias-border-l3, #00000026);
  font-family: var(--dsw-font-family, sans-serif);
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="right"] [data-mobile-remote-view-bar-root] {
  right: 0; top: 0; width: var(--dsh-mrv-bar); height: 100%;
  flex-direction: column; border-left: none; border-top: none; border-bottom: none;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="left"] [data-mobile-remote-view-bar-root] {
  left: 0; top: 0; width: var(--dsh-mrv-bar); height: 100%;
  flex-direction: column; border-right: none; border-top: none; border-bottom: none;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="top"] [data-mobile-remote-view-bar-root] {
  top: 0; left: 0; width: 100%; height: var(--dsh-mrv-bar);
  flex-direction: row; border-left: none; border-right: none; border-top: none;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="bottom"] [data-mobile-remote-view-bar-root] {
  bottom: 0; left: 0; width: 100%; height: var(--dsh-mrv-bar);
  flex-direction: row; border-left: none; border-right: none; border-bottom: none;
}

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  padding: 1px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #101114);
  font-family: inherit;
  font-size: calc(var(--dsh-mrv-bar-btn) * 0.4);
  font-weight: 500;
  line-height: 1.1;
  cursor: pointer;
  overflow: hidden;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="left"] [data-mobile-remote-view-bar-root] > button,
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="right"] [data-mobile-remote-view-bar-root] > button {
  min-height: var(--dsh-mrv-bar-btn);
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="top"] [data-mobile-remote-view-bar-root] > button,
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="bottom"] [data-mobile-remote-view-bar-root] > button {
  min-width: var(--dsh-mrv-bar-btn);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button[hidden] {
  display: none !important;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button:hover,
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button:focus-visible {
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button[data-mobile-remote-view-active] {
  background: var(--dsw-alias-accent-soft, #e6eefc);
  color: var(--dsw-alias-accent-strong, #1a5bdb);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button[data-mobile-remote-view-danger] {
  color: var(--dsw-alias-danger-strong, #c62828);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button svg {
  width: calc(var(--dsh-mrv-bar-btn) * 0.5);
  height: calc(var(--dsh-mrv-bar-btn) * 0.5);
  display: block;
  flex: none;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-bar-root] > button span {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The scroll strip sits just inside the bar, along the same edge. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-scroll-root] {
  position: absolute !important;
  z-index: 2147482990;
  display: flex !important;
  box-sizing: border-box !important;
  gap: 2px !important;
  padding: 2px !important;
  margin: 0 !important;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 0.5px solid var(--dsw-alias-border-l3, #00000026);
  font-family: var(--dsw-font-family, sans-serif);
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="right"] [data-mobile-remote-view-scroll-root] {
  right: var(--dsh-mrv-bar); top: 0; width: var(--dsh-mrv-tools); height: 100%;
  flex-direction: column;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="left"] [data-mobile-remote-view-scroll-root] {
  left: var(--dsh-mrv-bar); top: 0; width: var(--dsh-mrv-tools); height: 100%;
  flex-direction: column;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="top"] [data-mobile-remote-view-scroll-root] {
  top: var(--dsh-mrv-bar); left: 0; width: 100%; height: var(--dsh-mrv-tools);
  flex-direction: row;
}
html[${MODE_ATTRIBUTE}][data-mobile-remote-view-bar="bottom"] [data-mobile-remote-view-scroll-root] {
  bottom: var(--dsh-mrv-bar); left: 0; width: 100%; height: var(--dsh-mrv-tools);
  flex-direction: row;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-scroll-root] > button {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #101114);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-scroll-root] > button:hover {
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-scroll-root] > button svg {
  width: 18px;
  height: 18px;
  display: block;
}

/* ---- the value popovers, beside their trigger keys ---- */

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] {
  position: absolute !important;
  z-index: 2147483010;
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  padding: 6px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 0.5px solid var(--dsw-alias-border-l3, #00000026);
  box-shadow: 0 4px 16px #00000026;
  font-family: var(--dsw-font-family, sans-serif);
  font-size: 14px;
  color: var(--dsw-alias-label-primary, #101114);
  max-height: 200px;
  overflow: auto;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] > span {
  min-width: 56px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] > button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
  color: inherit;
  cursor: pointer;
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] > button:hover {
  background: var(--dsw-alias-bg-layer-3, #e8eaee);
}
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-popover] > button svg {
  width: 18px;
  height: 18px;
  display: block;
}

/* ---- the toast ---- */

html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-toast] {
  position: absolute !important;
  z-index: 2147483020;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
  max-width: 80%;
  padding: 8px 14px;
  border-radius: 999px;
  background: #000000cc;
  color: #ffffff;
  font-family: var(--dsw-font-family, sans-serif);
  font-size: 13px;
  line-height: 1.3;
  pointer-events: none;
}

/* ---- thumb-sized controls on a phone screen ----
   The two gestures a phone session lives on: sending, and answering an
   approval. Both are 28\u201332px in the desktop layout, which is a mouse target;
   here they get a real touch target and the text beside them grows with the
   conversation. The composer's own primary button is marked by the script \u2014
   it is the last button in the composer card, and the shell publishes no
   attribute of its own for it. */

/* The shell writes the content font size as an INLINE custom property on the
   body element (its boot script sets it, and the theme presenter rewrites it
   from the setting), and every derived markdown size hangs off it. An inline
   style outranks a plain rule on any ancestor, so the mode's own value is
   applied on the body itself and with !important \u2014 that is what makes
   \u300C\u6B63\u6587\u5B57\u53F7\u300D bite. */
html[${MODE_ATTRIBUTE}] body {
  --dsh-content-font-size: var(--dsh-mrv-content-font) !important;
}
html[${MODE_ATTRIBUTE}] [data-composer-card] button[data-mobile-remote-view-primary] {
  min-width: 48px !important;
  min-height: 48px !important;
  width: 48px !important;
  height: 48px !important;
}
html[${MODE_ATTRIBUTE}] [data-composer-card] button[data-mobile-remote-view-primary] svg {
  width: 22px !important;
  height: 22px !important;
}
html[${MODE_ATTRIBUTE}] [data-approval-key] button {
  min-height: 48px !important;
  font-size: 15px !important;
}

/* ---- what the mode hides ---- */

/* The column resize handle is a mouse affordance; dragging 1px on a phone is
   not a gesture worth keeping. */
html[${MODE_ATTRIBUTE}] [data-side] {
  display: none !important;
}

/* ---- the way in, while the mode is off ----
   A full-width row in the sidebar, between the logo row and the new-session
   button: one icon plus a label, styled from the shell's own tokens. */

/* The mode's own strips are invisible until the mode attribute is on. */
[data-mobile-remote-view-bar-root],
[data-mobile-remote-view-scroll-root] {
  display: none;
}

[data-mobile-remote-view-entry] {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
  padding: 8px 12px;
  /* Clear of the new-session row directly below it. */
  margin: 4px 0 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #101114);
  font-family: var(--dsw-font-family, sans-serif);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
}
[data-mobile-remote-view-entry]:hover,
[data-mobile-remote-view-entry]:focus-visible {
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
}
[data-mobile-remote-view-entry] svg {
  width: 16px;
  height: 16px;
  display: block;
  flex: none;
}

/* In the collapsed rail the shell's own rows are 36px squares; the way in
   follows them: the glyph only, no label, no width the rail does not have. */
[data-sidebar-collapsed] [data-mobile-remote-view-entry],
[data-sidebar-collapsed] [data-mobile-remote-view-entry]:hover {
  width: 36px !important;
  min-width: 36px !important;
  max-width: 36px !important;
  height: 36px !important;
  min-height: 36px !important;
  margin: 4px 0 8px !important;
  padding: 0 !important;
  justify-content: center;
  gap: 0;
  overflow: hidden;
}
[data-sidebar-collapsed] [data-mobile-remote-view-entry] > span:not([aria-hidden]) {
  display: none !important;
}

/* The way in is only shown while the mode is off. */
html[${MODE_ATTRIBUTE}] [data-mobile-remote-view-entry] {
  display: none !important;
}

/* Menus and dialogs are portalled to body, inside the rotated box; a viewport
   unit cap would measure the screen's short side, so keep them inside the app
   box instead. */
html[${MODE_ATTRIBUTE}] [role="menu"],
html[${MODE_ATTRIBUTE}] [role="listbox"],
html[${MODE_ATTRIBUTE}] [role="dialog"] {
  max-width: calc(var(--dsh-mrv-vh) / var(--dsh-mrv-scale)) !important;
  max-height: calc(var(--dsh-mrv-vw) / var(--dsh-mrv-scale)) !important;
}
`;
function installStyles(doc) {
  const style = doc.createElement("style");
  style.setAttribute("data-mobile-remote-view-styles", "");
  style.textContent = STYLES;
  doc.head.append(style);
  return () => {
    style.remove();
  };
}

// src/client/stylesCard.ts
var CARD_STYLES = `
.dshMrvPanel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
  font-family: var(--dsw-font-family, sans-serif);
}
.dshMrvNote {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, #5a5e66);
}
.dshMrvGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.dshMrvField {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dshMrvFieldLabel {
  font-size: 13px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #101114);
}
.dshMrvFieldHint {
  font-size: 11px;
  line-height: 1.4;
  color: var(--dsw-alias-label-secondary, #5a5e66);
}
.dshMrvFieldControl select,
.dshMrvFieldControl input[type="number"] {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 8px;
  border: 0.5px solid var(--dsw-alias-border-l3, #00000026);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #101114);
  font: inherit;
  font-size: 13px;
}
.dshMrvFieldControl select:disabled,
.dshMrvFieldControl input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dshMrvToggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dshMrvToggle {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}
.dshMrvToggle input {
  margin-top: 3px;
}
.dshMrvToggle > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dshMrvFoot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dshMrvFoot button {
  padding: 6px 12px;
  border: 0.5px solid var(--dsw-alias-border-l3, #00000026);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #101114);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dshMrvFoot button:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
}
.dshMrvFoot button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dshMrvStatus {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #5a5e66);
}
`;
function installCardStyles(doc) {
  const style = doc.createElement("style");
  style.setAttribute("data-mobile-remote-view-card-styles", "");
  style.textContent = CARD_STYLES;
  doc.head.append(style);
  return () => {
    style.remove();
  };
}

// src/client/index.ts
var name = PLUGIN_ID;
var inject = ["layout"];
function apply(ctx) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const config = readConfig(globalThis);
  const knobsPublished = hostPublished(globalThis);
  const service = ctx;
  const layout = service.get("layout");
  const t = installLocale(ctx);
  const controller = new MobileViewController({
    doc: document,
    win: window,
    config,
    layout,
    t,
    onLocaleChange: (listener) => subscribeLocale(ctx, listener)
  });
  const unstyles = installStyles(document);
  const uncardStyles = installCardStyles(document);
  const start = () => {
    controller.start();
  };
  if (document.body === null) document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
  ctx.effect(() => () => {
    controller.dispose();
    unstyles();
    uncardStyles();
  }, "dsh-mobile-remote-view: page mode");
  ctx.inject(["configForms", "slots"], (child) => {
    const forms = child.get("configForms");
    if (forms === void 0) return;
    const form = forms.get(SETTINGS_NAMESPACE);
    let barWritesInFlight = 0;
    const applyPublished = () => {
      controller.applySection(sectionOf(form.getSnapshot().value));
    };
    const settle = () => {
      barWritesInFlight -= 1;
      if (barWritesInFlight === 0) applyPublished();
    };
    child.effect(() => {
      const sync = () => {
        if (barWritesInFlight === 0) applyPublished();
      };
      const unsubscribe = form.subscribe(sync);
      sync();
      return unsubscribe;
    }, "dsh-mobile-remote-view: apply the card settings live");
    controller.setWriter((path, value) => {
      barWritesInFlight += 1;
      void form.mutate([{ op: "set", path, value }]).then(settle, settle);
    });
    const slots = child.get("slots");
    if (slots === void 0) return;
    child.effect(() => {
      slots.inject("plugins.bundle.config", () => {
        slots.register(
          {
            name: "plugins.bundle.config",
            // Keyed by the bundle's package name, which is also the namespace.
            key: SETTINGS_NAMESPACE,
            inject: () => ({
              form,
              hostPublished: knobsPublished,
              t,
              subscribeLocale: (listener) => subscribeLocale(ctx, listener)
            })
          },
          MobileRemoteViewPanel
        );
      });
    }, "dsh-mobile-remote-view: the knobs on the plugin card");
  });
}

		delete module.exports.__esModule;
		return module.exports;
	}
});
