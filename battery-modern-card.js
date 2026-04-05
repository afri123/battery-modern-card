import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- VISUELLER EDITOR ---
class BatteryModernCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  setConfig(config) {
    this.config = { 
      ...config, 
      manual_entities: config.manual_entities || [],
      filter_battery_plus: config.filter_battery_plus !== false // Standardmäßig an
    };
  }

  _changeValue(field, value) {
    if (!this.config || !this.hass) return;
    this.config = { ...this.config, [field]: value };
    this._fireChanged();
  }

  _toggleFilter(field) {
    this._changeValue(field, !this.config[field]);
  }

  _addManualEntity(entityId) {
    if(!entityId) return;
    const manual = [...this.config.manual_entities, { entity: entityId, badge: "" }];
    this._changeValue('manual_entities', manual);
  }

  _removeManual(index) {
    const manual = [...this.config.manual_entities];
    manual.splice(index, 1);
    this._changeValue('manual_entities', manual);
  }

  _fireChanged() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this.config) return html``;

    return html`
      <div class="editor-container">
        <ha-expansion-panel header="Allgemeine Einstellungen" outlined expanded>
          <div class="panel-content">
            <ha-textfield label="Titel" .value="${this.config.title || ''}" @input="${(e) => this._changeValue('title', e.target.value)}"></ha-textfield>
            <div class="switch-row">
                <span>Battery+ Duplikate ausblenden</span>
                <ha-switch .checked=${this.config.filter_battery_plus} @change=${() => this._toggleFilter('filter_battery_plus')}></ha-switch>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Design (CSS)" outlined>
          <div class="panel-content">
            <div class="grid-2">
              <ha-textfield label="Stat-Box Schatten" .value="${this.config.stat_shadow || ''}" @input="${(e) => this._changeValue('stat_shadow', e.target.value)}"></ha-textfield>
              <ha-textfield label="Zeilen Schatten" .value="${this.config.row_shadow || ''}" @input="${(e) => this._changeValue('row_shadow', e.target.value)}"></ha-textfield>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Manuelle Entitäten" outlined>
          <div class="panel-content">
            <ha-entity-picker .hass=${this.hass} label="Entität hinzufügen" @value-changed=${(e) => this._addManualEntity(e.detail.value)}></ha-entity-picker>
            <div class="manual-list">
                ${this.config.manual_entities.map((ent, i) => html`
                    <div class="manual-item-editor">
                      <span>${ent.entity}</span>
                      <ha-icon icon="mdi:delete" @click=${() => this._removeManual(i)}></ha-icon>
                    </div>
                `)}
            </div>
          </div>
        </ha-expansion-panel>
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor-container { display: flex; flex-direction: column; gap: 12px; padding: 8px; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .panel-content { padding: 12px 0; }
      .switch-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
      .manual-list { margin-top: 10px; }
      .manual-item-editor { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid var(--divider-color); }
      ha-textfield, ha-entity-picker { width: 100%; margin-bottom: 8px; }
      ha-icon { cursor: pointer; color: var(--error-color); }
    `;
  }
}
customElements.define("battery-modern-card-editor", BatteryModernCardEditor);

// --- FRONTEND KARTE ---
class BatteryModernCard extends LitElement {
  static get properties() {
    return { hass: {}, config: {} };
  }

  static getConfigElement() {
    return document.createElement("battery-modern-card-editor");
  }

  static getStubConfig() {
    return { title: "Batteriestatus", filter_battery_plus: true, manual_entities: [] };
  }

  setConfig(config) {
    this.config = config;
  }

  _getCategory(entityId, friendlyName) {
    const text = (entityId + " " + (friendlyName || "")).toLowerCase();
    if (text.includes("presence") || text.includes("anwesenheit")) return "Anwesenheit";
    if (text.includes("window") || text.includes("fenster") || text.includes("door")) return "Fenster/Tür";
    if (text.includes("temp") || text.includes("klima")) return "Klima";
    if (text.includes("smoke") || text.includes("rauch")) return "Rauch";
    return "Sonstiges";
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const autoEntities = Object.keys(this.hass.states).filter(id => {
      const s = this.hass.states[id];
      const isBattery = s.attributes.device_class === 'battery' || (s.attributes.unit_of_measurement === '%' && id.includes('battery'));
      
      // Battery+ Filter Logik
      if (this.config.filter_battery_plus) {
        if (id.toLowerCase().endsWith('battery+') || (s.attributes.friendly_name || "").toLowerCase().endsWith('battery+')) {
          return false;
        }
      }
      return isBattery;
    });
    
    const manualIds = (this.config.manual_entities || []).map(e => e.entity);
    const combinedIds = [...new Set([...autoEntities, ...manualIds])];

    const batteries = combinedIds
      .map(id => {
        const s = this.hass.states[id];
        if (!s) return null;
        return {
          id,
          name: s.attributes.friendly_name || id,
          state: parseFloat(s.state),
          category: this._getCategory(id, s.attributes.friendly_name)
        };
      })
      .filter(b => b !== null && !isNaN(b.state))
      .sort((a, b) => a.state - b.state);

    const critical = batteries.filter(b => b.state <= 40);
    const healthy = batteries.filter(b => b.state > 40);

    const statStyle = `--c-shadow: ${this.config.stat_shadow || '0 4px 12px rgba(0,0,0,0.05)'};`;
    const rowStyle = `--c-shadow: ${this.config.row_shadow || '0 2px 6px rgba(0,0,0,0.03)'};`;

    return html`
      <ha-card>
        <div class="header">
          ${this.config.title || 'Batteriestatus'}
        </div>

        <div class="stats" style="${statStyle}">
          <div class="box"><span>${batteries.length}</span><label>Gesamt</label></div>
          <div class="box ${critical.length > 0 ? 'warn' : ''}"><span>${critical.length}</span><label>Kritisch</label></div>
        </div>

        <div class="content" style="${rowStyle}">
          <div class="list">${critical.map(b => this._renderItem(b))}</div>
          ${healthy.length > 0 ? html`
            <ha-expansion-panel header="OK (${healthy.length})" outlined class="panel">
              <div class="list" style="padding: 10px 0;">${healthy.map(b => this._renderItem(b))}</div>
            </ha-expansion-panel>
          ` : ''}
        </div>
      </ha-card>
    `;
  }

  _renderItem(b) {
    const color = b.state <= 20 ? "#f44336" : (b.state <= 40 ? "#ff9800" : "#4caf50");
    return html`
      <div class="item">
        <ha-icon icon="mdi:battery" style="color: ${color}"></ha-icon>
        <div class="info">
          <div class="name">${b.name}</div>
          <div class="badge">${b.category}</div>
        </div>
        <div class="val" style="color: ${color}">${b.state}%</div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .header { padding: 24px 16px 16px; font-size: 24px; }
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 16px 20px; }
      .box { border-radius: 12px; padding: 20px; text-align: center; background: var(--ha-card-background, white); box-shadow: var(--c-shadow); display: flex; flex-direction: column; }
      .box.warn { border: 1px solid #f44336; }
      .box span { font-size: 2.2rem; font-weight: 500; }
      .box label { font-size: 0.8rem; color: var(--secondary-text-color); text-transform: uppercase; }
      .content { padding: 0 16px 16px; }
      .list { display: flex; flex-direction: column; gap: 12px; }
      .item { display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; background: var(--ha-card-background, white); box-shadow: var(--c-shadow); }
      .info { flex-grow: 1; margin-left: 16px; }
      .name { font-weight: 600; }
      .badge { font-size: 0.7rem; background: var(--secondary-background-color); padding: 2px 6px; border-radius: 4px; width: fit-content; margin-top: 4px; }
      .val { font-weight: bold; }
      .panel { margin-top: 16px; border-radius: 12px; }
    `;
  }
}

customElements.define("battery-modern-card", BatteryModernCard);

// Registrierung für das Menü
window.customCards = window.customCards || [];
window.customCards.push({
  type: "battery-modern-card",
  name: "Battery Modern Card",
  description: "Modern style battery monitor with Battery+ filter.",
  preview: true
});
