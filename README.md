# Battery Modern Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

A sleek, modern battery monitoring card inspired by the clean aesthetics of AdGuard Card and my previous Proxmox HA Card. 

## ✨ Features
- **Visual Editor:** Full UI configuration with Accordion menus.
- **Header Styling:** Custom icons and font settings for the title.
- **Top Stats:** Summary boxes for average level and critical devices.
- **Smart Icons:** Battery icons change dynamically based on percentage.
- **Auto-Coloring:** Values turn Red/Yellow/Green based on level.
- **Hover Effects:** Soft shadows and subtle 3D lift animations.

## 📥 Installation

### Method 1: HACS (Recommended)

The easiest way to install this card is via the **Home Assistant Community Store (HACS)**.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=afri123&repository=battery-modern-card&category=plugin)

1. Click the button above to open the repository in HACS.
2. If the button doesn't work: Open Home Assistant and navigate to **HACS → Frontend**.
3. Click the three dots in the top right corner and select **Custom repositories**.
4. Add the URL of this repository: `https://github.com/afri123/battery-modern-card`
5. Select Category: **Lovelace**.
6. Click **Add**, then find "Battery Modern Card" in the list and click **Download**.
7. When prompted, reload your browser.

### Method 2: Manual

1. Download the `battery-modern-card.js` file from this repository.
2. Copy it into your Home Assistant's `config/www/` directory.
3. Go to **Settings → Dashboards → Three dots (top right) → Resources**.
4. Add a new resource:
   - URL: `/local/battery-modern-card.js`
   - Resource type: `JavaScript Module`

## ⚙️ Configuration
Use the Visual Editor for the best experience.

### Manual YAML Example
```yaml
type: custom:battery-modern-card
title: Haus Batterien
title_icon: mdi:battery-charging
entities:
  - entity: sensor.kueche_thermometer_battery
    name: Küche
  - entity: sensor.wohnzimmer_fenster_battery
    name: Wohnzimmer
````

## 🙏 Credits & Appreciation
This project is a visual redesign that combines the essential functionality of battery monitoring with modern design language.

Special thanks to:

maxwroc/battery-state-card – The fundamental inspiration for advanced battery tracking logic in Home Assistant.

homeassistant-extras/adguard-card – The design blueprint for the aesthetic, minimalist interface and prominent statistic boxes.

## 📄 License

This project is licensed under the **MIT License**.  
Feel free to use, modify, and distribute this card as you see fit.

Copyright (c) 2026 afri123
