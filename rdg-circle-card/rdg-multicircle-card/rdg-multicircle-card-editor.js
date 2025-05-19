import { html, LitElement, css } from "https://unpkg.com/lit@2.8.0/index.js?module";


class RdGMultiCircleCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  static get styles() {
    return css`
      details {
        margin: 12px 0;
      }

      summary {
        font-weight: bold;
        cursor: pointer;
      }

      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
        margin-left: 16px;
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
      obj[keys[0]] = { ...(obj[keys[0]] || {}), action: value };
    } else {
      if (value === undefined) {
        delete obj[keys[0]];
      } else {
        obj[keys[0]] = value;
      }
    }
  
    this._config = { ...this._config };
    this.dispatchEvent(new CustomEvent("config-changed", { 
      detail: { config: this._config }, 
    }));
  }

  render() {
    if (!this._config) return html``;

    return html`
      ${this._renderGeneralSection()}
      ${[1, 2, 3, 4, 5, 6].map((i) => this._renderCircleSection(i))}
    `;
  }

  _renderGeneralSection() {
    return html`
      <details open>
        <summary>General settings</summary>
        <div class="card-config">
          <ha-textfield
            label="Stroke width (px)"
            type="number"
            .value=${this._config.stroke_width || 12}
            @change=${(e) => this._valueChanged(e, 'stroke_width')}
          ></ha-textfield>

          <ha-textfield
            label="Stroke background width (px)"
            type="number"
            .value=${this._config.stroke_bg_width || 10}
            @change=${(e) => this._valueChanged(e, 'stroke_bg_width')}
          ></ha-textfield>

          <ha-textfield
            label="Stroke background color"
            .value=${this._config.stroke_bg_color || ''}
            @change=${(e) => this._valueChanged(e, 'stroke_bg_color')}
          ></ha-textfield>

          <ha-formfield label="Show labels">
            <ha-switch
              .checked=${this._config.show_labels ?? true}
              @change=${(e) => this._valueChanged(e, 'show_labels')}
            ></ha-switch>
          </ha-formfield>
        </div>
      </details>
    `;
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }
    }));
  }

  _renderCircleSection(index) {
    const key = `circle_${index}`;
    const cfg = this._config[key] || {};

    return html`
      <details>
        <summary>Circle ${index}</summary>
        <div class="card-config">
          <ha-textfield
            label="Entity"
            .value=${cfg.entity || ''}
            @input=${(e) => this._valueChanged(e, `${key}.entity`)}
          ></ha-textfield>

          <ha-textfield
            label="Name"
            .value=${cfg.name || ''}
            @input=${(e) => this._valueChanged(e, `${key}.name`)}
          ></ha-textfield>

          <ha-textfield
            label="Icon"
            .value=${cfg.icon || ''}
            @input=${(e) => this._valueChanged(e, `${key}.icon`)}
          ></ha-textfield>

          <ha-textfield
            label="Units"
            .value=${cfg.units || ''}
            @input=${(e) => this._valueChanged(e, `${key}.units`)}
          ></ha-textfield>

          <ha-textfield
            label="Decimals"
            type="number"
            .value=${cfg.decimals ?? 0}
            @input=${(e) => this._valueChanged(e, `${key}.decimals`)}
          ></ha-textfield>

          <ha-textfield
            label="Min value"
            type="number"
            .value=${cfg.min ?? 0}
            @input=${(e) => this._valueChanged(e, `${key}.min`)}
          ></ha-textfield>

          <ha-textfield
            label="Max value"
            type="number"
            .value=${cfg.max ?? 100}
            @input=${(e) => this._valueChanged(e, `${key}.max`)}
          ></ha-textfield>

          <ha-textfield
            label="Alert value"
            type="number"
            .value=${cfg.alert_value ?? ''}
            @input=${(e) => this._valueChanged(e, `${key}.alert_value`)}
          ></ha-textfield>

          <ha-select
            label="Tap action"
            .value=${this._config.tap_action?.action ?? 'none'}
            @value-changed=${(e) => this._valueChanged(e, 'tap_action')}
          >
            <mwc-list-item value="none">None</mwc-list-item>
            <mwc-list-item value="toggle">Toggle</mwc-list-item>
            <mwc-list-item value="more-info">More Info</mwc-list-item>
            <mwc-list-item value="navigate">Navigate</mwc-list-item>
            <mwc-list-item value="call-service">Call Service</mwc-list-item>
          </ha-select>
          
          <ha-textfield
            label="Positive stroke color"
            .value=${cfg.stroke_color_positive || ''}
            @input=${(e) => this._valueChanged(e, `${key}.stroke_color_positive`)}
          ></ha-textfield>

          <ha-textfield
            label="Negative stroke color"
            .value=${cfg.stroke_color_negative || ''}
            @input=${(e) => this._valueChanged(e, `${key}.stroke_color_negative`)}
          ></ha-textfield>

          ${index > 3 ? html`
            <ha-formfield label="Show circle">
              <ha-switch
                .checked=${cfg.show !== false}
                @change=${(e) => this._valueChanged(e, `${key}.show`)}
              ></ha-switch>
            </ha-formfield>
          ` : ''}          
        </div>
      </details>
    `;
  }
}

customElements.define("rdg-multicircle-card-editor", RdGMultiCircleCardEditor);
customElements.whenDefined('ha-panel-lovelace').then(() => {
    console.info("✅ RdG MultiCircle Card loaded");
  });
  
