import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class RdGCircleCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      state: { type: Object },
      dashArray: { type: String },
      dashOffset: { type: String },
      _hass: { type: Object },
      _currentStrokeColor: { type: String }
    }
  }

  render() {
    const content = html`
      <div class="container" @click="${this._click}">
        <svg viewBox="0 0 200 200" id="svg">
          <defs>
            <filter id="circle-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="1" dy="1" result="offsetblur" />
              <feFlood flood-color="rgba(0,0,0,0.3)" />
              <feComposite in2="offsetblur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
  
            <linearGradient id="circle-gradient" gradientTransform="rotate(90)">
              <stop offset="0%" stop-color="var(--gradient-color-1, ${this.config.stroke_color || '#03a9f4'})" />
              <stop offset="100%" stop-color="var(--gradient-color-2, ${this.config.stroke_color || '#03a9f4'})" />
            </linearGradient>
          </defs>
  
          <circle id="circlestrokebg"
            cx="50%" cy="50%" r="45%"
            fill="${this.config.fill || 'rgba(255, 255, 255, .75)'}"
            stroke="${this.config.stroke_bg_color || '#999999'}"
            stroke-width="${this.config.stroke_bg_width || 6}"
            stroke-linecap="${this.config.stroke_linecap || 'butt'}"
            transform="rotate(-90 100 100)" />
  
          <!-- Positieve waarden -->
          <circle id="circle-pos"
            cx="50%" cy="50%" r="45%"
            fill="none"
            stroke="${this._currentStrokeColor || '#03a9f4'}"
            stroke-width="${this.config.stroke_width || 6}"
            stroke-linecap="${this.config.stroke_linecap || 'round'}"
            filter="${this.config.use_shadow ? 'url(#circle-shadow)' : 'none'}"
            transform="rotate(-90 100 100)"
            style="display: none;" />
  
          <!-- Negatieve waarden -->
          <circle id="circle-neg"
            cx="50%" cy="50%" r="45%"
            fill="none"
            stroke="${this._currentStrokeColor || '#03a9f4'}"
            stroke-width="${this.config.stroke_width || 6}"
            stroke-linecap="${this.config.stroke_linecap || 'round'}"
            filter="${this.config.use_shadow ? 'url(#circle-shadow)' : 'none'}"
            transform="rotate(-90 100 100)"
            style="display: none;" />
        </svg>
  
        <span class="labelContainer">
          ${this._renderContent()}
        </span>
      </div>
    `;
  
    return this.config?.show_card === false ? content : html`<ha-card>${content}</ha-card>`;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        cursor: pointer;
        position: relative;
        width: var(--circle-sensor-width, 100%);
        height: var(--circle-sensor-height, 100%);
        background: transparent;
      }

      :host([no-card]) {
        background: transparent;
        border-radius: 0;
        box-shadow: none;
      }

      .container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      svg {
        width: 100%;
        height: 100%;
      }
      
      svg circle#circle-pos,
      svg circle#circle-neg {
        transition: stroke-dasharray 1s ease, stroke-dashoffset 1s ease;
      }

      .labelContainer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: calc(var(--circle-sensor-width, 100px) * 0);
        font-size: calc(var(--circle-sensor-width, 100px) * 0.18);
      }

      .icon-wrapper {
        position: absolute;
        top: calc(45% - var(--circle-sensor-width, 100px) * 0.35);
        left: 50%;
        transform: translateX(-50%);
      }

      .icon-wrapper ha-icon {
        --mdc-icon-size: calc(var(--circle-sensor-width, 100px) * 0.2);
        width: auto;
        height: auto;
        color: var(--circle-dynamic-color, #03a9f4);
      }

      .value-wrapper {
        font-size: calc(var(--circle-sensor-width, 100px) * 0.25);
        font-weight: bold;
        text-align: center;
        transform: translate(-50%, -50%);
        top: 50%;
        left: 50%;
        position: absolute;
        z-index: 1;
      }

      .unit-wrapper {
        position: absolute;
        top: calc(35% + var(--circle-sensor-width, 100px) * 0.28);
        left: 50%;
        transform: translateX(-50%);
        font-size: calc(var(--circle-sensor-width, 100px) * 0.15);
        color: var(--circle-dynamic-color, #03a9f4);
      }

      .icon {
        color: var(--circle-dynamic-color, #03a9f4);
      }

      .text {
        font-weight: bold;
      }

      .unit {
        color: var(--circle-dynamic-color, #03a9f4);
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      .value-wrapper.alert {
        color: red;
        animation: blink 2s infinite;
      }

    `;
  }

  firstUpdated() {
    if (this.config) {
      this._updateConfig();
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw Error('No entity defined')
    }
    
    this.config = config;
    
    if (this.hasUpdated) {
      this._applyConfig();
    }

    this.alertThreshold = config.alert_value !== undefined ? Number(config.alert_value) : null;

  }

  _applyConfig() {
    if (this.state && this._hass) {
      const state = this.config.attribute
        ? this.state.attributes[this.config.attribute]
        : this.state.state;
      
      let colorStops = {};
      if (this.config.color_stops) {
        Object.entries(this.config.color_stops).forEach(([key, value]) => {
          colorStops[key] = value;
        });
      }
      if (Object.keys(colorStops).length === 0) {
        colorStops[this.config.min || 0] = this.config.stroke_color || '#03a9f4';
      }

      this._updateCircleColor(state, colorStops, this._hass);
    }
    
    this._updateConfig();
  }

  getCardSize() {
    return 3;
  }

  _updateConfig() {
    const container = this.shadowRoot?.querySelector('.labelContainer');
    if (!container) return;

    container.style.color = 'var(--primary-text-color)';

    if (this.config.font_style) {
      Object.keys(this.config.font_style).forEach((prop) => {
        if (prop === 'value_size') {
          this.style.setProperty('--value-font-size', this.config.font_style.value_size);
        } else if (prop === 'unit_size') {
          this.style.setProperty('--unit-font-size', this.config.font_style.unit_size);
        } else {
          container.style.setProperty(prop, this.config.font_style[prop]);
        }
      });
    }

    if (this.config.style) {
      Object.entries(this.config.style).forEach(([prop, value]) => {
        this.style.setProperty(prop, value);
      });
    }
  }

  set hass(hass) {
    this._hass = hass;
    this.state = hass.states?.[this.config.entity];
    if (!this.state) return; // sla render over als entity nog niet bestaat
    this.requestUpdate();
    if (!hass.states?.[this.config.entity]) {
      this._hass = hass;
      return; // entity bestaat nog niet, dus nog niet renderen
    }    
  
    const state = this.config.attribute
      ? this.state.attributes[this.config.attribute]
      : this.state.state;
  
    const r = 200 * 0.45;
    const min = this._getValue(this.config.min, hass);
    const max = this._getValue(this.config.max, hass);
    const val = Number(state);
    if (isNaN(val)) {
      console.warn('Waarde van entiteit is geen getal:', this.config.entity, state);
      return;
    }
    const circumference = 2 * Math.PI * r;
  
    const circlePos = this.shadowRoot?.querySelector('#circle-pos');
    const circleNeg = this.shadowRoot?.querySelector('#circle-neg');
    if (!circlePos || !circleNeg) return;
  
    circlePos.style.display = 'none';
    circleNeg.style.display = 'none';
  
    const split = this.config.color_split_value ?? 0;
    const stroke = val < split
      ? this.config.stroke_color_1 || '#f44336'
      : this.config.stroke_color_2 || '#03a9f4';

    this._currentStrokeColor = stroke;
    this.style.setProperty('--circle-dynamic-color', stroke);

  
    if (val > 0 && max !== 0) {
      const percent = Math.min(val / max, 1);
      const valueLength = percent * circumference;
  
      circlePos.setAttribute('stroke', stroke);
      this._currentStrokeColor = stroke;
      circlePos.setAttribute('stroke-dasharray', `${valueLength} ${circumference}`);
      circlePos.setAttribute('stroke-dashoffset', `0`);
      circlePos.style.display = 'block';
  
    } else if (val < 0 && min !== 0) {
      const percent = Math.min(Math.abs(val / min), 1);
      const valueLength = percent * circumference;
  
      circleNeg.setAttribute('stroke', stroke);
      circleNeg.setAttribute('stroke-dasharray', `${valueLength} ${circumference}`);
      circleNeg.setAttribute('stroke-dashoffset', `${valueLength - circumference}`);
      circleNeg.style.display = 'block';
    }

    else {
      // Bij exact 0, toon een lege grijze achtergrondcirkel of een subtiele vulling
      circlePos.setAttribute('stroke-dasharray', `0 ${circumference}`);
      circlePos.setAttribute('stroke-dashoffset', `0`);
      circlePos.style.display = 'block';
      circlePos.setAttribute('stroke', stroke);
    }
  }
  
  _click(e) {
    this._handleAction(e);
  }

  _calculateValueBetween(start, end, val) {
    return (val - start) / (end - start);
  }

  _getGradientValue(colorA, colorB, val) {
    const v1 = 1 - val;
    const v2 = val;
    const decA = this._hexColorToDecimal(colorA);
    const decB = this._hexColorToDecimal(colorB);
    const rDec = Math.floor((decA[0] * v1) + (decB[0] * v2));
    const gDec = Math.floor((decA[1] * v1) + (decB[1] * v2));
    const bDec = Math.floor((decA[2] * v1) + (decB[2] * v2));
    const rHex = this._padZero(rDec.toString(16));
    const gHex = this._padZero(gDec.toString(16));
    const bHex = this._padZero(bDec.toString(16));
    return `#${rHex}${gHex}${bHex}`;
  }

  _hexColorToDecimal(color) {
    if (color.startsWith('rgb')) {
      const rgb = color.match(/\d+/g).map(Number);
      return rgb.slice(0, 3);
    }
    
    if (!color.startsWith('#')) {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = color;
      color = ctx.fillStyle;
    }

    let c = color.substr(1);
    if (c.length === 3) {
      c = `${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`;
    }

    const [r, g, b] = c.match(/.{2}/g);
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
  }

  _padZero(val) {
    if (val.length < 2) {
      val = `0${val}`;
    }
    return val.substr(0, 2);
  }

  _fire(type, detail) {
    const event = new Event(type, {
      bubbles: true,
      cancelable: false,
      composed: true
    });
    event.detail = detail || {};
    this.shadowRoot.dispatchEvent(event);
    return event;
  }

  _getUnitLabel() {
    if (this.config.show_max) {
      return html`&nbsp;/ ${this.config.attribute_max ? this.state.attributes[this.config.attribute_max] : this.config.max}`;
    } else if (this.config.units) {
      return this.config.units;
    } else if (this.state?.attributes?.unit_of_measurement) {
      return this.state.attributes.unit_of_measurement;
    } else {
      return '';
    }
  }

  _computeIconStyles() {
    return `color: var(--circle-dynamic-color, #03a9f4)`;
  }

  _renderContent() {
    const iconName = this.config.icon || this.state?.attributes?.icon;
    const icon = iconName ? html`
      <div class="icon-wrapper">
        <ha-icon class="icon" .icon="${iconName}"></ha-icon>
      </div>
    ` : '';

    const currentValue = Number(this.state?.state);
    const isAlert = this.alertThreshold !== null && currentValue > this.alertThreshold;

    const value = html`
      <div class="value-wrapper ${isAlert ? 'alert' : ''}">
        <span class="text">
          ${this.config.attribute ? this.state.attributes[this.config.attribute] : this._getStateValue()}
        </span>
      </div>
    `;

    const unit = html`
      <div class="unit-wrapper">
        <span class="unit">
          ${this._getUnitLabel()}
        </span>
      </div>
    `;

    return html`
      ${icon}
      ${value}
      ${unit}
    `;
  }

  _getStateValue() {
    if (this.state === undefined) {
      return 0;
    }
    const value = Number(this.state.state);
    return this.config.decimals !== undefined 
      ? value.toFixed(this.config.decimals) 
      : value;
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('config')) {
      this._applyConfig();
      // Set no-card attribute based on show_card config
      if (this.config.show_card === false) {
        this.setAttribute('no-card', '');
      } else {
        this.removeAttribute('no-card');
      }
    }
  }

  _getValue(value, hass) {
    if (!value) return 0;

    if (typeof value === 'string') {
      if (value.includes('sensor:') && (value.includes('+') || value.includes('-'))) {
        const parts = value.match(/sensor:([^+\-]+)([+\-])([\d.]+)/);
        if (parts) {
          const [, entityId, operator, number] = parts;
          const baseValue = Number(hass?.states[entityId.trim()]?.state) || 0;
          const offset = parseFloat(number);
          return operator === '+' ? baseValue + offset : baseValue - offset;
        }
      }
      if (value.startsWith('sensor:')) {
        const entityId = value.substr(7);
        return Number(hass?.states[entityId]?.state) || 0;
      }
      if (value.startsWith('attr:')) {
        const attr = value.substr(5);
        return Number(this.state?.attributes[attr]) || 0;
      }
      return parseFloat(value) || 0;
    }
    return Number(value) || 0;
  }

  _adjustColor(color, percent) {
    const rgb = this._hexColorToDecimal(color);
    const adjusted = rgb.map(c => {
      const adj = Math.floor(c * (1 + percent/100));
      return Math.min(255, Math.max(0, adj));
    });
    return `rgb(${adjusted.join(',')})`;
  }

  _updateCircleColor(state, colorStops, hass) {
    const circle = this.shadowRoot?.querySelector('#circle');
    if (!circle) return;

    const split = this.config.color_split_value ?? 0;
    const stroke = (state < split)
      ? this.config.stroke_color_1 || '#f44336'
      : this.config.stroke_color_2 || '#03a9f4';

    this._currentStrokeColor = stroke;
    this.style.setProperty('--circle-dynamic-color', stroke);

    circle.setAttribute('stroke', stroke);
  }

  _getBaseSensorValue(value, hass) {
    if (typeof value === 'string' && value.startsWith('sensor:')) {
      const match = value.match(/sensor:([^+\-]+)/);
      if (match) {
        const entityId = match[1].trim();
        return Number(hass?.states[entityId]?.state) || 0;
      }
    }
    return this._getValue(value, hass);
  }
  static getConfigElement() {
    return document.createElement("rdg-circle-card-editor");
  }  
  connectedCallback() {
    super.connectedCallback?.();
    this._resizeObserver = new ResizeObserver(() => this._updateSize());
    this._resizeObserver.observe(this);
  }
  
  disconnectedCallback() {
    super.disconnectedCallback?.();
    this._resizeObserver.disconnect();
  }
  
  _updateSize() {
    const size = this.offsetWidth;
    this.style.setProperty('--circle-sensor-width', size + 'px');
  }

  _handleAction(e) {
    const action = this.config?.tap_action?.action || 'none';
  
    switch (action) {
      case 'more-info':
        this.dispatchEvent(
          new CustomEvent('hass-more-info', {
            detail: { entityId: this.config.entity },
            bubbles: true,
            composed: true,
          })
        );
        break;
  
      case 'navigate':
        if (this.config.tap_action?.navigation_path) {
          history.pushState(null, '', this.config.tap_action.navigation_path);
          window.dispatchEvent(new Event('location-changed'));
        }
        break;
  
      case 'url':
        if (this.config.tap_action?.url_path) {
          window.open(this.config.tap_action.url_path, '_blank');
        }
        break;
  
      case 'call-service':
        if (this.config.tap_action?.service) {
          const [domain, service] = this.config.tap_action.service.split('.');
          this._hass.callService(domain, service, this.config.tap_action.service_data || {});
        }
        break;
  
      case 'none':
      default:
        break;
    }
  }  
}
customElements.define('rdg-circle-card', RdGCircleCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "rdg-circle-card",
  name: "RdG Circle Card",
  description: "Configurable single circle graph for any value sensor. Specially designed for energy dashboards.",
  preview: true,
});
