# Rosé Nails Studio

Rosé Nails Studio is a luxury landing page and appointment booking experience designed for a high-end nail salon. It combines fluid scroll-driven storytelling, bespoke micro-interactions, and a responsive appointment reservation workflow crafted around an elegant blush and rose visual identity.

<!-- Screen capture placeholder: docs/screenshots/hero.png -->
<!-- ![Rosé Nails Studio Preview](docs/screenshots/hero.png) -->

---

## Features

- **Liquid Page Intro**: A pearl load screen displaying the studio emblem that wipes away via an organic SVG clip-path transition upon entry.
- **Hero Section with Alpha-Keyed Video**: A WebGL-powered canvas player that strips out video backgrounds in real time to blend floating nail polish bottles directly over ambient parallax blobs and bubbles.
- **Interactive Work Gallery**: An Embla Carousel with 3D perspective scaling, opacity interpolation, drag/swipe gestures, arrow controls, and keyboard navigation (`ArrowLeft` / `ArrowRight`).
- **3D Card Stack Reviews**: A stacked testimonial deck with fanned-out physics, drag-to-dismiss capabilities, auto-advancing timer with hover pause, star ratings, and client photo previews.
- **Bespoke Services Grid**: Equal-dimension service cards featuring custom monochromatic line-art vector icons, subtle rose glow borders, and hover elevations.
- **Scroll-Linked "How It Works" Timeline**: A 3-step sequence connected by a dynamically drawn SVG gradient path, counting numbers (`00` $\rightarrow$ `01`), spring-bounced milestone icons, and alternating card reveals.
- **Interactive Booking Form**:
  - Floating field labels with rose glow focus rings and expanding underline indicators.
  - Custom-styled dropdown selector for salon services.
  - Staggered appointment time-slot selection chips.
  - Required international phone number field with placeholder formatting.
  - Magnetic submit button with shine sweep that morphs into an animated checkmark and triggers a radial 16-particle sparkle burst upon submission.
  - Non-intrusive confirmation toast notification.
- **Curved Liquid Section Dividers**: Scroll-reactive SVG wave transitions that organically shift and bridge alternating pearl (`#FFF8FA`) and blush (`#FDF0F5`) section backgrounds.
- **Pre-Footer CTA & Rich Footer**: Studio contact details, Beverly Hills address, opening hours table, newsletter subscription input, social icons with spring bounce hover states, and a giant full-width gradient wordmark.
- **Luxury Custom Cursor**: Desktop-only custom cursor with a central rose pip and an eased trailing blurred ring that expands over interactive elements.
- **Top Scroll Progress Bar**: A persistent slim gradient indicator tracking reading progress.
- **Accessibility & Performance**:
  - Full `prefers-reduced-motion` compliance across all components, falling back to clean opacity fades.
  - Multi-layer animation safety nets that prevent clipped or invisible text if scroll triggers lag.
  - Hardware-accelerated transitions restricted to `transform` and `opacity`.
- **Fully Responsive**: Tailored layouts and touch gesture support spanning mobile, tablet, and desktop viewports.

---

## Tech Stack

| Category | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | `16.4.6` | App Router, Server Components & Turbopack bundler |
| **Runtime / Library** | React | `19.3.0` | Modern UI runtime with React DOM |
| **Styling** | Tailwind CSS | `4.3.3` | Utility-first CSS-first styling engine with `@theme` |
| **Animation Engine** | Framer Motion | `14.14.0` | Component transitions, spring physics & scroll hooks |
| **Scroll Animation** | GSAP & ScrollTrigger | `3.15.1` | ScrollTrigger integration & ticker frame coordination |
| **Smooth Scrolling** | Lenis | `1.3.27` | Momentum-based viewport smooth scroll engine |
| **Carousel** | Embla Carousel | `8.6.0` | Touch-enabled carousel engine (`embla-carousel-react`) |
| **Icons** | Lucide React | `1.77.0` | Feather-based lightweight vector icons |
| **Class Utilities** | clsx & tailwind-merge | `^2.1.1` / `^3.7.1` | Conflict-free conditional CSS class merging |
| **Language** | TypeScript | `^5.0.0` | Strict static typing across all components and constants |

---

## Getting Started

### Prerequisites

- Node.js `18.18+` or `20+`
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

To generate an optimized production bundle:

```bash
npm run build
npm run start
```

---

## Adding Media

The application expects static assets to be located in the `public/` directory.

| Media Type | Expected Path | Format | Fallback Behavior When File Is Missing |
| :--- | :--- | :--- | :--- |
| **Studio Logo** | `public/imag/logo/logo.png`<br>`public/images/logo/logo.png` | PNG, JPG, or SVG | Displays the text brand name `"Rosé Nails Studio"` |
| **Hero Animation Video** | `public/videos/hero.mp4` | MP4 (H.264 / AAC) | WebGL canvas falls back silently; hero layout remains intact |
| **Gallery Work Photos** | `public/images/work/work-1.jpg`<br>through `work-9.jpg` | JPG / WebP | Renders individual pastel gradient cards with design titles |
| **Client Review Avatars** | `public/images/reviews/nails-1.jpg`<br>through `nails-5.jpg` | JPG / WebP | Displays a circular gradient badge with client initials |

---

## Customization

### Content & Configuration
- **Studio Details & Testimonials** (`lib/constants.ts`):
  - `SITE_NAME`: Brand name displayed across navigation and footer.
  - `STUDIO_CONTACT`: Physical address, phone number, email address, opening hours, and Google Maps query link.
  - `HERO_QUOTES`: Rotating inspirational quotes for the hero section.
  - `WORK_ITEMS`: Gallery entries, titles, image paths, and placeholder gradient styles.
  - `REVIEWS`: Client names, initials, review copy, ratings, and image links.

### Services & Timeline Steps
- **Service Menu** (`components/sections/Services.tsx`): Titles, descriptions, and icon mappings for salon services.
- **Process Steps** (`components/sections/HowItWorks.tsx`): 3-step sequence items, badges, titles, and step descriptions.

### Design Tokens, Colors & Fonts
- **Theme Colors & Global Styles** (`app/globals.css`):
  Defined inside `@theme`:
  - `--color-pearl`: `#FFF8FA` (primary light canvas)
  - `--color-blush`: `#F9C6D4` (soft accent blush)
  - `--color-rose`: `#E88AA6` (mid-tone rose)
  - `--color-deep-rose`: `#B84A6E` (primary brand accent)
  - `--color-plum`: `#3A1F2B` (deep typography foreground)
- **Typography** (`app/layout.tsx`):
  Loaded via `next/font/google`:
  - Heading font: **Cormorant Garamond** (`var(--font-cormorant)`)
  - Body font: **Poppins** (`var(--font-poppins)`)

---

## Project Structure

```text
├── app/
│   ├── globals.css              # Design tokens, custom scrollbar & theme utilities
│   ├── layout.tsx               # Root layout, Google fonts & HTML metadata
│   └── page.tsx                 # Landing page composing all sections & dividers
├── components/
│   ├── providers/
│   │   └── SmoothScrollProvider.tsx # Lenis + GSAP ticker coordination & safety nets
│   ├── sections/
│   │   ├── Navbar.tsx           # Sticky navigation with mobile menu drawer
│   │   ├── Hero.tsx             # Hero with WebGL transparent video keyer & blobs
│   │   ├── Gallery.tsx          # Carousel showcasing nail sets with 3D scaling
│   │   ├── Reviews.tsx          # Stacked testimonial deck with swipe physics
│   │   ├── Services.tsx         # Service cards grid with custom vector icons
│   │   ├── ServiceIcons.tsx     # Monochromatic SVG service icon definitions
│   │   ├── HowItWorks.tsx       # Animated 3-step timeline with dynamic SVG line
│   │   ├── BookingForm.tsx      # Reservation form with magnetic button & particles
│   │   └── Footer.tsx           # Pre-footer CTA, hours, contact & large wordmark
│   └── ui/
│       ├── animations/
│       │   ├── Parallax.tsx     # Scroll-linked parallax offset container
│       │   ├── Reveal.tsx       # Blur-to-sharp fade reveal component
│       │   └── SplitText.tsx    # Word/char staggered masked text reveal
│       ├── CustomCursor.tsx     # Desktop lagging fluid glow ring cursor
│       ├── LiquidDivider.tsx    # Wavy SVG divider transitioning section colors
│       ├── MagneticButton.tsx   # Proximity cursor attraction wrapper
│       ├── PageIntro.tsx        # Liquid load screen entrance animation
│       └── ScrollProgressBar.tsx# Top fixed reading progress indicator
├── lib/
│   ├── constants.ts             # Content items, gallery data & business info
│   ├── scroll.ts                # Smooth scroll helper with Lenis fallback
│   └── utils.ts                 # Class merger utility (clsx + twMerge)
├── public/
│   ├── imag/logo/               # Brand logo assets
│   ├── images/
│   │   ├── reviews/             # Client review photo samples
│   │   └── work/                # Portfolio nail gallery photos
│   └── videos/
│       └── hero.mp4             # High-resolution hero animation video
├── package.json
└── tsconfig.json
```

---

## Roadmap

- [x] Responsive landing page layout with full typography and color system
- [x] Transparent WebGL video rendering without black background or grid artefacts
- [x] Interactive portfolio carousel with drag and keyboard controls
- [x] Testimonial card deck with auto-advance and drag physics
- [x] Scroll-driven drawing SVG timeline for booking steps
- [x] Client-side appointment reservation form with validation and particle burst confirmation
- [x] Lenis smooth scrolling synchronized with GSAP ScrollTrigger
- [x] Full `prefers-reduced-motion` fallbacks across all animation primitives
- [ ] Backend API route integration to persist reservation requests to a database
- [ ] Automated email/SMS appointment confirmations via webhook
- [ ] Live studio calendar availability synchronization (e.g. Google Calendar / Calendly)
- [ ] Online payment deposit gateway integration (e.g. Stripe)

---

## License

This project is licensed under the [MIT License](LICENSE).
