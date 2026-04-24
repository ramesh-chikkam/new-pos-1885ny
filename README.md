# 1885NY Smash Burgers — Design System

## Overview

**1885NY Smash Burgers** is a New York-inspired smash burger restaurant currently operating out of Hyderabad, India (UNOS Food Market, Gachibowli). The brand is bold, fun, and high-energy — rooted in the gritty street-food energy of New York diners, with a modern fast-casual spin.

## Sources

| Source | Repo / URL | Notes |
|--------|-----------|-------|
| Marketing Website | `ramesh-chikkam/1885NY-Smash-Burgers` (GitHub) | HTML/CSS website with logo, hero, menu |
| POS System | Built from scratch in this design system | Full React POS — orders, reports, staff, inventory |
| Flutter E-Commerce App | `kognivera-org/flutter_ecom_multiplatform` (GitHub) | Multi-platform Flutter ordering app (Riverpod, Material Design) |

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Direct and punchy.** Short sentences. No fluff. "Delicious, Chef-Driven, Smash Burgers!" — not "We are proud to offer…"
- **First person we, second person you.** "We bring you the finest chef-driven smash burgers." Conversational, not corporate.
- **Bold claims, confidently stated.** "The true taste of New York." No hedging.
- **Warm but not over-the-top.** Friendly enthusiasm without exclamation points on every line.
- **Casing:** Title Case for section headers and nav. Sentence case for body copy. ALL CAPS used for strong calls-to-action and logo type only.

### Emoji
Not used in product copy or UI. The brand energy comes from imagery and typography, not emoji.

### Copywriting patterns
- Menu items: Name → one punchy descriptor line → price in local currency (INR)
- CTA buttons: Action verbs — "Order Now", "View Menu", "Find Us"
- Taglines: Format "X, Y, Z!" (comma-separated triad) e.g. "Delicious, Chef-Driven, Smash Burgers!"

---

## VISUAL FOUNDATIONS

### Colors
- **Primary / Accent:** Tomato red `#ff6347` — high-energy CTA buttons, hovers, highlights
- **Primary Dark:** `#ff4500` (OrangeRed) — pressed/hover state of primary
- **Dark / Background (header, footer):** Charcoal `#333333`
- **Near-Black:** `#1a1a1a` — body text
- **Page Background:** Warm light gray `#f4f4f4`
- **Surface:** Pure white `#ffffff` — cards, menu items
- **Gold:** `#c9921a` — logo star accent; use sparingly for premium feel
- **Maroon:** `#5c1a2a` — deep brand dark from logo outline; use for dark mode hero overlays

### Typography
- **Display / Headlines:** Anton — bold, condensed, sign-painter energy that matches the logo's heavy letterforms. Official brand display face.
- **Body:** DM Sans — clean, modern, highly legible at all sizes. Official brand body face.
- **Mono / Prices:** DM Mono — used for prices, order IDs, and all POS numeric data.

### Backgrounds
- Section alternation: white ↔ `#f4f4f4`
- Hero: full-bleed photography with dark overlay (`rgba(0,0,0,0.4)` using `background-blend-mode: darken`)
- Food photography is warm, moody, close-up. Dark wood surfaces, soft bokeh, golden light.
- The fries-box illustration in hero image hints at a playful illustrated sub-brand for packaging (orange + white line-art, heart motifs)

### Imagery
- **Food photography:** Warm/amber tones, dark backgrounds, shallow depth-of-field. Always appetizing and close-up.
- **No stock-generic imagery.** Real product shots.
- **No grain/texture filters.** Clean, saturated.

### Spacing & Layout
- Section padding: `50px` top/bottom
- Card width: `300px` with `20px` margin
- Header: flex row, space-between
- Max content width: ~`800px` for body text blocks

### Cards
- Background: `#fafafa`
- Border radius: `10px`
- Shadow: `0 4px 6px rgba(0,0,0,0.10)`
- Padding: `20px`
- Images: full-width, same `10px` radius

### Buttons
- Primary: `#ff6347` background, white text, `5px` radius, `15px 30px` padding
- Hover: `#ff4500` (darken)
- No outline/ghost variant defined yet

### Animations & Interactions
- Hover states: color darken on links (`#ff6347`), darken on buttons (`#ff4500`)
- No defined transitions/easing in source — keep snappy (120–200ms ease-out)
- No entrance animations or page transitions defined
- Custom cursor: burger icon PNG used as cursor on hero — playful brand touch

### Corner Radii
- Buttons: `5px`
- Cards / images: `10px`
- Form inputs: `5px`

### Shadows
- Cards: `0 4px 6px rgba(0,0,0,.10)` — subtle lift
- No inner shadows defined

### Borders
- Form inputs: `1px solid #ddd`
- No decorative borders on sections

### Icons & Social
- Social icons: PNG (Facebook, Instagram, Twitter) — 30px, brightness filter on hover
- No icon font or SVG sprite defined in source

### Nav
- Inline list, dark background header
- Links: white → tomato red on hover
- Bold weight

---

## ICONOGRAPHY

The website uses PNG social icons (not in the repo — referenced but missing: `facebook-icon.png`, `instagram-icon.png`, `twitter-icon.png`). No icon font or SVG system is defined. The burger-icon.png serves as a custom cursor.

**Recommendation:** Adopt [Lucide Icons](https://lucide.dev) (thin stroke, clean, neutral) for UI chrome (cart, nav, arrows). The brand's bold personality lives in photography and typography, not decorative iconography.

Available icon assets copied to `assets/`:
- `assets/logo.png` — primary brand logo (fist + burger + "1885NY SMASH BURGERS" wordmark)
- `assets/burger-icon.png` — isolated cartoon burger, used as custom cursor; repurposable as favicon/app icon
- `assets/hero-burger.jpg` — hero food photography
- `assets/burger1.jpg` — Classic Smash Burger product shot
- `assets/burger2.jpg` — Cheesy Lamb Smash product shot
- `assets/burger3.jpg` — Spicy Smash product shot

---

## FILE INDEX

```
README.md                        ← This file
colors_and_type.css              ← All CSS design tokens + semantic type styles
SKILL.md                         ← Agent skill descriptor
assets/
  logo.png                       ← Primary brand logo
  burger-icon.png                ← Cartoon burger mark / cursor
  hero-burger.jpg                ← Hero food photography
  burger1.jpg / burger2.jpg / burger3.jpg  ← Menu item photography
preview/
  colors-primary.html            ← Brand red palette card
  colors-neutrals.html           ← Dark/neutral palette card
  colors-semantic.html           ← Semantic token reference
  type-display.html              ← Anton display type specimens
  type-body.html                 ← DM Sans body type specimens
  type-scale.html                ← Full type scale
  spacing-tokens.html            ← Space / radius / shadow tokens
  components-buttons.html        ← Button states
  components-cards.html          ← Menu card component
  components-nav.html            ← Header / nav bar
  components-forms.html          ← Form inputs
  brand-logo.html                ← Logo usage
  brand-imagery.html             ← Photography style
ui_kits/
  pos-ordering/
    README.md                    ← POS ordering UI kit notes
    index.html                   ← Full POS ordering prototype
    Header.jsx                   ← Brand header component
    MenuCard.jsx                 ← Menu item card
    Cart.jsx                     ← Cart sidebar
    OrderConfirm.jsx             ← Order confirmation modal
```

---

## Products

| Product | Description |
|---------|-------------|
| Marketing Website | Static HTML/CSS site with menu, hero, locations, contact |
| POS Ordering App | Python-based POS (source not accessible); Flutter app is the multi-platform ordering frontend |
| Flutter E-Commerce | Multi-platform ordering app using Riverpod + Material Design |
