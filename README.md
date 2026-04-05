# Battery Modern Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

A sleek, modern battery monitoring card inspired by the clean aesthetics of AdGuard Card and my previous Proxmox HA Card. Designed as a "set-it-and-forget-it" tool, it features intelligent auto-discovery while offering ultimate customization capabilities.

## ✨ Features

- **🚀 Smart Auto-Discovery:** Automatically scans your entire system for battery entities via `device_class` or naming conventions.
- **👆 Native Entity Navigation:** Click on any battery name in the list to instantly open its native Home Assistant "More-Info" dialog.
- **🏷️ Intelligent Categorization:** Automatically assigns badges to batteries based on their function (e.g., Windows, Climate, Presence, Smoke, Water).
- **🎨 Visual Accordion Editor:** Fully manage your card via the UI. No YAML knowledge required! Includes dedicated sections for layout, styling, and filtering.
- **🛠️ Manual Include & Exclude:** Easily hide false positives (exclude) or manually add missing special entities with custom badges (e.g., "Cellar", "Guest Room").
- **🔋 Battery Notes Filter:** Built-in toggle to automatically hide `battery+` duplicate entities created by the popular "Battery Notes" integration.
- **👁️ Focus Mode:** Automatically hides healthy batteries (>40%) in a collapsible section, keeping your dashboard clean and actionable.
- **💅 Ultimate Styling Control:** Customize colors and font sizes for every single text element (Titles, Stats, Names, Values) and tweak CSS shadows and borders to match your theme perfectly.
- **📊 Real-time Stats:** Glanceable overview of total battery count and critical devices needing attention.

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

The card is designed to work out-of-the-box. Just add it to your dashboard. If you want to customize it, use the **Visual Editor**.

### Category Logic (Automatic)
The card detects the following categories automatically based on entity IDs and friendly names:
- **Presence:** Occupancy/Presence sensors.
- **Window/Door:** Contact sensors.
- **Climate:** Temperature/Humidity sensors.
- **Locks:** Smart locks.
- **Smoke:** Smoke detectors.
- **Water:** Leak/Water sensors.

### Manual YAML Example
```yaml
type: custom:battery-modern-card
title: Haus Batterien
title_icon: mdi:battery-check
filter_battery_plus: true
stat_shadow: "0 10px 20px rgba(0,0,0,0.1)"
name_color: "var(--primary-color)"
value_size: "1.2rem"
exclude:
  - sensor.ipad_battery_level
manual_entities:
  - entity: sensor.special_device_battery
    badge: "Custom Label"
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
