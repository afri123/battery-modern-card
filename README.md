# Battery Modern Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/afri123/battery-modern-card?style=for-the-badge)](https://github.com/afri123/battery-modern-card/releases)

A sleek, modern battery monitoring card inspired by the clean aesthetics of AdGuard Card and my previous Proxmox HA Card. Designed as a "set-it-and-forget-it" tool, it features intelligent auto-discovery while offering ultimate customization capabilities.

## ✨ Features

- **🚀 Smart Auto-Discovery:** Automatically scans your system for battery entities via `device_class` or naming conventions.
- **🏷️ Intelligent Badge Priority:** Badges are assigned via a smart priority system:
  1. **Manual Override:** Custom labels set by you in the editor (e.g., "Cellar").
  2. **Auto-Category:** Detected function (e.g., "Window", "Climate", "Smoke").
  3. **Fallback:** "Sonstiges" (Other).
- **👆 Native Entity Navigation:** Click on any battery name in the list to instantly open its native Home Assistant "More-Info" dialog.
- **🎨 Visual Accordion Editor:** Fully manage your card via the UI. No YAML knowledge required! Includes dedicated sections for layout, styling, overrides, and filtering.
- **🛠️ Manual Include & Exclude:** Easily hide false positives (exclude) or manually add missing special entities.
- **🔋 Battery Notes Filter:** Built-in toggle to automatically hide `battery+` duplicate entities created by the popular "Battery Notes" integration.
- **👁️ Focus Mode:** Automatically hides healthy batteries (>40%) in a collapsible accordion, keeping your dashboard clean and actionable.
- **💅 Ultimate Styling Control:** Complete CSS variable support. Customize colors, font sizes, borders, backgrounds, and shadows for the Header, Normal Stats, **Critical Warning Box**, and Individual Rows.
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

### Manual YAML Example (For Power Users)
Every setting available in the Visual Editor can also be set via YAML:

```yaml
type: custom:battery-modern-card
title: Haus Batterien
title_icon: mdi:battery-check
filter_battery_plus: true

# Styling
stat_shadow: "0 10px 20px rgba(0,0,0,0.1)"
stat_warn_bg: "rgba(244,67,54,0.1)"
stat_warn_border: "1px solid #f44336"
name_color: "var(--primary-color)"
value_size: "1.2rem"

# Entities & Badges
exclude:
  - sensor.ipad_battery_level
manual_entities:
  - sensor.special_device_battery
custom_badges:
  sensor.kueche_fenster_battery: "Küchenfenster"
  sensor.special_device_battery: "Keller"
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
