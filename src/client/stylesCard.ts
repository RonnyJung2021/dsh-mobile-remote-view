/**
 * The card's own stylesheet: plain classes the panel renders, nothing shared
 * with the shell. Installed once per page, scoped by the panel's own class so
 * other plugins' cards cannot collide with it.
 */

/** Stylesheet text for the configuration card. */
export const CARD_STYLES = `
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
`

/**
 * Install the card stylesheet.
 * @param doc - the page's document.
 * @returns the disposer removing the style element.
 */
export function installCardStyles(doc: Document): () => void {
  const style = doc.createElement('style')
  style.setAttribute('data-mobile-remote-view-card-styles', '')
  style.textContent = CARD_STYLES
  doc.head.append(style)
  return () => { style.remove() }
}
