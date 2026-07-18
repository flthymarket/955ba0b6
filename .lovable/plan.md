## The Rebuild Plan

This is a big one. Below is exactly what I'll build, in the order I'll build it, so nothing gets missed and we don't burn credits on the wrong direction.

### 1. Visual restyle (inspiration: Supreme structure + Justin Reed restraint + Save The Chrome logo animation)

- **Typography.** Replace Poppins entirely. New pairing: **Neue Haas Grotesk Display** substitute (`Space Grotesk` from Google Fonts, weight 700 for headings) + **`IBM Plex Mono`** for labels, prices, meta. Body: `Inter Tight` 400. None of these read as "AI default template."
- **Palette.** Stays monochrome (paper white `#f5f3ee`, ink `#0d0d0d`), red `#B11226` reserved for sale/timer only. Adds a "kill" black bar accent at section breaks (Supreme move).
- **Homepage layout.**
  - Top: continuous horizontal FLTHYMRKT logo marquee that never stops (Save The Chrome effect) — CSS-only infinite scroll, no JS jank.
  - Hero: single oversized product/editorial image, tight caption underneath.
  - Announcement ticker strip (marquee): scrolling text (drops, shipping notice, offers) — admin editable.
  - **Category collection grid**: 4 large tiles (Tops / Bottoms / Accessories / New Arrivals) with cover images, Supreme-style hover invert.
  - New Arrivals row: 4 items, uniform cards.
- **Global animations.** Only opacity fades + 120ms transforms. No spring, no bounce. Logo marquee is the only always-on motion.
- **Remove**: About page, coupon/newsletter popup (moves to footer only).
- **Footer** gets three columns: Customer Care, Newsletter signup, Help & Policies (Shipping / Returns / Privacy / Terms).

### 2. Product cards — the image problem, solved permanently

- Every card uses a **fixed 4:5 letterbox frame** with `object-contain`, ink background inside the frame. Never crops tops/bottoms again.
- Same frame used on collection grid, homepage, related products, cart, admin — one component, one source of truth.
- **Quick Add button** appears on hover at bottom of card. If the product has size variants, hover reveals size chips; click adds to cart instantly. If single variant + in stock, one click adds.
- Sold-out cards get a diagonal "SOLD" stamp instead of the button.

### 3. Filters (Collection pages)

Left rail, collapsible sections, all auto-detected from live products:
- **Sub-type** (Tops → Short Sleeve / Long Sleeve / Hoodie / Sweater / Vest; Bottoms → Pants / Shorts / Sweatpants / Jeans)
- **Designer** (brand list)
- **Color** (auto-detected)
- **Size**
- **Availability** — checkboxes for "On Sale" and "Sold" (sold shown but not purchasable)
- **Price range**

Sort: Newest / Price ↑ / Price ↓ / Brand A–Z.

### 4. Checkout: move OFF Shopify → Lovable Cloud + Stripe + Crypto

This is the big architectural shift. Shopify gets disconnected as the checkout path. Products, inventory, orders, and payment all live in your project.

- **Products stored in Lovable Cloud** (your `products` / `product_variants` / `product_images` tables already exist — I'll extend them). One-time migration will pull your existing Shopify products in so you don't lose them.
- **Card payments: Stripe** via Lovable's built-in payments (no key needed, no Stripe account setup — Lovable handles it).
- **Crypto payments: NOWPayments** — the only mainstream processor that supports **BTC + ETH + SOL** together with automatic on-chain verification. Coinbase Commerce dropped Solana, which is why it's not the pick. NOWPayments provides:
  - Hosted checkout for BTC / ETH / SOL
  - Webhook confirmations (order marks paid only after N confirmations)
  - Auto-conversion to USD/USDT if you want (optional)
  - You'll need a NOWPayments account (free) and I'll request the API key + IPN secret when we reach that step.

Checkout page will show two tabs: **Card (Stripe)** and **Crypto (BTC / ETH / SOL)**.

### 5. Admin product manager (mirrors Shopify's product editor)

Rebuilt from scratch, everything lives in Lovable Cloud:
- **Product form fields**: title, description (rich text), vendor/designer, product type, tags, status (active/draft/archived), SEO title/description.
- **Media**: drag-and-drop multi-image upload → Lovable Storage. Each image has:
  - **Fit mode**: `contain` (letterbox, default) / `cover` / `free aspect`
  - **Zoom slider** (1×–2×) and offset controls
  - Preview showing exactly how it will appear on the card
- **Pricing**: price, compare-at price (for strikethrough), cost.
- **Inventory**: **quantity field** — required. When qty hits 0, product auto-marks Sold Out; a **"Notify me when back" / "Make an offer" toggle** appears on the storefront card.
- **Variants**: size / color grid with per-variant qty and SKU.
- **Categories**: category + sub-type dropdown that feeds the new filter.
- **Bulk actions**: mark on sale, archive, delete.

### 6. Order management

New admin **Orders** page: list, status (pending / paid / shipped / refunded), payment method (Stripe / BTC / ETH / SOL), tx hash for crypto, shipping address, ability to mark shipped + add tracking.

---

### Order I'll execute in

1. Visual rebuild + fonts + letterbox card + marquee + category grid + footer + kill coupon popup + kill About  ← **first PR, biggest visual payoff**
2. New filter system (sub-type, availability, sale, sold)
3. Admin product manager rebuild (image fit controls, quantity, variants)
4. Enable Stripe payments + build checkout page
5. Wire NOWPayments crypto checkout (I'll request the API key when we get here)
6. One-time Shopify → Lovable Cloud product import, then disconnect Shopify checkout redirects

---

### Technical notes (skip if not interested)

- Payments: Lovable built-in Stripe (`enable_stripe_payments`) — no BYOK, no Stripe dashboard for you to configure. Full tax compliance handling on eligible products.
- Crypto: NOWPayments REST API + IPN webhook edge function. Verifies HMAC signature on every callback before marking `orders.status = 'paid'`.
- Image fit stored as `product_images.fit_mode` + `zoom` + `offset_x/y` columns; card component reads them.
- Inventory decrement handled server-side in a Postgres function on order completion to prevent overselling.
- Logo marquee: single CSS `@keyframes` translateX, GPU-composited, zero JS.

---

### One thing I need from you before I start

**NOWPayments** is the crypto processor I'm recommending because it's the only one that supports BTC + ETH + SOL together with on-chain verification. Signup is free at nowpayments.io. Are you good with that pick, or do you want me to research alternatives (e.g. running BTCPay Server yourself, or dropping Solana to use Coinbase Commerce)?

Approve this plan and I'll start with step 1 (the visual rebuild).