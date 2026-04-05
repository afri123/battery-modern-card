import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- VISUELLER EDITOR ---
class BatteryModernCardEditor extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }
  setConfig(config) { this.config = config; }

  _changeValue(field, value) {
    if (!this.config || !this.hass) return;
    this.config = { ...this.config, [field]: value };
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
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor-container { display: flex; flex-direction: column; gap: 12px; }
      .panel-content { padding: 12px 0; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      ha-textfield, ha-icon-picker { width: 100%; }
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
  static getStubConfig() { return { title: "Batteriestatus" }; }

  setConfig(config) { this.config = config; }

  _getDynamicColor(value) {
    if (value <= 20) return "#f44336"; 
    if (value <= 40) return "#ff9800"; 
    if (value <= 60) return "#ffeb3b"; 
    return "#4caf50"; 
  }

  _getBatteryIcon(value) {
    if (value <= 5) return "mdi:battery-outline";
    if (value >= 95) return "mdi:battery";
    const rounded = Math.round(value / 10) * 10;
    return `mdi:battery-${rounded}`;
  }

  render() {
    if (!this.hass) return html``;

    // BREITERE ERKENNUNGSLOGIK
    const batteries = Object.keys(this.hass.states)
      .filter(entityId => {
        const state = this.hass.states[entityId];
        const attributes = state.attributes || {};
        const deviceClass = attributes.device_class;
        const unit = attributes.unit_of_measurement;
        const friendlyName = (attributes.friendly_name || "").toLowerCase();
        const idLower = entityId.toLowerCase();

        // 1. Check auf Device Class
        if (deviceClass === 'battery') return true;

        // 2. Check auf Einheit % UND Name (Battery/Akku/Ladestand)
        const isPercent = unit === '%';
        const hasBatteryName = idLower.includes('battery') || 
                               idLower.includes('akku') || 
                               idLower.includes('ladestand') ||
                               friendlyName.includes('battery') ||
                               friendlyName.includes('akku');

        return isPercent && hasBatteryName;
      })
      .map(id => {
        const stateObj = this.hass.states[id];
        const val = parseFloat(stateObj.state);
        return {
          id: id,
          name: stateObj.attributes.friendly_name || id,
          state: val
        };
      })
      // Nur valide Zahlen behalten und Unbekannt/Unavailable filtern
      .filter(b => !isNaN(b.state))
      // Sortierung: Niedrigster Ladestand oben
      .sort((a, b) => a.state - b.state);

    const avg = batteries.length > 0 ? (batteries.reduce((a, b) => a + b.state, 0) / batteries.length).toFixed(0) : '-';
    const criticalCount = batteries.filter(b => b.state <= 20).length;

    return html`
      <ha-card>
        <div class="custom-header">
          ${this.config.title_icon ? html`<ha-icon icon="${this.config.title_icon}" class="header-icon"></ha-icon>` : ''}
          <span class="header-title">${this.config.title || 'Batteriestatus'}</span>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-content">
              <span class="stat-value">${avg}%</span>
              <span class="stat-name">Ø System</span>
            </div>
          </div>
          <div class="stat-box ${criticalCount > 0 ? 'critical-border' : ''}">
            <div class="stat-content">
              <span class="stat-value ${criticalCount > 0 ? 'critical-text' : ''}">${criticalCount}</span>
              <span class="stat-name">Kritisch</span>
            </div>
          </div>
        </div>

        <div class="card-content">
          <div class="battery-list">
            ${batteries.length === 0 ? html`<p style="text-align:center; color: var(--secondary-text-color);">Keine Batterien gefunden</p>` : ''}
            ${batteries.map(b => html`
              <div class="battery-item">
                <div class="battery-icon" style="color: ${this._getDynamicColor(b.state)}">
                  <ha-icon icon="${this._getBatteryIcon(b.state)}"></ha-icon>
                </div>
                <div class="battery-info">
                  <div class="battery-name">${b.name}</div>
                  <div class="battery-status-text">${b.state <= 20 ? 'Kritisch' : 'Normal'}</div>
                </div>
                <div class="battery-value" style="color: ${this._getDynamicColor(b.state)}">
                  ${b.state}%
                </div>
              </div>
            `)}
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .custom-header { padding: 24px 16px 16px; display: flex; align-items: center; gap: 12px; }
      .header-icon { --mdc-icon-size: 28px; }
      .header-title { font-size: 24px; font-weight: 400; }
      .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 16px 20px; }
      .stat-box {
        position: relative; border-radius: 12px; padding: 20px 12px;
        background: var(--ha-card-background, var(--card-background-color, white));
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02);
        display: flex; flex-direction: column; align-items: center; text-align: center;
        transition: transform 0.2s ease;
      }
      .stat-box:hover { transform: translateY(-2px); }
      .critical-border { border: 1px solid #f44336; }
      .critical-text { color: #f44336; }
      .stat-value { font-size: 2.2rem; font-weight: 500; line-height: 1.2; }
      .stat-name { font-size: 0.8rem; color: var(--secondary-text-color); font-weight: 600; text-transform: uppercase; }
      .card-content { padding: 0 16px 16px; }
      .battery-list { display: flex; flex-direction: column; gap: 12px; }
      .battery-item {
        display: flex; align-items: center; padding: 12px 14px; border-radius: 12px;
        background: var(--ha-card-background, var(--card-background-color, white));
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        transition: transform 0.2s ease, filter 0.2s ease;
      }
      .battery-item:hover { transform: translateY(-2px); filter: brightness(0.98); }
      .battery-icon { margin-right: 16px; }
      .battery-info { flex-grow: 1; overflow: hidden; }
      .battery-name { font-weight: 600; font-size: 1rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
      .battery-status-text { font-size: 0.8rem; color: var(--secondary-text-color); }
      .battery-value { font-weight: bold; font-size: 1.1rem; }
    `;
  }
}
customElements.define("battery-modern-card", BatteryModernCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "battery-modern-card",
  name: "Battery Modern Card",
  description: "Erkennt automatisch alle Akkus.",
  preview: true
});
