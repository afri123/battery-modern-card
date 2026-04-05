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
      custom_badges: config.custom_badges || {},
      filter_battery_plus: config.filter_battery_plus !== false 
    };
  }

  _changeValue(field, value) {
    if (!this.config || !this.hass) return;
    this.config = { ...this.config, [field]: value };
    this._fireChanged();
  }

  _updateBadgeOverride(entityId, badgeValue) {
    const custom_badges = { ...this.config.custom_badges };
    if (badgeValue && badgeValue.trim() !== "") {
      custom_badges[entityId] = badgeValue;
    } else {
      delete custom_badges[entityId];
    }
    this._changeValue('custom_badges', custom_badges);
  }

  _addEntity(field, entityId) {
    if(!entityId) return;
    const list = [...this.config[field]];
    if (!list.includes(entityId)) {
      list.push(entityId);
      this._changeValue(field, list);
    }
  }

  _removeEntity(field, index) {
    const list = [...this.config[field]];
    list.splice(index, 1);
    this._changeValue(field, list);
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

    // Liste aller aktuell auf der Karte sichtbaren IDs für die Badge-Zuordnung
    const currentIds = Object.keys(this.hass.states).filter(id => {
      const s = this.hass.states[id];
      const isBattery = s.attributes.device_class === 'battery' || (s.attributes.unit_of_measurement === '%' && id.includes('battery'));
      return isBattery || (this.config.manual_entities || []).includes(id);
    }).filter(id => !(this.config.exclude || []).includes(id));

    return html`
      <div class="editor-container">
        
        <ha-expansion-panel header="Header & Text Styling" outlined expanded>
          <div class="panel-content grid-2">
            <ha-textfield label="Titel" .value="${this.config.title || ''}" @input="${(e) => this._changeValue('title', e.target.value)}"></ha-textfield>
            <ha-icon-picker .hass=${this.hass} .value=${this.config.title_icon || ''} label="Titel Icon" @value-changed=${(e) => this._changeValue('title_icon', e.detail.value)}></ha-icon-picker>
            <ha-textfield label="Titel Farbe" .value="${this.config.title_color || ''}" @input="${(e) => this._changeValue('title_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Stat-Zahl Farbe" .value="${this.config.stat_value_color || ''}" @input="${(e) => this._changeValue('stat_value_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Batterie-Name Farbe" .value="${this.config.name_color || ''}" @input="${(e) => this._changeValue('name_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Zeilen Schatten" .value="${this.config.row_shadow || ''}" @input="${(e) => this._changeValue('row_shadow', e.target.value)}"></ha-textfield>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Badge Overrides (Manuelle Label)" outlined>
          <div class="panel-content">
            <p class="info-text">Hier kannst du für jede Batterie das Label überschreiben. Prio: Manuell > Automatik > Sonstiges.</p>
            <div class="manual-list">
              ${currentIds.map(id => html`
                <div class="manual-item-editor">
                  <div class="ent-id">${this.hass.states[id].attributes.friendly_name || id}</div>
                  <ha-textfield 
                    label="Manuelles Badge" 
                    .value="${this.config.custom_badges[id] || ''}" 
                    @input="${(e) => this._updateBadgeOverride(id, e.target.value)}"
                    placeholder="Automatik: ${this._getAutoCategory(id)}">
                  </ha-textfield>
                </div>
              `)}
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Entitäten (Hinzufügen / Ausblenden)" outlined>
          <div class="panel-content">
            <ha-entity-picker .hass=${this.hass} label="Entität manuell hinzufügen" @value-changed=${(e) => this._addEntity('manual_entities', e.detail.value)}></ha-entity-picker>
            <ha-entity-picker .hass=${this.hass} label="Entität ausblenden (Exclude)" @value-changed=${(e) => this._addEntity('exclude', e.detail.value)}></ha-entity-picker>
            
            <div class="chip-container">
              ${this.config.exclude.map((ent, i) => html`<div class="chip exclude">${ent} <ha-icon icon="mdi:close" @click=${() => this._removeEntity('exclude', i)}></ha-icon></div>`)}
              ${this.config.manual_entities.map((ent, i) => html`<div class="chip include">${ent} <ha-icon icon="mdi:close" @click=${() => this._removeEntity('manual_entities', i)}></ha-icon></div>`)}
            </div>
          </div>
        </ha-expansion-panel>

      </div>
    `;
  }

  // Hilfsfunktion für den Editor-Platzhalter
  _getAutoCategory(id) {
    const s = this.hass.states[id];
    const text = (id + " " + (s?.attributes?.friendly_name || "")).toLowerCase();
    if (text.includes("presence") || text.includes("anwesenheit")) return "Anwesenheit";
    if (text.includes("window") || text.includes("fenster") || text.includes("door")) return "Fenster/Tür";
    if (text.includes("temp") || text.includes("klima")) return "Klima";
    if (text.includes("smoke") || text.includes("rauch")) return "Rauch";
    if (text.includes("water") || text.includes("wasser")) return "Wasser";
    return "Sonstiges";
  }

  static get styles() {
    return css`
      .editor-container { display: flex; flex-direction: column; gap: 12px; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .panel-content { padding: 12px 0; }
      .info-text { font-size: 0.85rem; color: var(--secondary-text-color); margin-bottom: 12px; }
      .manual-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; padding-right: 5px; }
      .manual-item-editor { border: 1px solid var(--divider-color); padding: 10px; border-radius: 8px; background: rgba(var(--rgb-primary-text-color), 0.02); }
      .ent-id { font-size: 0.8rem; font-weight: bold; margin-bottom: 5px; color: var(--primary-color); }
      .chip-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px; }
      .chip { padding: 4px 10px; border-radius: 16px; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; }
      .chip.exclude { background: #fee; border: 1px solid #fcc; color: #c00; }
      .chip.include { background: #efe; border: 1px solid #cfc; color: #0c0; }
      ha-textfield, ha-entity-picker, ha-icon-picker { width: 100%; }
      ha-icon { cursor: pointer; --mdc-icon-size: 16px; }
    `;
  }
}
customElements.define("battery-modern-card-editor", BatteryModernCardEditor);

// --- FRONTEND KARTE ---
class BatteryModernCard extends LitElement {
  static get properties() { return { hass: {}, config: {} }; }

  static getConfigElement() { return document.createElement("battery-modern-card-editor"); }
  static getStubConfig() { return { title: "Batteriestatus", filter_battery_plus: true, manual_entities: [], exclude: [], custom_badges: {} }; }

  setConfig(config) { this.config = config; }

  _handleMoreInfo(entityId) {
    const event = new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: entityId } });
    this.dispatchEvent(event);
  }

  _getCategory(entityId, friendlyName) {
    // 1. PRIO: Manuelles Badge aus den custom_badges
    if (this.config.custom_badges && this.config.custom_badges[entityId]) {
      return this.config.custom_badges[entityId];
    }

    // 2. PRIO: Automatik Logik
    const text = (entityId + " " + (friendlyName || "")).toLowerCase();
    if (text.includes("presence") || text.includes("anwesenheit") || text.includes("occupancy")) return "Anwesenheit";
    if (text.includes("window") || text.includes("fenster") || text.includes("door") || text.includes("tür")) return "Fenster/Tür";
    if (text.includes("temp") || text.includes("klima") || text.includes("hum") || text.includes("feucht")) return "Klima";
    if (text.includes("lock") || text.includes("schloss") || text.includes("riegel")) return "Schloss";
    if (text.includes("smoke") || text.includes("rauch")) return "Rauch";
    if (text.includes("water") || text.includes("wasser") || text.includes("leak")) return "Wasser";

    // 3. PRIO: Fallback
    return "Sonstiges";
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const excludeList = this.config.exclude || [];
    const autoEntities = Object.keys(this.hass.states).filter(id => {
      const s = this.hass.states[id];
      const isBattery = s.attributes.device_class === 'battery' || (s.attributes.unit_of_measurement === '%' && id.includes('battery'));
      if (excludeList.includes(id)) return false;
      if (this.config.filter_battery_plus && (id.toLowerCase().endsWith('battery+') || (s.attributes.friendly_name || "").toLowerCase().endsWith('battery+'))) return false;
      return isBattery;
    });
    
    const manualIds = this.config.manual_entities || [];
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
      .name { font-weight: 600; font-size: 1rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
      .clickable { cursor: pointer; }
      .clickable:hover { color: var(--primary-color) !important; text-decoration: underline; }
      .badge { font-size: 0.7rem; background: var(--secondary-background-color); padding: 2px 6px; border-radius: 4px; width: fit-content; margin-top: 4px; color: var(--secondary-text-color); font-weight: bold; }
      .val { font-weight: bold; font-size: 1.1rem; }
      .panel { margin-top: 16px; border-radius: 12px; }
    `;
  }
}

customElements.define("battery-modern-card", BatteryModernCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "battery-modern-card",
  name: "Battery Modern Card",
  description: "Modern style battery monitor with dynamic badge overrides and navigation.",
  preview: true
});
