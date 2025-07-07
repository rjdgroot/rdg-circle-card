# RdG Circle Card

A configurable, animated and responsive circle graph for Home Assistant dashboards.  
Ideal for showing energy, temperature, or any other numeric sensor — with support for both positive and negative values.

![Preview](preview.gif)

---

## 🔧 Features

- 🔄 Animated SVG circle with smooth transitions
- ➕ Supports both positive and negative values (dual-direction mode)
- 🎨 Dynamic stroke color (based on value, split point, or color stops)
- 🌈 Custom gradients, background color, and stroke styles
- 🧾 Display entity value, units, icon, and optional max
- 📱 Fully responsive (auto-scaling based on container)
- 🚨 Optional alert blinking when value exceeds a threshold
- ⚡ Tap actions: `more-info`, `navigate`, `call-service`, `url`, or `none`
- 🧩 Easy to use as a standalone card or embedded in custom layouts
- 🛠️ Full theme variable and font styling support

---

## 📦 Installation

### Option 1: HACS (recommended)

1. Add this repository as a **custom repository** in HACS:
2. Go to HACS → Frontend → Explore & Download Repositories
3. Search for **"RdG Circle Card"**, install and reload

### Option 2: Manual

1. Copy `rdg-circle-card.js` to `/config/www/rdg-circle-card/`
2. Add to your `configuration.yaml` or UI resources:

```yaml
resources:
- url: /local/rdg-circle-card/rdg-circle-card.js
 type: module
```

## 🧪 Example Usage

```
type: custom:rdg-circle-card
entity: sensor.energy_today
icon: mdi:flash
min: -10
max: 10
stroke_color_1: "#4caf50"
stroke_color_2: "#f44336"
stroke_bg_color: "#cccccc"
stroke_width: 10
stroke_bg_width: 6
units: "kWh"
decimals: 1
show_max: true
color_split_value: 0
use_shadow: true
alert_value: 9.5
tap_action:
  action: more-info
```

## ⚙️ Available Options

<table> <thead> <tr> <th>Option</th> <th>Type</th> <th>Description</th> </tr> </thead> <tbody> <tr><td><code>entity</code></td><td>string</td><td>The sensor to track (<strong>required</strong>)</td></tr> <tr><td><code>icon</code></td><td>string</td><td>(Optional) Material Design icon</td></tr> <tr><td><code>min</code> / <code>max</code></td><td>number / string</td><td>Value range (can also reference other sensors or attributes)</td></tr> <tr><td><code>stroke_color_1</code></td><td>string</td><td>Color when value &lt; <code>color_split_value</code></td></tr> <tr><td><code>stroke_color_2</code></td><td>string</td><td>Color when value ≥ <code>color_split_value</code></td></tr> <tr><td><code>stroke_color</code></td><td>string</td><td>Single color (when not using split logic)</td></tr> <tr><td><code>stroke_width</code></td><td>number</td><td>Width of the foreground circle stroke</td></tr> <tr><td><code>stroke_bg_color</code></td><td>string</td><td>Color of the background stroke</td></tr> <tr><td><code>stroke_bg_width</code></td><td>number</td><td>Width of the background stroke</td></tr> <tr><td><code>stroke_linecap</code></td><td>string</td><td>Stroke edge style (<code>'round'</code>, <code>'butt'</code>, etc.)</td></tr> <tr><td><code>fill</code></td><td>string</td><td>Background fill color of the circle area</td></tr> <tr><td><code>use_shadow</code></td><td>boolean</td><td>Enables inner SVG shadow filter</td></tr> <tr><td><code>units</code></td><td>string</td><td>Override unit label</td></tr> <tr><td><code>attribute</code></td><td>string</td><td>Use value from specific attribute instead of state</td></tr> <tr><td><code>attribute_max</code></td><td>string</td><td>For use with <code>show_max</code></td></tr> <tr><td><code>show_max</code></td><td>boolean</td><td>Show max value next to current</td></tr> <tr><td><code>decimals</code></td><td>number</td><td>Decimal precision</td></tr> <tr><td><code>alert_value</code></td><td>number</td><td>Blinking alert if value exceeds this threshold</td></tr> <tr><td><code>tap_action</code></td><td>object</td><td>Standard Lovelace action object</td></tr> <tr><td><code>show_card</code></td><td>boolean</td><td>If <code>false</code>, renders without <code>ha-card</code> wrapper</td></tr> <tr><td><code>font_style</code></td><td>object</td><td>Define individual font sizes and styling</td></tr> <tr><td><code>style</code></td><td>object</td><td>Set custom CSS vars (like <code>--circle-sensor-width</code>)</td></tr> <tr><td><code>color_split_value</code></td><td>number</td><td>Threshold to switch between <code>stroke_color_1</code> and <code>stroke_color_2</code></td></tr> </tbody> </table>

## 🧱 Embeddable
Can be used within other custom cards (e.g., button-card, stack-in-card) or inside grid layouts.

## 📘 License
MIT License. Created by Rinse de Groot
