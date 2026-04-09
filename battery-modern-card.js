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

  _toggleFilter(field) {
    this._changeValue(field, !this.config[field]);
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
    const list = (this.config[field] || []).map(e => typeof e === 'string' ? e : e.entity);
    if (!list.includes(entityId)) {
      list.push(entityId);
      this._changeValue(field, list);
    }
  }

  _removeEntity(field, index) {
    const list = [...(this.config[field] || [])];
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

    const manualList = (this.config.manual_entities || []).map(e => typeof e === 'string' ? e : e.entity);
    const excludeList = this.config.exclude || [];

    const currentIds = Object.keys(this.hass.states).filter(id => {
      const s = this.hass.states[id];
      const isBattery = s.attributes.device_class === 'battery' || (s.attributes.unit_of_measurement === '%' && id.includes('battery'));
      return isBattery || manualList.includes(id);
    }).filter(id => !excludeList.includes(id));

    return html`
      <div class="editor-container">
        
        <ha-expansion-panel header="Header Design" outlined>
          <div class="panel-content grid-2">
            <ha-textfield label="Titel" .value="${this.config.title || ''}" @input="${(e) => this._changeValue('title', e.target.value)}"></ha-textfield>
            <ha-icon-picker .hass=${this.hass} .value=${this.config.title_icon || ''} label="Titel Icon" @value-changed=${(e) => this._changeValue('title_icon', e.detail.value)}></ha-icon-picker>
            <ha-textfield label="Hintergrund (CSS)" .value="${this.config.header_bg || ''}" @input="${(e) => this._changeValue('header_bg', e.target.value)}" placeholder="transparent"></ha-textfield>
            <div style="display:flex; gap:10px;">
              <ha-textfield label="Titel Farbe" .value="${this.config.title_color || ''}" @input="${(e) => this._changeValue('title_color', e.target.value)}"></ha-textfield>
              <ha-textfield label="Titel Größe" .value="${this.config.title_size || ''}" @input="${(e) => this._changeValue('title_size', e.target.value)}"></ha-textfield>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Statistik-Boxen Design" outlined>
          <div class="panel-content">
            <h4 class="section-title">Normale Box (Gesamt)</h4>
            <div class="grid-2">
              <ha-textfield label="Hintergrund" .value="${this.config.stat_bg || ''}" @input="${(e) => this._changeValue('stat_bg', e.target.value)}"></ha-textfield>
              <ha-textfield label="Rahmen (Border)" .value="${this.config.stat_border || ''}" @input="${(e) => this._changeValue('stat_border', e.target.value)}" placeholder="none"></ha-textfield>
              <ha-textfield label="Zahl Farbe" .value="${this.config.stat_value_color || ''}" @input="${(e) => this._changeValue('stat_value_color', e.target.value)}"></ha-textfield>
              <ha-textfield label="Label Farbe" .value="${this.config.stat_label_color || ''}" @input="${(e) => this._changeValue('stat_label_color', e.target.value)}"></ha-textfield>
            </div>
            
            <h4 class="section-title critical-title">Kritische Box (Warnung)</h4>
            <div class="grid-2">
              <ha-textfield label="Hintergrund (Kritisch)" .value="${this.config.stat_warn_bg || ''}" @input="${(e) => this._changeValue('stat_warn_bg', e.target.value)}" placeholder="rgba(244,67,54,0.1)"></ha-textfield>
              <ha-textfield label="Rahmen (Kritisch)" .value="${this.config.stat_warn_border || ''}" @input="${(e) => this._changeValue('stat_warn_border', e.target.value)}" placeholder="1px solid #f44336"></ha-textfield>
              <ha-textfield label="Zahl Farbe (Kritisch)" .value="${this.config.stat_warn_value_color || ''}" @input="${(e) => this._changeValue('stat_warn_value_color', e.target.value)}" placeholder="#f44336"></ha-textfield>
              <ha-textfield label="Label Farbe (Kritisch)" .value="${this.config.stat_warn_label_color || ''}" @input="${(e) => this._changeValue('stat_warn_label_color', e.target.value)}"></ha-textfield>
            </div>
            
            <h4 class="section-title">Allgemein</h4>
            <ha-textfield label="Schatten für beide Boxen" .value="${this.config.stat_shadow || ''}" @input="${(e) => this._changeValue('stat_shadow', e.target.value)}" placeholder="0 4px 12px rgba(0,0,0,0.05)"></ha-textfield>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Batterie-Zeilen Design" outlined>
          <div class="panel-content grid-2">
            <ha-textfield label="Zeilen Hintergrund" .value="${this.config.row_bg || ''}" @input="${(e) => this._changeValue('row_bg', e.target.value)}"></ha-textfield>
            <ha-textfield label="Zeilen Rahmen" .value="${this.config.row_border || ''}" @input="${(e) => this._changeValue('row_border', e.target.value)}"></ha-textfield>
            <ha-textfield label="Batterie-Name Farbe" .value="${this.config.name_color || ''}" @input="${(e) => this._changeValue('name_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Batterie-Name Größe" .value="${this.config.name_size || ''}" @input="${(e) => this._changeValue('name_size', e.target.value)}"></ha-textfield>
            <ha-textfield label="Prozent-Wert Farbe" .value="${this.config.value_color || ''}" @input="${(e) => this._changeValue('value_color', e.target.value)}"></ha-textfield>
            <ha-textfield label="Prozent-Wert Größe" .value="${this.config.value_size || ''}" @input="${(e) => this._changeValue('value_size', e.target.value)}"></ha-textfield>
            <ha-textfield label="Zeilen Schatten" .value="${this.config.row_shadow || ''}" @input="${(e) => this._changeValue('row_shadow', e.target.value)}" placeholder="0 2px 6px rgba(0,0,0,0.03)" style="grid-column: span 2;"></ha-textfield>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Filter & Manuell Hinzufügen" outlined expanded>
          <div class="panel-content">
            <div class="switch-row">
                <span>Battery+ Duplikate ausblenden</span>
                <ha-switch .checked=${this.config.filter_battery_plus} @change=${() => this._toggleFilter('filter_battery_plus')}></ha-switch>
            </div>
            
            <h4 class="section-title">Fehlende Batterie hinzufügen</h4>
            
            <ha-entity-picker 
              .hass=${this.hass} 
              label="Entität suchen..." 
              @value-changed=${(e) => { 
                if(e.detail.value) {
                  this._addEntity('manual_entities', e.detail.value); 
                  // Timeout verhindert den HA Render-Crash
                  setTimeout(() => { e.target.value = ""; }, 50);
                }
              }}>
            </ha-entity-picker>

            <div class="chip-container">
              ${manualList.map((ent, i) => html`<div class="chip include">${ent} <ha-icon icon="mdi:close" @click=${() => this._removeEntity('manual_entities', i)}></ha-icon></div>`)}
            </div>

            <h4 class="section-title">Ausgeblendete Batterien</h4>
            <p class="info-text">Sensoren kannst du im Tab unten drunter ("Sichtbare Batterien") per Klick ausblenden.</p>
            <div class="chip-container">
              ${excludeList.map((ent, i) => html`<div class="chip exclude">${ent} <ha-icon icon="mdi:close" @click=${() => this._removeEntity('exclude', i)}></ha-icon></div>`)}
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel header="Sichtbare Batterien (Label & Ausblenden)" outlined>
          <div class="panel-content">
            <p class="info-text">Vergib eigene Namen oder klicke auf das 👁️-Icon, um falsche Sensoren komplett auszublenden.</p>
            <div class="manual-list">
              ${currentIds.map(id => html`
                <div class="manual-item-editor">
                  <div class="ent-header">
                    <div class="ent-id">${this.hass.states[id]?.attributes?.friendly_name || id}</div>
                    <ha-icon icon="mdi:eye-off" title="Dauerhaft ausblenden" @click=${() => this._addEntity('exclude', id)}></ha-icon>
                  </div>
                  <ha-textfield label="Manuelles Label" .value="${this.config.custom_badges[id] || ''}" @input="${(e) => this._updateBadgeOverride(id, e.target.value)}" placeholder="Automatik: ${this._getAutoCategory(id)}"></ha-textfield>
                </div>
              `)}
            </div>
          </div>
        </ha-expansion-panel>

      </div>
    `;
  }

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
      .section-title { margin: 16px 0 8px; font-size: 0.9rem; color: var(--primary-color); border-bottom: 1px solid var(--divider-color); padding-bottom: 4px; }
      .critical-title { color: var(--error-color); }
      .switch-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0 16px; font-weight: 500; }
      .info-text { font-size: 0.85rem; color: var(--secondary-text-color); margin-bottom: 12px; line-height: 1.4; }
      .manual-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; padding-right: 5px; }
      .manual-item-editor { border: 1px solid var(--divider-color); padding: 10px; border-radius: 8px; background: rgba(var(--rgb-primary-text-color), 0.02); }
      .ent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .ent-id { font-size: 0.8rem; font-weight: bold; color: var(--primary-color); }
      .ent-header ha-icon { color: var(--error-color); cursor: pointer; --mdc-icon-size: 20px; transition: transform 0.1s; }
      .ent-header ha-icon:hover { transform: scale(1.2); }
      .chip-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .chip { padding: 4px 10px; border-radius: 16px; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; }
      .chip.exclude { background: rgba(244,67,54,0.1); border: 1px solid #f44336; color: #f44336; }
      .chip.include { background: rgba(76,175,80,0.1); border: 1px solid #4caf50; color: #4caf50; }
      ha-textfield, ha-entity-picker, ha-icon-picker { width: 100%; margin-bottom: 4px; }
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
    if (this.config.custom_badges && this.config.custom_badges[entityId]) return this.config.custom_badges[entityId];
    const text = (entityId + " " + (friendlyName || "")).toLowerCase();
    if (text.includes("presence") || text.includes("anwesenheit") || text.includes("occupancy")) return "Anwesenheit";
    if (text.includes("window") || text.includes("fenster") || text.includes("door") || text.includes("tür")) return "Fenster/Tür";
    if (text.includes("temp") || text.includes("klima") || text.includes("hum") || text.includes("feucht")) return "Klima";
    if (text.includes("lock") || text.includes("schloss") || text.includes("riegel")) return "Schloss";
    if (text.includes("smoke") || text.includes("rauch")) return "Rauch";
    if (text.includes("water") || text.includes("wasser") || text.includes("leak")) return "Wasser";
    return "Sonstiges";
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const excludeList = this.config.exclude || [];
    const autoEntities = Object.keys(this.hass.states).filter(id => {
      const s = this.hass.states[id];
      const isBattery = s.attributes.device_class === 'battery' || (s.attributes.unit_of_measurement === '%' && id.includes('battery'));
      if (excludeList.includes(id)) return false;
      
      if (this.config.filter_battery_plus) {
        const idLower = id.toLowerCase();
        const nameLower = (s.attributes.friendly_name || "").toLowerCase();
        if (
          idLower.endsWith('battery_plus') || 
          idLower.endsWith('batterie_plus') || 
          nameLower.endsWith('battery+') || 
          nameLower.endsWith('batterie+')
        ) {
          return false;
        }
      }
      
      return isBattery;
    });
    
    const manualIds = (this.config.manual_entities || []).map(e => typeof e === 'string' ? e : e.entity);
    const combinedIds = [...new Set([...autoEntities, ...manualIds])].filter(id => !excludeList.includes(id));

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

    const globalStyles = `
      --c-header-bg: ${this.config.header_bg || 'transparent'};
      
      --c-stat-bg: ${this.config.stat_bg || 'var(--ha-card-background, white)'};
      --c-stat-border: ${this.config.stat_border || 'none'};
      --c-stat-shadow: ${this.config.stat_shadow || '0 4px 12px rgba(0,0,0,0.05)'};
      
      --c-warn-bg: ${this.config.stat_warn_bg || 'var(--ha-card-background, white)'};
      --c-warn-border: ${this.config.stat_warn_border || '1px solid #f44336'};
      --c-warn-val: ${this.config.stat_warn_value_color || '#f44336'};
      --c-warn-label: ${this.config.stat_warn_label_color || 'var(--secondary-text-color)'};
      
      --c-row-bg: ${this.config.row_bg || 'var(--ha-card-background, white)'};
      --c-row-border: ${this.config.row_border || 'none'};
      --c-row-shadow: ${this.config.row_shadow || '0 2px 6px rgba(0,0,0,0.03)'};
    `;

    return html`
      <ha-card style="${globalStyles}">
        <div class="header" style="background: var(--c-header-bg); color: ${this.config.title_color || ''}; font-size: ${this.config.title_size || ''};">
          ${this.config.title_icon ? html`<ha-icon icon="${this.config.title_icon}" style="margin-right:12px;"></ha-icon>` : ''}
          ${this.config.title || 'Batteriestatus'}
        </div>

        <div class="stats">
          <div class="box normal-box">
            <span style="color: ${this.config.stat_value_color || ''}; font-size: ${this.config.stat_value_size || ''};">${batteries.length}</span>
            <label style="color: ${this.config.stat_label_color || ''}; font-size: ${this.config.stat_label_size || ''};">Gesamt</label>
          </div>
          <div class="box warn-box ${critical.length > 0 ? 'active-warn' : ''}">
            <span class="warn-val">${critical.length}</span>
            <label class="warn-lbl">Kritisch</label>
          </div>
        </div>

        <div class="content">
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
    const iconColor = b.state <= 20 ? "#f44336" : (b.state <= 40 ? "#ff9800" : "#4caf50");
    return html`
      <div class="item">
        <ha-icon icon="mdi:battery${b.state <= 10 ? '-outline' : (b.state >= 95 ? '' : '-' + Math.round(b.state/10)*10)}" style="color: ${iconColor}"></ha-icon>
        <div class="info">
          <div class="name clickable" @click=${() => this._handleMoreInfo(b.id)} style="color: ${this.config.name_color || ''}; font-size: ${this.config.name_size || ''};">
            ${b.name}
          </div>
          <div class="badge">${b.category}</div>
        </div>
        <div class="val" style="color: ${this.config.value_color || iconColor}; font-size: ${this.config.value_size || ''};">${b.state}%</div>
      </div>
    `;
  }

  static get styles() {
    return css`
      ha-card { overflow: hidden; }
      .header { padding: 24px 16px 16px; display: flex; align-items: center; font-size: 24px; font-weight: 400; }
      
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 16px 20px; }
      .box { border-radius: 12px; padding: 20px; text-align: center; display: flex; flex-direction: column; box-shadow: var(--c-stat-shadow); transition: transform 0.2s; }
      .box:hover { transform: translateY(-2px); }
      .box span { font-size: 2.2rem; font-weight: 500; }
      .box label { font-size: 0.8rem; color: var(--secondary-text-color); text-transform: uppercase; font-weight: 600; }
      
      .normal-box { background: var(--c-stat-bg); border: var(--c-stat-border); }
      
      .warn-box { background: var(--c-stat-bg); border: var(--c-stat-border); }
      .warn-box.active-warn { background: var(--c-warn-bg); border: var(--c-warn-border); }
      .warn-box.active-warn .warn-val { color: var(--c-warn-val); }
      .warn-box.active-warn .warn-lbl { color: var(--c-warn-label); }
      
      .content { padding: 0 16px 16px; }
      .list { display: flex; flex-direction: column; gap: 12px; }
      
      .item { display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; background: var(--c-row-bg); border: var(--c-row-border); box-shadow: var(--c-row-shadow); transition: transform 0.1s; }
      .item:hover { transform: translateY(-1px); filter: brightness(0.98); }
      .info { flex-grow: 1; margin-left: 16px; overflow: hidden; }
      
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

window.customCards = window.customCards || [];
const cardExists = window.customCards.some(c => c.type === "battery-modern-card");
if (!cardExists) {
  window.customCards.push({
    type: "battery-modern-card",
    name: "Battery Modern Card",
    description: "Ultimate Edition with Final UX Fixes.",
    preview: true
  });
}
