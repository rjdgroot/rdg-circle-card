# RdG Circle Cards

Visual, responsive and dynamic circular cards for Home Assistant.

This repository contains two custom cards for use in Home Assistant dashboards:

- **RdG Circle Card** — a single sensor displayed in an animated circle
- **RdG Multi Circle Card** — up to 6 sensors shown in a 3x2 grid

---

## Installation (via HACS)

1. Add this repository as a custom frontend repository in HACS.
2. Install both cards through HACS.
3. Add the following to your `resources:` in `configuration.yaml` or via the UI:

```yaml
- url: /hacsfiles/rdg-circle-card/rdg-circle-card.js
  type: module
- url: /hacsfiles/rdg-multicircle-card/rdg-multicircle-card.js
  type: module
