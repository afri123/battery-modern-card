import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- VISUELLER EDITOR (AKKORDEON STYLE) ---
class BatteryModernCardEditor extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }

  setConfig(config) {
    this.config = { ...config, entities: config.entities || [] };
  }

  // Hilfsfunktion für globale Werte
  _changeValue(field, value) {
    if (!this.config || !this.hass) return;
    if (this.config[field] === value) return;
    this.config = { ...this.config, [field]: value };
    this._fireChanged();
  }

  // Hilfsfunktion für einzelne Batterien
  _itemChanged(index, field, value) {
    const entities = [...this.config.entities];
    entities[index] = { ...entities[index], [field]: value };
    this.config = { ...this.config, entities };
    this._fireChanged();
  }

  _addEntity() {
    const entities = [...this.config.entities, { entity: "", name: "", border: "", shadow: "", bg_color: "" }];
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
        
        <ha-expansion-panel header="Karten-Titel & Header Design" outlined expanded>
          <div class="panel-content">
            <div class="grid-2">
              <ha-textfield label="Karten-Titel" .value="${this.config.title || ''}" @input="${(e) => this._changeValue('title', e.target.value)}"></ha-textfield>
              <ha-icon-picker .hass=${this.hass} .value=${this.config.title_icon || ''} label="Titel Icon" @value-changed=${(e) => this._changeValue('title_icon', e.detail.value)}></ha-icon-picker>
              <ha-textfield label="Titel-Farbe (CSS)" .value="${this.config.title_color || ''}" @input="${(e) => this._changeValue('title_color', e.target.value)}" placeholder="var(--primary-color)"></ha-textfield>
              <ha-textfield label="Titel-Größe" .value="${this.config.title_size || ''}" @input="${(e) => this._changeValue('title_size', e.target.value)}" placeholder="24px"></ha-textfield>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Statistik-Boxen (Oben)" outlined>
          <div class="panel-content">
            <div class="grid-2">
              <ha-textfield label="Ø Box Rahmen" .value="${this.config.stat_border || ''}" @input="${(e) => this._changeValue('stat_border', e.target.value)}" placeholder="none"></ha-textfield>
              <ha-textfield label="Ø Box Schatten" .value="${this.config.stat_shadow || ''}" @input="${(e) => this._changeValue('stat_shadow', e.target.value)}" placeholder="CSS Shadow"></ha-textfield>
              <ha-textfield label="Zahlen-Farbe" .value="${this.config.stat_value_color || ''}" @input="${(e) => this._changeValue('stat_value_color', e.target.value)}"></ha-textfield>
              <ha-textfield label="Label-Farbe" .value="${this.config.stat_label_color || ''}" @input="${(e) => this._changeValue('stat_label_color', e.target.value)}"></ha-textfield>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Batterien verwalten (${this.config.entities.length})" outlined>
          <div class="panel-content">
            ${this.config.entities.map((ent, index) => html`
              <ha-expansion-panel header="${ent.name || ent.entity || `Batterie ${index + 1}`}" outlined style="margin-bottom: 8px;">
                <div class="panel-content inner-panel">
                  <div class="grid-2">
                    <ha-entity-picker .hass=${this.hass} .value=${ent.entity} label="Sensor auswählen" include-domains='["sensor"]' @value-changed=${(e) => this._itemChanged(index, 'entity', e.detail.value)} allow-custom-entity></ha-entity-picker>
                    <ha-textfield label="Anzeigename" .value="${ent.name || ''}" @input="${(e) => this._itemChanged(index, 'name', e.target.value)}"></ha-textfield>
                    <ha-textfield label="Hintergrund (CSS)" .value="${ent.bg_color || ''}" @input="${(e) => this._itemChanged(index, 'bg_color', e.target.value)}" placeholder="rgba(0,0,0,0.1)"></ha-textfield>
                    <ha-textfield label="Rahmen (CSS)" .value="${ent.border || ''}" @input="${(e) => this._itemChanged(index, 'border', e.target.value)}"></ha-textfield>
                    <ha-textfield label="Schatten (CSS)" .value="${ent.shadow || ''}" @input="${(e) => this._itemChanged(index, 'shadow', e.target.value)}"></ha-textfield>
                  </div>
                  <mwc-button @click="${() => this._removeEntity(index)}" style="--mdc-theme-primary: var(--error-color); width: 100%; margin-top: 10px;">
                    <ha-icon icon="mdi:delete-outline"></ha-icon> Entfernen
                  </mwc-button>
                </div>
              </ha-expansion-panel>
            `)}
            <mwc-button raised @click="${this._addEntity}" style="width: 100%; margin-top: 10px;">
              <ha-icon icon="mdi:plus"></ha-icon> Batterie hinzufügen
            </mwc-button>
          </div>
        </ha-expansion-panel>

      </div>
    `;
  }

  static get styles() {
    return css`
      .editor-container { display: flex; flex-direction: column; gap: 12px; }
      .panel-content { padding: 12px 0; }
      .inner-panel { padding: 10px; background: rgba(var(--rgb-primary-text-color), 0.02); border-radius: 4px; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: center; }
      ha-textfield, ha-entity-picker, ha-icon-picker { width: 100%; }
      mwc-button { --mdc-theme-primary: var(--primary-color); }
      ha-expansion-panel { margin-bottom: 4px; }
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
  static getStubConfig() { return { title: "Batterien", entities: [] }; }

  setConfig(config) {
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
      .filter(v => v !== null && !isNaN(v));

    const avg = batteryValues.length > 0 ? (batteryValues.reduce((a, b) => a + b, 0) / batteryValues.length).toFixed(0) : '-';
    const critical = batteryValues.filter(v => v <= 20).length;

    const headerStyle = `
      ${this.config.title_color ? `color: ${this.config.title_color};` : ''}
      ${this.config.title_size ? `font-size: ${this.config.title_size};` : ''}
      ${this.config.title_weight ? `font-weight: ${this.config.title_weight};` : ''}
    `;

    const statStyle = `
      ${this.config.stat_border ? `--custom-border: ${this.config.stat_border};` : ''}
      ${this.config.stat_shadow ? `--custom-shadow: ${this.config.stat_shadow};` : ''}
    `;

    return html`
      <ha-card>
        <div class="custom-header" style="${headerStyle}">
          ${this.config.title_icon ? html`<ha-icon icon="${this.config.title_icon}" class="header-icon"></ha-icon>` : ''}
          ${this.config.title || 'Batteriestatus'}
        </div>

        <div class="stats-grid">
          <div class="stat-box" style="${statStyle}">
            <div class="stat-content">
              <span class="stat-value" style="color: ${this.config.stat_value_color || ''}">${avg}%</span>
              <span class="stat-name" style="color: ${this.config.stat_label_color || ''}">Ø Ladestand</span>
            </div>
          </div>
          <div class="stat-box" style="${statStyle} ${critical > 0 ? 'border-color: var(--error-color);' : ''}">
            <div class="stat-content">
              <span class="stat-value" style="color: ${critical > 0 ? 'var(--error-color)' : (this.config.stat_value_color || '')}">${critical}</span>
              <span class="stat-name" style="color: ${this.config.stat_label_color || ''}">Kritisch (<20%)</span>
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

              const rowStyle = `
                ${ent.bg_color ? `background-color: ${ent.bg_color};` : ''}
                ${ent.border ? `--custom-border: ${ent.border};` : ''}
                ${ent.shadow ? `--custom-shadow: ${ent.shadow};` : ''}
              `;

              return html`
                <div class="battery-item" style="${rowStyle}">
                  <div class="battery-icon" style="color: ${this._getColor(val)}">
                    <ha-icon icon="${this._getBatteryIcon(val)}"></ha-icon>
                  </div>
                  <div class="battery-info">
                    <div class="battery-name">${name}</div>
                    <div class="battery-status">${val <= 20 ? 'Schwach' : 'OK'}</div>
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
        position: relative; overflow: hidden; border-radius: 12px; padding: 24px 16px;
        background: var(--ha-card-background, #fff);
        border: var(--custom-border, none);
        box-shadow: var(--custom-shadow, 0 4px 12px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02));
        display: flex; flex-direction: column; align-items: center; text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .stat-box:hover { transform: translateY(-2px); filter: brightness(0.98); }
      .stat-value { font-size: 2.2rem; font-weight: 500; line-height: 1.2; }
      .stat-name { font-size: 0.85rem; color: var(--secondary-text-color); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

      .card-content { padding: 0 16px 16px; }
      .battery-list { display: flex; flex-direction: column; gap: 14px; }
      .battery-item {
        display: flex; align-items: center; padding: 12px 14px; border-radius: 12px;
        background: var(--ha-card-background, #fff);
        border: var(--custom-border, none);
        box-shadow: var(--custom-shadow, 0 4px 12px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02));
        transition: transform 0.2s ease, filter 0.2s ease;
      }
      .battery-item:hover { transform: translateY(-2px); filter: brightness(0.97); }
      .battery-icon { margin-right: 16px; }
      .battery-info { flex-grow: 1; overflow: hidden; }
      .battery-name { font-weight: 600; font-size: 1rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
      .battery-status { font-size: 0.8rem; color: var(--secondary-text-color); font-weight: 500; }
      .battery-value { font-weight: bold; font-size: 1.1rem; }
    `;
  }
}
customElements.define("battery-modern-card", BatteryModernCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "battery-modern-card",
  name: "Battery Modern Card",
  description: "Stylische Karte zur Überwachung von Batterien mit Akkordeon-Editor.",
  preview: true
});
