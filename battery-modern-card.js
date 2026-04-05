import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- VISUELLER EDITOR ---
class BatteryModernCardEditor extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = { ...config, include: config.include || [], exclude: config.exclude || [] }; }

  _changeValue(field, value) {
    if (!this.config || !this.hass) return;
    this.config = { ...this.config, [field]: value };
    this._fireChanged();
  }

  _fireChanged() {
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: this.config };
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this.config) return html``;
    return html`
      <div class="editor-container">
        <ha-expansion-panel header="Karten-Titel & Design" outlined expanded>
          <div class="panel-content">
            <div class="grid-2">
              <ha-textfield label="Titel" .value="${this.config.title || ''}" @input="${(e) => this._changeValue('title', e.target.value)}"></ha-textfield>
              <ha-icon-picker .hass=${this.hass} .value=${this.config.title_icon || ''} label="Titel Icon" @value-changed=${(e) => this._changeValue('title_icon', e.detail.value)}></ha-icon-picker>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Manuelle Filter (Optional)" outlined>
          <div class="panel-content">
            <p style="font-size: 0.85rem; color: var(--secondary-text-color);">Hier kannst du Entitäten ausschließen, die die Automatik fälschlicherweise erkennt.</p>
            <ha-entity-picker .hass=${this.hass} label="Entität ausschließen" @value-changed=${(e) => {
              const val = e.detail.value;
              if(val) {
                const exclude = [...(this.config.exclude || []), val];
                this._changeValue('exclude', exclude);
              }
            }}></ha-entity-picker>
            <div class="chip-container">
              ${(this.config.exclude || []).map((id, index) => html`
                <div class="chip">${id} <ha-icon icon="mdi:close" @click=${() => {
                  const exclude = [...this.config.exclude];
                  exclude.splice(index, 1);
                  this._changeValue('exclude', exclude);
                }}></ha-icon></div>
              `)}
            </div>
          </div>
        </ha-expansion-panel>
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor-container { display: flex; flex-direction: column; gap: 12px; }
      .panel-content { padding: 12px 0; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .chip-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .chip { background: var(--secondary-background-color); padding: 4px 8px; border-radius: 16px; font-size: 0.8rem; display: flex; align-items: center; gap: 4px; }
      .chip ha-icon { --mdc-icon-size: 14px; cursor: pointer; }
    `;
  }
}
customElements.define("battery-modern-card-editor", BatteryModernCardEditor);

// --- FRONTEND KARTE ---
class BatteryModernCard extends LitElement {
  static get properties() {
    return { hass: { type: Object }, config: { type: Object } };
  }

  static getConfigElement() { return document.createElement("battery-modern-card-editor"); }
  static getStubConfig() { return { title: "Batteriestatus", exclude: [] }; }

  setConfig(config) { this.config = config; }

  _getDynamicColor(value) {
    if (value <= 20) return "#f44336"; // Rot
    if (value <= 40) return "#ff9800"; // Orange
    if (value <= 60) return "#ffeb3b"; // Gelb
    return "#4caf50"; // Grün
  }

  _getBatteryIcon(value) {
    if (value <= 5) return "mdi:battery-outline";
    if (value >= 95) return "mdi:battery";
    return `mdi:battery-${Math.round(value / 10) * 10}`;
  }

  render() {
    if (!this.hass) return html``;

    // 1. Alle Batterien finden
    const allBatteries = Object.keys(this.hass.states)
      .filter(id => {
        const s = this.hass.states[id];
        const isExcluded = (this.config.exclude || []).includes(id);
        if (isExcluded) return false;

        const dc = s.attributes.device_class;
        const unit = s.attributes.unit_of_measurement;
        const name = (s.attributes.friendly_name || "").toLowerCase();
        return dc === 'battery' || (unit === '%' && (id.includes('battery') || id.includes('akku') || name.includes('akku')));
      })
      .map(id => ({
        id,
        name: this.hass.states[id].attributes.friendly_name || id,
        state: parseFloat(this.hass.states[id].state)
      }))
      .filter(b => !isNaN(b.state))
      .sort((a, b) => a.state - b.state);

    // 2. Aufteilen in Kritisch (0-40) und OK (>40)
    const critical = allBatteries.filter(b => b.state <= 40);
    const healthy = allBatteries.filter(b => b.state > 40);

    return html`
      <ha-card>
        <div class="custom-header">
          ${this.config.title_icon ? html`<ha-icon icon="${this.config.title_icon}" class="header-icon"></ha-icon>` : ''}
          <span class="header-title">${this.config.title || 'Batteriestatus'}</span>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-content">
              <span class="stat-value">${allBatteries.length}</span>
              <span class="stat-name">Batterien</span>
            </div>
          </div>
          <div class="stat-box ${critical.length > 0 ? 'warning-bg' : ''}">
            <div class="stat-content">
              <span class="stat-value">${critical.length}</span>
              <span class="stat-name">Aktion nötig</span>
            </div>
          </div>
        </div>

        <div class="card-content">
          <div class="battery-list">
            ${critical.map(b => this._renderBatteryItem(b))}
            
            ${critical.length === 0 && healthy.length === 0 ? html`<p class="empty-msg">Keine Batterien erkannt</p>` : ''}
          </div>

          ${healthy.length > 0 ? html`
            <ha-expansion-panel header="Alle anderen Batterien anzeigen (${healthy.length})" outlined class="healthy-panel">
              <div class="battery-list panel-list">
                ${healthy.map(b => this._renderBatteryItem(b))}
              </div>
            </ha-expansion-panel>
          ` : ''}
        </div>
      </ha-card>
    `;
  }

  _renderBatteryItem(b) {
    return html`
      <div class="battery-item">
        <div class="battery-icon" style="color: ${this._getDynamicColor(b.state)}">
          <ha-icon icon="${this._getBatteryIcon(b.state)}"></ha-icon>
        </div>
        <div class="battery-info">
          <div class="battery-name">${b.name}</div>
        </div>
        <div class="battery-value" style="color: ${this._getDynamicColor(b.state)}">
          ${b.state}%
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .custom-header { padding: 24px 16px 16px; display: flex; align-items: center; gap: 12px; }
      .header-icon { --mdc-icon-size: 28px; }
      .header-title { font-size: 24px; font-weight: 400; }

      .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 16px 20px; }
      .stat-box {
        border-radius: 12px; padding: 20px 12px;
        background: var(--ha-card-background, var(--card-background-color, white));
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02);
        display: flex; flex-direction: column; align-items: center; text-align: center;
      }
      .warning-bg { border: 1px solid #ff9800; }
      .stat-value { font-size: 2.2rem; font-weight: 500; line-height: 1.2; }
      .stat-name { font-size: 0.8rem; color: var(--secondary-text-color); font-weight: 600; text-transform: uppercase; }

      .card-content { padding: 0 16px 16px; }
      .battery-list { display: flex; flex-direction: column; gap: 10px; }
      .panel-list { padding: 10px 0; }
      
      .battery-item {
        display: flex; align-items: center; padding: 12px 14px; border-radius: 12px;
        background: var(--ha-card-background, var(--card-background-color, white));
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      }
      .battery-icon { margin-right: 16px; }
      .battery-info { flex-grow: 1; overflow: hidden; }
      .battery-name { font-weight: 600; font-size: 1rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
      .battery-value { font-weight: bold; font-size: 1.1rem; }
      
      .healthy-panel { margin-top: 20px; --ha-card-border-radius: 12px; }
      .empty-msg { text-align: center; color: var(--secondary-text-color); padding: 20px; }
    `;
  }
}
customElements.define("battery-modern-card", BatteryModernCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "battery-modern-card",
  name: "Battery Modern Card (Smart Filter)",
  description: "Zeigt nur leere Batterien sofort, den Rest im Akkordeon.",
  preview: true
});
