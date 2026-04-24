# 1885NY POS Ordering UI Kit

## Overview
An interactive Point-of-Sale / online ordering prototype for 1885NY Smash Burgers.
Reflects the existing brand (dark header, tomato red CTAs, warm food photography).

## Source
- Marketing website: `ramesh-chikkam/1885NY-Smash-Burgers`
- Flutter ordering app: `kognivera-org/flutter_ecom_multiplatform`
- POS Python app: `phanishankar-munukutla/1885ny-pos-python` (⚠️ not accessible)

## Screens
1. **Menu / Home** — Burger grid with Add to Cart
2. **Cart Sidebar** — Live cart with qty controls and subtotal
3. **Checkout** — Customer details + order summary
4. **Order Confirmation** — Success screen

## Components
- `Header.jsx` — Brand header with cart badge
- `MenuCard.jsx` — Menu item card
- `Cart.jsx` — Cart sidebar panel
- `OrderConfirm.jsx` — Confirmation modal

## Notes
- Prices in INR (₹) per source data
- Flutter app uses Riverpod; this kit uses React state (cosmetic prototype only)
- POS Python backend data/flows are unknown — checkout is mocked
