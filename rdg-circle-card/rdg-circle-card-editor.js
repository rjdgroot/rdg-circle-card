
import { html, css, LitElement } from "https://unpkg.com/lit@2.8.0/index.js?module";

class RdGCircleCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        height: 100%;
      }

      .editor-wrapper {
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 8px;
      }

      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px 8px;
      }
    `;
  }

  setConfig(config) {
    this._config = structuredClone(config);
  }

  getConfig() {
    return this._config;
  }

  _valueChanged(e, path) {
    const raw = e.target?.checked ?? e.target?.value;
    const value = raw === '' ? undefined : raw;
  
    const keys = path.split('.');
    let obj = this._config;
  
    while (keys.length > 1) {
      const key = keys.shift();
      obj[key] = obj[key] || {};
      obj = obj[key];
    }
  
    if (keys[0] === 'tap_action') {
      obj[keys[0]] = typeof value === 'string' 
        ? { action: value } 
        : { ...(obj[keys[0]] || {}), ...value };
    }
  
    this._config = { ...this._config };
    this.dispatchEvent(new CustomEvent("config-changed", { 
      detail: { config: this._config }, 
    }));
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
    }));
  }

  render() {
    if (!this._config) return html``;

    return html`
      <div class="editor-wrapper">
        <div class="card-config">
          <ha-textfield
            .hass=${this.hass}
            .value=${this._config.entity || ''}
            label="Entity"
            @input=${(e) => this._valueChanged(e, 'entity')}
          ></ha-textfield>

          <ha-textfield
            label="Name"
            .value=${this._config.name || ''}
            @input=${(e) => this._valueChanged(e, 'name')}
          ></ha-textfield>

          <ha-icon-picker
            .hass=${this.hass}
            label="Icon"
            .value=${this._config.icon || ''}
            @value-changed=${(e) => this._valueChanged(e, 'icon')}
          ></ha-icon-picker>

          <ha-textfield
            label="Units"
            .value=${this._config.units || ''}
            @input=${(e) => this._valueChanged(e, 'units')}
          ></ha-textfield>

          <ha-textfield
            label="Decimals"
            type="number"
            .value=${this._config.decimals ?? 0}
            @input=${(e) => this._valueChanged(e, 'decimals')}
          ></ha-textfield>

          <ha-textfield
            label="Min"
            type="number"
            .value=${this._config.min ?? 0}
            @input=${(e) => this._valueChanged(e, 'min')}
          ></ha-textfield>

          <ha-textfield
            label="Max"
            type="number"
            .value=${this._config.max ?? 100}
            @input=${(e) => this._valueChanged(e, 'max')}
          ></ha-textfield>

          <ha-textfield
            label="Alert value"
            type="number"
            .value=${this._config.alert_value ?? ''}
            @input=${(e) => {
              const raw = e.target.value;
              const value = raw === '' ? undefined : Number(raw);
              this._valueChanged({ target: { value } }, 'alert_value');
            }}
          ></ha-textfield>

          <ha-select
            label="Tap action"
            .value=${this._config.tap_action?.action ?? 'none'}
            @value-changed=${(e) => {
              const action = e.detail.value;
              this._config = {
                ...this._config,
                tap_action: { action },
              };
              this._fireConfigChanged();
            }}
          >
            <mwc-list-item value="none">None</mwc-list-item>
            <mwc-list-item value="toggle">Toggle</mwc-list-item>
            <mwc-list-item value="more-info">More Info</mwc-list-item>
            <mwc-list-item value="navigate">Navigate</mwc-list-item>
            <mwc-list-item value="call-service">Call Service</mwc-list-item>
          </ha-select>

          <ha-textfield
            label="Positive stroke color"
            .value=${this._config.stroke_color_2 || ''}
            @input=${(e) => this._valueChanged(e, 'stroke_color_2')}
          ></ha-textfield>

          <ha-textfield
            label="Negative stroke color"
            .value=${this._config.stroke_color_1 || ''}
            @input=${(e) => this._valueChanged(e, 'stroke_color_1')}
          ></ha-textfield>

          <ha-textfield
            label="Stroke width"
            type="number"
            .value=${this._config.stroke_width || 12}
            @input=${(e) => this._valueChanged(e, 'stroke_width')}
          ></ha-textfield>

          <ha-textfield
            label="Stroke background width"
            type="number"
            .value=${this._config.stroke_bg_width || 10}
            @input=${(e) => this._valueChanged(e, 'stroke_bg_width')}
          ></ha-textfield>

          <ha-textfield
            label="Stroke background color"
            .value=${this._config.stroke_bg_color || ''}
            @input=${(e) => this._valueChanged(e, 'stroke_bg_color')}
          ></ha-textfield>

          <ha-textfield
            label="Fill color"
            .value=${this._config.fill || ''}
            @input=${(e) => this._valueChanged(e, 'fill')}
          ></ha-textfield>
        </div>
      </div>
    `;
  }
}

customElements.define("rdg-circle-card-editor", RdGCircleCardEditor);
