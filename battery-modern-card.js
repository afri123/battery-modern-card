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
              <ha-textfield label="Schwellenwert für 'Kritisch' (%)" type="number" .value="${this.config.critical_threshold || 20}" @input="${(e) => this._changeValue('critical_threshold', e.target.value)}"></ha-textfield>
            </div>
          </div>
        </ha-expansion-panel>
        <p style="color: var(--secondary-text-color); font-size: 0.9rem; padding: 0 8px;">
          Hinweis: Diese Karte erkennt automatisch alle Batterie-Sensoren in deinem System und sortiert sie nach dem niedrigsten Stand.
        </p>
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
  static getStubConfig() { return { title: "Batteriestatus", critical_threshold: 20 }; }

  setConfig(config) { this.config = config; }

  // Berechnet die Farbe basierend auf dem Wert (Rot -> Gelb -> Grün)
  _getDynamicColor(value) {
    if (value <= 20) return "#f44336"; // Rot
    if (value <= 40) return "#ff9800"; // Orange
    if (value <= 60) return "#ffeb3b"; // Gelb
    return "#4caf50"; // Grün
  }

  _getBatteryIcon(value) {
    if (value <= 5) return "mdi:battery-outline";
    if (value <= 95) return `mdi:battery-${Math.round(value / 10) * 10}`;
    return "mdi:battery";
  }

  render() {
    if (!this.hass) return html``;

    // 1. Automatische Erkennung aller Batterie-Entitäten
    const batteryEntities = Object.keys(this.hass.states).filter(entityId => {
      const state = this.hass.states[entityId];
      const deviceClass = state.attributes.device_class;
      const unit = state.attributes.unit_of_measurement;
      
      return (
        deviceClass === 'battery' || 
        unit === '%' && (entityId.includes('battery') || entityId.includes('akku'))
      );
    });

    // 2. Daten aufbereiten und sortieren (Niedrigste zuerst)
    const batteries = batteryEntities
      .map(id => {
        const stateObj = this.hass.states[id];
        return {
          id: id,
          name: stateObj.attributes.friendly_name || id,
          state: parseFloat(stateObj.state),
          display_state: stateObj.state
        };
      })
      .filter(b => !isNaN(b.state))
      .sort((a, b) => a.state - b.state);

    const avg = batteries.length > 0 ? (batteries.reduce((a, b) => a + b.state, 0) / batteries.length).toFixed(0) : '-';
    const criticalThreshold = this.config.critical_threshold || 20;
    const criticalCount = batteries.filter(b => b.state <= criticalThreshold).length;

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
            ${batteries.map(b => html`
              <div class="battery-item">
                <div class="battery-icon" style="color: ${this._getDynamicColor(b.state)}">
                  <ha-icon icon="${this._getBatteryIcon(b.state)}"></ha-icon>
                </div>
                <div class="battery-info">
                  <div class="battery-name">${b.name}</div>
                  <div class="battery-status-text">${b.state <= criticalThreshold ? 'Austauschen!' : 'In Ordnung'}</div>
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
      :host { --success-color: #4caf50; --error-color: #f44336; }
      .custom-header { padding: 24px 16px 16px; display: flex; align-items: center; gap: 12px; }
      .header-icon { --mdc-icon-size: 28px; color: var(--primary-text-color); }
      .header-title { font-size: 24px; font-weight: 400; letter-spacing: -0.012em; }

      .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 16px 20px; }
      .stat-box {
        position: relative; border-radius: 12px; padding: 20px 12px;
        background: var(--ha-card-background, var(--card-background-color, white));
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02);
        display: flex; flex-direction: column; align-items: center; text-align: center;
        transition: transform 0.2s ease;
      }
      .stat-box:hover { transform: translateY(-2px); }
      .critical-border { border: 1px solid var(--error-color); }
      .critical-text { color: var(--error-color); }
      .stat-value { font-size: 2.2rem; font-weight: 500; line-height: 1.2; }
      .stat-name { font-size: 0.8rem; color: var(--secondary-text-color); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

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
  name: "Battery Modern Card (Auto-Discovery)",
  description: "Erkennt automatisch alle Akkus und sortiert sie nach Ladestand.",
  preview: true
});
