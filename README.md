# Battery Modern Card for Home Assistant

A sleek, modern battery monitoring card inspired by the clean aesthetics of AdGuard Card and my previous Proxmox HA Card. 

## ✨ Features
- **Visual Editor:** Full UI configuration with Accordion menus.
- **Header Styling:** Custom icons and font settings for the title.
- **Top Stats:** Summary boxes for average level and critical devices.
- **Smart Icons:** Battery icons change dynamically based on percentage.
- **Auto-Coloring:** Values turn Red/Yellow/Green based on level.
- **Hover Effects:** Soft shadows and subtle 3D lift animations.

## 📥 Installation

1. Upload `battery-modern-card.js` to your `config/www/` folder.
2. Go to **Settings -> Dashboards -> Resources**.
3. Add a new resource with URL: `/local/battery-modern-card.js` and Type: `JavaScript Module`.
4. Refresh your browser.

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
