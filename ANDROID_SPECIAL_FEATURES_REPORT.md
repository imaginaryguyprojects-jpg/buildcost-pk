# Android Special Productivity Features Report — BuildCost PK v3.0.0

---

## 1. Recent & Favorite Calculations

- **Dual-Layer Persistence**:
  - Saved locally in IndexedDB/localStorage for instant offline retrieval.
  - Automatically synced to Supabase table `saved_estimates` when authenticated.
- **Quick Recalculate**:
  - Users can select any previous calculation and recalculate with 1 click.
  - Modifiable parameters: City, Plot Size, Covered Area, Floors, Construction Package, Wall Height, Bathrooms, Foundation, Columns, Beams, and Material Rates.
- **Save to My Account**:
  - Unclaimed calculations performed by guests before logging in are preserved in temporary memory.
  - Upon logging in or signing up, a prompt allows users to claim and sync them to their permanent cloud account.

---

## 2. Architectural Floor Plans (Free & Pro Tiers)

- **Free Tier**: Includes 1 complete high-efficiency design:
  - *5 Marla (25×50 ft) Modern 3BHK*: Includes car porch, drawing room, TV lounge, kitchen, master bedroom with attached bath, second bedroom with common bath, and rear utility yard.
- **Pro Tier**: Unlocks 3+ premium layouts:
  - *7 Marla (30×60 ft) Luxury 4BHK*: Multi-story with dual master suites and terrace garden.
  - *10 Marla (35×70 ft) Executive 5BHK Villa*: Dedicated servant quarter, open atrium, and double-height lounge.
  - *1 Kanal (50×90 ft) Contemporary Mansion*: 3-car parking portico, swimming pool patio, and maid suite.
- **Blueprint Vector SVG**: Embedded scalable vector blueprints displaying room dimensions, wall partitions, and circulation flow.

---

## 3. Professional PDF Export & Sharing

- Official printable and shareable contractor reports.
- Includes:
  - Branded BuildCost.pk header with verification metadata
  - City benchmark rates & material quantity itemization (cement bags, steel tons, bricks, sand, crush, labour)
  - Structural specifications (wall heights, foundation type, column count)
  - Legal disclaimer, wastage allowance, and contractor notes
  - Direct sharing to WhatsApp and mobile share sheets

---

## 4. Diagnostics & Support Center

- **Report a Problem**: Users can file bug reports and calculation discrepancies with automated safe device context (OS, app version, screen resolution, connectivity). Passwords and tokens are strictly excluded.
- **What's New in v3.0.0**: In-app modal highlighting all major updates, architectural layouts, and AdMob integration.
- **In-App Rate Refresh**: Manual one-tap synchronization button with dynamic status feedback.
