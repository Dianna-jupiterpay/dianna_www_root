# encorePOS — Front End

**Version:** 1.3.100.100
**Copyright:** © 2016–2026 posAdvisors, LLC. All Rights Reserved.
**License:** Proprietary — see [posAdvisors.com/license.html](http://www.posAdvisors.com/license.html)

---

## Overview

This repository contains the browser-based front end for **encorePOS**, a point-of-sale platform developed by posAdvisors, LLC. It is a vanilla HTML/CSS/JavaScript application — no build step required — intended to be served from a web server root directory (`www_root`).

---

## Screens

| File | Description |
|---|---|
| `login.html` | Main authentication screen |
| `posLogin.html` | POS-terminal login |
| `pos.html` | Primary sales/POS screen |
| `sales.html` | Sales history and reporting |
| `purchase.html` | Purchase order management |
| `split.html` | Split-payment screen |
| `remLogin.html` | Remote access login |
| `remDash.html` | Remote management dashboard |
| `remMulti.html` | Multi-location remote view |
| `remoteInv.html` | Remote inventory management |
| `upload.html` | File/data upload utility |

---

## Key JavaScript Modules

| File | Purpose |
|---|---|
| `js/pos.js` | Core POS engine |
| `js/posLib.js` | POS utility library |
| `js/tender.js` | Payment tender processing |
| `js/taxMan.js` | Tax calculation engine |
| `js/dash.js` | Dashboard logic |
| `js/sales.js` | Sales screen logic |
| `js/purchase.js` | Purchase order logic |
| `js/lists.js` | Item/customer list management |
| `js/remDash.js` | Remote dashboard logic |
| `js/remMulti.js` | Multi-location logic |
| `js/adcom.js` | Admin/company settings |
| `js/message.js` | Inter-screen messaging |
| `js/utils.js` | Shared utilities |
| `js/poPrint.js` | Purchase order printing |
| `js/ePos2DDL.js` / `js/ePosSet.js` / `js/ePosDict.js` | Epson ePOS receipt printer integration |
| `js/version.js` | Version string (`getVersionNumber()`) |

---

## Third-Party Libraries

| Library | Purpose |
|---|---|
| jQuery 1.12.3 / 3.7.1 | DOM and AJAX |
| jQuery UI 1.12.1 | UI widgets (dialogs, autocomplete, sortable) |
| DataTables | Tabular data display and editing |
| jsGrid | In-line editable grids |
| Moment.js | Date/time formatting |
| Chart.js + datalabels plugin | Sales and reporting charts |
| AutoNumeric | Currency and numeric input formatting |
| vex | Modal dialogs |
| SweetAlert / SweetAlert2 | Notification dialogs |
| Papa Parse | CSV parsing |
| SheetJS (XLSX) | Excel export |
| JSPrintManager | Local printer access from the browser |
| intl-tel-input | International phone number input |
| Mousetrap / Keypress | Keyboard shortcut handling |
| jQuery TouchSwipe / Mobile Events | Touch and swipe support |
| Font Awesome / Material Icons | Icon sets |

---

## Hardware Integrations

- **Epson ePOS** — receipt printer communication via the ePOS SDK (`ePos2DDL.js`, `ePosDict.js`, `ePosSet.js`)
- **PAX payment terminals** — terminal integration files located in the `pax/` directory

---

## Localization

The UI supports **English** and **Spanish** via `js/jquery.translate.js` and language toggle buttons present on the POS screen.

---

## Project Structure

```
www_root/
├── css/               # Stylesheets (per-screen + vendor)
├── js/                # Application JS + vendor libraries
│   └── modules/       # TypeScript-source utility modules
├── images/ / img/     # Application images and icons
├── fonts/ / fontawesome/ / materialicons/
├── DataTables/        # DataTables vendor assets
├── pax/               # PAX terminal integration
├── maps/              # Maps integration assets
├── sounds/            # Audio assets
├── simple-keyboard/   # On-screen keyboard widget
├── pickadate/         # Date/time picker
├── htmlText/          # Templated HTML content
├── *.html             # Application screens (see table above)
└── *.json             # PWA manifests (pos.json, sales.json, purchase.json)
```

---

## Deployment

Copy the contents of this directory to the web server root. No build or compilation step is required. All screens are standalone HTML files that load scripts and stylesheets directly from the directory tree.

Ensure the serving host provides HTTPS, as the ePOS printer SDK and PAX terminal integrations require a secure context in modern browsers.

---

## License

This software is **not free software**. Unauthorized redistribution, in whole or in significant part, is prohibited. See [posAdvisors.com/license.html](http://www.posAdvisors.com/license.html) for full terms.
