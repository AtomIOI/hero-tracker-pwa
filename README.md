# Hero Tracker PWA

Progressive Web App version of Hero Tracker with vintage comic book aesthetic.

## Purpose

The Hero Tracker PWA is a digital companion for Sentinels Comics RPG players. It allows users to manage their hero's stats, health, powers, qualities, and abilities in a visually engaging interface that mimics the look and feel of a classic comic book. It features a fully functional dice roller, offline support, and installability as a PWA.

## Setup

1. **Install Dependencies**
   - No build process required.
   - Uses Vue.js 3 from CDN.
   - Python 3 is required for local verification scripts.

2. **Serve Locally**
   You can use any static file server to run the application.

   ```bash
   # Python
   python -m http.server 3000
   
   # Node.js
   npx http-server -p 3000
   ```

3. **Access**
   - Desktop: `http://localhost:3000`
   - Mobile (same network): `http://[your-ip]:3000`

## Usage

### Main Navigation
- **Home**: View hero status, health, and principles.
- **Powers**: Manage Powers and Qualities traits.
- **Abilities**: View and manage Action/Reaction/Inherent abilities.
- **Dice**: Roll dice with a physics-like tray, apply modifiers, and see results.
- **Settings**: Backup/Restore data, upload profile image.

### Features

- **Character Management**: Track health with a color-coded gyro (Green/Yellow/Red zones), manage Hero Points, and edit character details.
- **Dice Roller**: Select d4-d12 dice, roll them, and automatically see Min/Mid/Max results. Supports applying modifiers to the Mid die.
- **Abilities**: Create and edit abilities linked to specific Powers or Qualities. Automatically filters availability based on current Health Zone.
- **Offline Support**: The app works fully offline thanks to a Service Worker caching strategy.
- **Installable**: Can be installed to the home screen on iOS and Android devices.

## Project Structure

```
hero-tracker-pwa/
├── index.html          # Main HTML entry point
├── manifest.json       # PWA manifest configuration
├── sw.js               # Service Worker for offline caching
├── css/
│   ├── variables.css   # Global CSS variables
│   ├── base.css        # Reset and base styles
│   ├── comic-theme.css # Core comic book visual theme
│   ├── mobile.css      # Mobile-specific layout overrides
│   ├── desktop.css     # Desktop-specific layout overrides
│   └── ...             # Component-specific styles
├── js/
│   ├── app.js          # Main Vue application instance
│   ├── storage.js      # LocalStorage utility module
│   ├── pwa.js          # PWA management class
│   ├── ability-icons.js# SVG icon definitions
│   └── components/     # Vue components
│       ├── AbilityCard.js          # Component for individual abilities
│       ├── AddEditAbilityModal.js  # Modal for editing abilities
│       ├── AddEditTraitModal.js    # Modal for editing traits
│       ├── DicePage.js             # Dice roller page component
│       └── PowersQualitiesPage.js  # Powers/Qualities page component
└── assets/
    ├── icons/          # Application icons
    ├── dice/           # Dice images
    └── textures/       # Background textures
```

## Documentation

The codebase is fully documented with JSDoc comments.
- **Core Logic**: `js/app.js` contains the central state and methods.
- **Components**: UI components are modularized in `js/components/`.
- **Utilities**: Helper functions found in `js/storage.js` and `js/pwa.js`.

## Verification

Python scripts are provided for verification using Playwright:
- `verify_dice.py`: Tests the dice rolling functionality.
- `verify_fix.py`: Verifies specific bug fixes in the UI.

To run verification:
```bash
pip install playwright
playwright install chromium
python verify_dice.py
```
