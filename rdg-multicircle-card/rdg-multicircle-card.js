import "../rdg-circle-card/rdg-circle-card.js";

class RdGMultiCircleCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('rdg-multicircle-card-editor');
  }
  setConfig(config) {
    const ordered = ['circle_1', 'circle_2', 'circle_3', 'circle_4', 'circle_5', 'circle_6'];
    this._config = {
      entities: ordered.map((key, index) => {
        if (!config[key]) throw new Error(`Ontbrekende configuratie: ${key}`);
        const entityConfig = { ...config[key] };
    
        if (entityConfig.stroke_color_positive)
          entityConfig.stroke_color_2 = entityConfig.stroke_color_positive;
    
        if (entityConfig.stroke_color_negative)
          entityConfig.stroke_color_1 = entityConfig.stroke_color_negative;
    
        if (!entityConfig.stroke_width && config.stroke_width)
          entityConfig.stroke_width = config.stroke_width;
    
        if (!entityConfig.stroke_bg_width && config.stroke_bg_width)
          entityConfig.stroke_bg_width = config.stroke_bg_width;

        if (!entityConfig.stroke_bg_color && config.stroke_bg_color) 
          entityConfig.stroke_bg_color = config.stroke_bg_color;

        if (config[key]?.alert_value !== undefined)
          entityConfig.alert_value = config[key].alert_value;
    
        entityConfig.show = index < 3 ? true : entityConfig.show !== false;
    
        return entityConfig;
      }),
      show_labels: config.show_labels ?? true,
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._circleCards) {
      this._circleCards.forEach((card, i) => {
        card.hass = hass;
      });
    }
  }

  _render() {
    if (this.shadowRoot) this.shadowRoot.innerHTML = '';
    else this.attachShadow({ mode: 'open' });
  
    const wrapper = document.createElement('div');
    wrapper.classList.add('grid');
  
    this._circleCards = [];
  
    const size = 'clamp(120px, 10vw, 120px)';
    const anyLabels = this._config.entities.some(cfg => cfg.name);
  
    for (let col = 0; col < 3; col++) {
      const top = this._config.entities[col];
      const bottom = this._config.entities[col + 3];
  
      const columnWrapper = document.createElement('div');
      columnWrapper.classList.add('col-wrapper');
  
      const addCircle = (cfg) => {
        if (cfg.show === false) {
          const placeholder = document.createElement('div');
          placeholder.classList.add('cell');
          columnWrapper.appendChild(placeholder);
          return;
        }
  
        const cell = document.createElement('div');
        cell.classList.add('cell');
  
        const card = document.createElement('rdg-circle-card');
        card.setConfig(cfg);
        card.style.setProperty('--circle-sensor-width', size);
        card.style.setProperty('--circle-sensor-height', size);
        card.setAttribute('no-card', '');
        card.style.background = 'transparent';
        card.style.boxShadow = 'none';
        card.style.setProperty('--ha-card-box-shadow', 'none');
  
        if (cfg.tap_action) {
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = cfg.tap_action.action || 'more-info';
              if (action === 'none') return;
            if (action === 'navigate') {
              window.history.pushState(null, '', cfg.tap_action.navigation_path);
              window.dispatchEvent(new Event('location-changed'));
            } else if (action === 'call-service' && cfg.tap_action.service) {
              const [domain, service] = cfg.tap_action.service.split('.');
              const serviceData = cfg.tap_action.service_data || {};
              this._hass.callService(domain, service, serviceData);
            } else if (action === 'toggle' && cfg.entity) {
              this._hass.callService('homeassistant', 'toggle', { entity_id: cfg.entity });
            } else if (action === 'more-info' && cfg.entity) {
              const event = new Event('hass-more-info', {
                bubbles: true,
                cancelable: false,
                composed: true
              });
              event.detail = { entityId: cfg.entity };
              card.dispatchEvent(event);
            }
          });
        }
  
        cell.appendChild(card);
  
        if (this._config.show_labels) {
          const label = document.createElement('div');
          label.classList.add('label');
          label.textContent = cfg.name || '\u00A0';
          cell.appendChild(label);
        }        

        columnWrapper.appendChild(cell);
        this._circleCards.push(card);
      };
  
      addCircle(top);
      addCircle(bottom);
  
      wrapper.appendChild(columnWrapper);
    }
  
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        max-width: 100%;
        max-height: var(--rdg-max-height, none);
        box-sizing: border-box;
        overflow: hidden;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0em;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        margin: 0 auto;
      }
      .col-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0em;
      }
      .cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
      }
      rdg-circle-card {
        width: 100%;
        height: 100%;
        aspect-ratio: 1;
        padding: 0em;
        box-sizing: border-box;
      }
      .label {
        margin-top: 0.1em;
        margin-bottom: 0.4em;
        font-size: 0.95em;
        color: var(--secondary-text-color);
        min-height: .5em;
        text-align: center;
      }
      .tab-wrapper {
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
      }

      .tab-wrapper::-webkit-scrollbar {
        display: none;
      }
    `;
  
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(wrapper);
  }

  getCardSize() {
    return 3;
  }
  
  static getConfigElement() {
    return document.createElement('rdg-multicircle-card-editor');
  }
}  
customElements.define('rdg-multicircle-card', RdGMultiCircleCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "rdg-multicircle-card",
  name: "RdG Multi Circle Card",
  description: "Configurable 3x2 grid card with 3 to 6 circle graphs for any value sensor. Specially designed for energy dashboards.",
  preview: "preview.gif"
});
