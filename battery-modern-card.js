import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// --- VISUELLER EDITOR ---
class BatteryModernCardEditor extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }

  setConfig(config) {
    this.config = { 
      ...config, 
      manual_entities: config.manual_entities || [],
      exclude: config.exclude || [],
      filter_battery_plus: config.filter_battery_plus !== false 
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

  // --- Manuelles Hinzufügen ---
  _addManualEntity(entityId) {
    if(!entityId) return;
    const manual = [...this.config.manual_entities, { entity: entityId, badge: "" }];
    this._changeValue('manual_entities', manual);
  }

  _updateManualBadge(index, badgeValue) {
    const manual = [...this.config.manual_entities];
    manual[index] = { ...manual[index], badge: badgeValue };
    this._changeValue('manual_entities', manual);
  }

  _removeManual(index) {
    const manual = [...this.config.manual_entities];
    manual.splice(index, 1);
    this._changeValue('manual_entities', manual);
  }

  // --- Manuelles Ausschließen ---
  _addExcludeEntity(entityId) {
    if(!entityId || this.config.exclude.includes(entityId)) return;
    const exclude = [...this.config.exclude, entityId];
    this._changeValue('exclude', exclude);
  }

  _removeExclude(index) {
    const exclude = [...this.config.exclude];
    exclude.splice(index, 1);
    this._changeValue('exclude', exclude);
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
        
        <ha-expansion-panel header="Header Design" outlined expanded>
          <div class="panel-content grid-2">
            <ha-textfield label="Karten-Titel" .value="${this.config.title || ''}" @input="${(e) => this._changeValue('title', e.target.value)}"></ha-textfield>
            <ha-icon-picker .hass=${this.hass} .value=${this.config.title_icon || ''} label="Titel Icon" @value-changed=${(e) => this._changeValue('title_icon', e.detail.value)}></ha-icon-picker>
            <ha-textfield label="Titel Farbe" .value="${this.config.title_color || ''}" @input="${(e) => this._changeValue('title_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Titel Größe" .value="${this.config.title_size || ''}" @input="${(e) => this._changeValue('title_size', e.target.value)}"></ha-textfield>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Text & Schatten Styling" outlined>
          <div class="panel-content grid-2">
            <ha-textfield label="Stat-Zahl Farbe" .value="${this.config.stat_value_color || ''}" @input="${(e) => this._changeValue('stat_value_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Stat-Zahl Größe" .value="${this.config.stat_value_size || ''}" @input="${(e) => this._changeValue('stat_value_size', e.target.value)}"></ha-textfield>
            
            <ha-textfield label="Stat-Label Farbe" .value="${this.config.stat_label_color || ''}" @input="${(e) => this._changeValue('stat_label_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Stat-Label Größe" .value="${this.config.stat_label_size || ''}" @input="${(e) => this._changeValue('stat_label_size', e.target.value)}"></ha-textfield>
            
            <ha-textfield label="Batterie-Name Farbe" .value="${this.config.name_color || ''}" @input="${(e) => this._changeValue('name_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Batterie-Name Größe" .value="${this.config.name_size || ''}" @input="${(e) => this._changeValue('name_size', e.target.value)}"></ha-textfield>
            
            <ha-textfield label="Prozent-Wert Farbe" .value="${this.config.value_color || ''}" @input="${(e) => this._changeValue('value_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Prozent-Wert Größe" .value="${this.config.value_size || ''}" @input="${(e) => this._changeValue('value_size', e.target.value)}"></ha-textfield>
            
            <ha-textfield label="Stat-Box Schatten" .value="${this.config.stat_shadow || ''}" @input="${(e) => this._changeValue('stat_shadow', e.target.value)}" placeholder="0 4px 12px rgba(0,0,0,0.05)"></ha-textfield>
            <ha-textfield label="Zeilen Schatten" .value="${this.config.row_shadow || ''}" @input="${(e) => this._changeValue('row_shadow', e.target.value)}" placeholder="0 2px 6px rgba(0,0,0,0.03)"></ha-textfield>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Ausschließen & Filter" outlined>
          <div class="panel-content">
            <div class="switch-row">
                <span>Battery+ Duplikate ausblenden</span>
                <ha-switch .checked=${this.config.filter_battery_plus} @change=${() => this._toggleFilter('filter_battery_plus')}></ha-switch>
            </div>
            <ha-entity-picker .hass=${this.hass} label="Entität dauerhaft ausblenden" @value-changed=${(e) => this._addExcludeEntity(e.detail.value)}></ha-entity-picker>
            <div class="chip-container">
                ${this.config.exclude.map((ent, i) => html`
                    <div class="chip">${ent} <ha-icon icon="mdi:close" @click=${() => this._removeExclude(i)}></ha-icon></div>
                `)}
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Manuell Hinzufügen & Badges" outlined>
          <div class="panel-content">
            <ha-entity-picker .hass=${this.hass} label="Fehlende Entität hinzufügen" @value-changed=${(e) => this._addManualEntity(e.detail.value)}></ha-entity-picker>
            <div class="manual-list">
                ${this.config.manual_entities.map((ent, i) => html`
                    <div class="manual-item-editor">
                      <div class="manual-header">
                        <span class="ent-id">${ent.entity}</span>
                        <ha-icon icon="mdi:delete" @click=${() => this._removeManual(i)}></ha-icon>
                      </div>
                      <ha-textfield label="Manuelles Badge (z.B. Küche)" .value="${ent.badge || ''}" @input="${(e) => this._updateManualBadge(i, e.target.value)}"></ha-textfield>
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
      .editor-container { display: flex; flex-direction: column; gap: 12px; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .panel-content { padding: 12px 0; }
      .switch-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0 16px; font-weight: 500; }
      .chip-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .chip { background: var(--secondary-background-color); padding: 4px 10px; border-radius: 16px; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; }
      .manual-list { margin-top: 15px; display: flex; flex-direction: column; gap: 10px; }
      .manual-item-editor { border: 1px solid var(--divider-color); padding: 10px; border-radius: 8px; background: rgba(var(--rgb-primary-text-color), 0.02); }
      .manual-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .ent-id { font-size: 0.8rem; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }
      ha-textfield, ha-entity-picker, ha-icon-picker { width: 100%; }
      ha-icon { cursor: pointer; --mdc-icon-size: 16px; }
      .manual-header ha-icon { color: var(--error-color); --mdc-icon-size: 20px; }
    `;
  }
}
customElements.define("battery-modern-card-editor", BatteryModernCardEditor);

// --- FRONTEND KARTE ---
class BatteryModernCard extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }

  static getConfigElement() { return document.createElement("battery-modern-card-editor"); }

  static getStubConfig() { return { title: "Batteriestatus", filter_battery_plus: true, exclude: [], manual_entities: [] }; }

  setConfig(config) { this.config = config; }

  // More-Info Dialog öffnen
  _handleMoreInfo(entityId) {
    const event = new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId: entityId }
    });
    this.dispatchEvent(event);
  }

  _getCategory(entityId, friendlyName) {
    const manual = (this.config.manual_entities || []).find(e => e.entity === entityId);
    if (manual && manual.badge) return manual.badge;

    const text = (entityId + " " + (friendlyName || "")).toLowerCase();
    if (text.includes("presence") || text.includes("anwesenheit")) return "Anwesenheit";
    if (text.includes("window") || text.includes("fenster") || text.includes("door") || text.includes("tür")) return "Fenster/Tür";
    if (text.includes("temp") || text.includes("klima") || text.includes("hum")) return "Klima";
    if (text.includes("smoke") || text.includes("rauch")) return "Rauch";
    if (text.includes("lock") || text.includes("schloss")) return "Schloss";
    if (text.includes("water") || text.includes("wasser") || text.includes("leak")) return "Wasser";
    return "Sonstiges";
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const excludeList = this.config.exclude || [];

    // Auto Discovery
    const autoEntities = Object.keys(this.hass.states).filter(id => {
      const s = this.hass.states[id];
      const isBattery = s.attributes.device_class === 'battery' || (s.attributes.unit_of_measurement === '%' && id.includes('battery'));
      
      if (excludeList.includes(id)) return false;

      if (this.config.filter_battery_plus) {
        if (id.toLowerCase().endsWith('battery+') || (s.attributes.friendly_name || "").toLowerCase().endsWith('battery+')) {
          return false;
        }
      }
      return isBattery;
    });
    
    // Manual Entities
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

    return html`
      <ha-card>
        <div class="header" style="color: ${this.config.title_color || ''}; font-size: ${this.config.title_size || ''};">
          ${this.config.title_icon ? html`<ha-icon icon="${this.config.title_icon}" style="margin-right:12px;"></ha-icon>` : ''}
          ${this.config.title || 'Batteriestatus'}
        </div>

        <div class="stats" style="--c-shadow: ${this.config.stat_shadow || '0 4px 12px rgba(0,0,0,0.05)'};">
          <div class="box">
            <span style="color: ${this.config.stat_value_color || ''}; font-size: ${this.config.stat_value_size || ''};">${batteries.length}</span>
            <label style="color: ${this.config.stat_label_color || ''}; font-size: ${this.config.stat_label_size || ''};">Gesamt</label>
          </div>
          <div class="box ${critical.length > 0 ? 'warn' : ''}">
            <span style="color: ${critical.length > 0 ? '#f44336' : (this.config.stat_value_color || '')}; font-size: ${this.config.stat_value_size || ''};">${critical.length}</span>
            <label style="color: ${this.config.stat_label_color || ''}; font-size: ${this.config.stat_label_size || ''};">Kritisch</label>
          </div>
        </div>

        <div class="content" style="--c-shadow: ${this.config.row_shadow || '0 2px 6px rgba(0,0,0,0.03)'};">
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
        <ha-icon icon="mdi:battery${b.state <= 10 ? '-outline' : (b.state >= 95 ? '' : '-' + Math.round(b.state/10)*10)}" style="color: ${color}"></ha-icon>
        <div class="info">
          <div class="name clickable" @click=${() => this._handleMoreInfo(b.id)} style="color: ${this.config.name_color || ''}; font-size: ${this.config.name_size || ''};">
            ${b.name}
          </div>
          <div class="badge">${b.category}</div>
        </div>
        <div class="val" style="color: ${this.config.value_color || color}; font-size: ${this.config.value_size || ''};">${b.state}%</div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .header { padding: 24px 16px 16px; display: flex; align-items: center; font-size: 24px; font-weight: 400; }
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 16px 20px; }
      .box { border-radius: 12px; padding: 20px; text-align: center; background: var(--ha-card-background, white); box-shadow: var(--c-shadow); display: flex; flex-direction: column; }
      .box.warn { border: 1px solid #f44336; }
      .box span { font-size: 2.2rem; font-weight: 500; }
      .box label { font-size: 0.8rem; color: var(--secondary-text-color); text-transform: uppercase; font-weight: 600; }
      .content { padding: 0 16px 16px; }
      .list { display: flex; flex-direction: column; gap: 12px; }
      .item { display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; background: var(--ha-card-background, white); box-shadow: var(--c-shadow); }
      .info { flex-grow: 1; margin-left: 16px; overflow: hidden; }
      
      /* Neu: Klickbarer Name */
      .name { font-weight: 600; font-size: 1rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; transition: color 0.2s; }
      .clickable { cursor: pointer; }
      .clickable:hover { color: var(--primary-color) !important; text-decoration: underline; }
      
      .badge { font-size: 0.7rem; background: var(--secondary-background-color); padding: 2px 6px; border-radius: 4px; width: fit-content; margin-top: 4px; color: var(--secondary-text-color); font-weight: bold; }
      .val { font-weight: bold; font-size: 1.1rem; }
      .panel { margin-top: 16px; border-radius: 12px; }
    `;
  }
}

customElements.define("battery-modern-card", BatteryModernCard);

// Registrierung
window.customCards = window.customCards || [];
const cardExists = window.customCards.some(c => c.type === "battery-modern-card");
if (!cardExists) {
  window.customCards.push({
    type: "battery-modern-card",
    name: "Battery Modern Card",
    description: "Modern style battery monitor with Full Styling and Entity Navigation.",
    preview: true
  });
}
