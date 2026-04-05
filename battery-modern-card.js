import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- VISUELLER EDITOR ---
class BatteryModernCardEditor extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }

  setConfig(config) { 
    this.config = { ...config, entities: config.entities || [] }; 
  }

  _changeValue(field, value) {
    if (!this.config || !this.hass) return;
    this.config = { ...this.config, [field]: value };
    this._fireChanged();
  }

  _entityChanged(index, value) {
    const entities = [...this.config.entities];
    entities[index] = { ...entities[index], entity: value };
    this.config = { ...this.config, entities };
    this._fireChanged();
  }

  _renameEntity(index, value) {
    const entities = [...this.config.entities];
    entities[index] = { ...entities[index], name: value };
    this.config = { ...this.config, entities };
    this._fireChanged();
  }

  _addEntity() {
    const entities = [...this.config.entities, { entity: "", name: "" }];
    this.config = { ...this.config, entities };
    this._fireChanged();
  }

  _removeEntity(index) {
    const entities = [...this.config.entities];
    entities.splice(index, 1);
    this.config = { ...this.config, entities };
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
        
        <ha-expansion-panel header="Karten-Titel & Icon" outlined expanded>
          <div class="panel-content">
            <div class="grid-2">
              <ha-textfield label="Titel" .value="${this.config.title || ''}" @input="${(e) => this._changeValue('title', e.target.value)}"></ha-textfield>
              <ha-icon-picker .hass=${this.hass} .value=${this.config.title_icon || ''} label="Titel Icon" @value-changed=${(e) => this._changeValue('title_icon', e.detail.value)}></ha-icon-picker>
              <ha-textfield label="Titel-Farbe" .value="${this.config.title_color || ''}" @input="${(e) => this._changeValue('title_color', e.target.value)}"></ha-textfield>
              <ha-textfield label="Titel-Größe" .value="${this.config.title_size || ''}" @input="${(e) => this._changeValue('title_size', e.target.value)}"></ha-textfield>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Batterie Liste (${this.config.entities.length})" outlined>
          <div class="panel-content">
            ${this.config.entities.map((ent, index) => html`
              <div class="item-editor">
                <ha-entity-picker .hass=${this.hass} .value=${ent.entity} label="Batterie Sensor" include-domains='["sensor"]' @value-changed=${(e) => this._entityChanged(index, e.detail.value)} allow-custom-entity></ha-entity-picker>
                <ha-textfield label="Anzeigename (Optional)" .value="${ent.name || ''}" @input="${(e) => this._renameEntity(index, e.target.value)}"></ha-textfield>
                <mwc-button @click="${() => this._removeEntity(index)}" style="--mdc-theme-primary: var(--error-color);">Entfernen</mwc-button>
              </div>
            `)}
            <mwc-button raised @click="${this._addEntity}" style="margin-top: 10px;">Batterie hinzufügen</mwc-button>
          </div>
        </ha-expansion-panel>

      </div>
    `;
  }

  static get styles() {
    return css`
      .editor-container { display: flex; flex-direction: column; gap: 10px; }
      .panel-content { padding: 10px 0; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .item-editor { border: 1px solid var(--divider-color); padding: 10px; border-radius: 8px; margin-bottom: 10px; background: var(--secondary-background-color); }
      ha-textfield, ha-entity-picker, ha-icon-picker { width: 100%; margin-bottom: 5px; }
    `;
  }
}
customElements.define("battery-modern-card-editor", BatteryModernCardEditor);

// --- HAUPTKARTE ---
class BatteryModernCard extends LitElement {
  static get properties() {
    return { hass: { type: Object }, config: { type: Object } };
  }

  static getConfigElement() { return document.createElement("battery-modern-card-editor"); }
  
  setConfig(config) {
    if (!config.entities) throw new Error("Bitte Entitäten hinzufügen.");
    this.config = config;
  }

  _getBatteryIcon(value) {
    if (value <= 10) return "mdi:battery-outline";
    if (value <= 20) return "mdi:battery-20";
    if (value <= 40) return "mdi:battery-40";
    if (value <= 60) return "mdi:battery-60";
    if (value <= 80) return "mdi:battery-80";
    return "mdi:battery";
  }

  _getColor(value) {
    if (value <= 20) return "var(--error-color)";
    if (value <= 40) return "var(--warning-color)";
    return "var(--success-color)";
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const batteryValues = this.config.entities
      .map(e => this.hass.states[e.entity] ? parseFloat(this.hass.states[e.entity].state) : null)
      .filter(v => v !== null);

    const avg = batteryValues.length > 0 ? (batteryValues.reduce((a, b) => a + b, 0) / batteryValues.length).toFixed(0) : '-';
    const critical = batteryValues.filter(v => v <= 20).length;

    const headerStyle = `
      color: ${this.config.title_color || 'inherit'};
      font-size: ${this.config.title_size || '24px'};
      font-weight: ${this.config.title_weight || '400'};
    `;

    return html`
      <ha-card>
        <div class="custom-header" style="${headerStyle}">
          ${this.config.title_icon ? html`<ha-icon icon="${this.config.title_icon}" class="header-icon"></ha-icon>` : ''}
          ${this.config.title || 'Batteriestatus'}
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-content">
              <span class="stat-value">${avg}%</span>
              <span class="stat-name">Ø Ladestand</span>
            </div>
          </div>
          <div class="stat-box" style="border-color: ${critical > 0 ? 'var(--error-color)' : ''}">
            <div class="stat-content">
              <span class="stat-value" style="color: ${critical > 0 ? 'var(--error-color)' : ''}">${critical}</span>
              <span class="stat-name">Kritisch (<20%)</span>
            </div>
          </div>
        </div>

        <div class="card-content">
          <div class="battery-list">
            ${this.config.entities.map(ent => {
              const stateObj = this.hass.states[ent.entity];
              if (!stateObj) return html``;
              const val = parseFloat(stateObj.state);
              const name = ent.name || stateObj.attributes.friendly_name || ent.entity;

              return html`
                <div class="battery-item">
                  <div class="battery-icon" style="color: ${this._getColor(val)}">
                    <ha-icon icon="${this._getBatteryIcon(val)}"></ha-icon>
                  </div>
                  <div class="battery-info">
                    <div class="battery-name">${name}</div>
                  </div>
                  <div class="battery-value" style="color: ${this._getColor(val)}">
                    ${val}%
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .custom-header { padding: 24px 16px 16px; display: flex; align-items: center; gap: 12px; }
      .header-icon { --mdc-icon-size: 28px; }
      
      .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 16px 20px; }
      .stat-box {
        position: relative; overflow: hidden; border-radius: 12px; padding: 20px 10px;
        background: var(--ha-card-background, #fff);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
        display: flex; flex-direction: column; align-items: center; text-align: center;
        transition: transform 0.2s ease; border: 1px solid transparent;
      }
      .stat-box:hover { transform: translateY(-2px); }
      .stat-value { font-size: 1.8rem; font-weight: 500; }
      .stat-name { font-size: 0.75rem; color: var(--secondary-text-color); text-transform: uppercase; }

      .card-content { padding: 0 16px 16px; }
      .battery-list { display: flex; flex-direction: column; gap: 10px; }
      .battery-item {
        display: flex; align-items: center; padding: 12px; border-radius: 12px;
        background: var(--ha-card-background, #fff);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        transition: transform 0.2s ease;
      }
      .battery-item:hover { transform: translateY(-1px); filter: brightness(0.98); }
      .battery-icon { margin-right: 15px; }
      .battery-info { flex-grow: 1; }
      .battery-name { font-weight: 500; }
      .battery-value { font-weight: bold; }
    `;
  }
}
customElements.define("battery-modern-card", BatteryModernCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "battery-modern-card",
  name: "Battery Modern Card",
  description: "Stylische Batterie-Karte im AdGuard/Proxmox-Stil.",
  preview: true
});
