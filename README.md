# Rosé Nails Studio

Rosé Nails Studio is a luxury landing page and appointment booking platform crafted for a high-end nail salon. It combines fluid scroll-driven storytelling, bespoke micro-interactions, an interactive client reservation workflow, and a full-featured admin management dashboard built with Next.js App Router, Tailwind CSS, and Supabase.

---

## Live Demo

Experience the live application:
**[https://rose-nails-studio-nine.vercel.app](https://rose-nails-studio-nine.vercel.app)**

---

## Admin Dashboard

The administrative dashboard is intentionally **not linked from the public website**. It is accessible exclusively via the direct administrative route:

- **Live URL**: `https://rose-nails-studio-nine.vercel.app/admin/login`
- **Local URL**: `http://localhost:3000/admin/login`

> [!IMPORTANT]
> **Administrative Credentials Notice**:
> Administrative credentials are **not public**. Admin accounts are provisioned manually in your private Supabase project dashboard (**Authentication** $\rightarrow$ **Users** $\rightarrow$ **Add user**), with public user sign-ups disabled to restrict access strictly to authorized studio staff.

---

## Features

### Public Studio Experience
- **Liquid Intro Screen**: Server-rendered pearl splash screen with an animated emblem, progress indicator, and a fluid curtain lift synchronized with site readiness and hero video buffering.
- **Hero Video Showcase**: Architectural arched frame video showcase with synchronized curtain-lift playback, play-once freeze on final frame, and viewport-aware replay via IntersectionObserver.
- **Interactive Work Gallery**: 3D perspective Embla Carousel with drag/swipe gesture support, arrow controls, and keyboard navigation (`ArrowLeft` / `ArrowRight`).
- **3D Card Stack Client Reviews**: Interactive testimonial deck featuring fanned card physics, drag-to-dismiss capabilities, client avatars, and star ratings.
- **Bespoke Services Menu**: Dynamic catalog of studio services with duration indicators, real-time prices formatted in local currency, and vector iconography.
- **Scroll-Linked "How It Works" Timeline**: A 3-step sequence connected by a dynamically drawn SVG gradient path, counting numbers, and alternating card reveals.
- **Appointment Booking Engine**:
  - Validated reservation form with name, phone number, service selection, date picker, and time slot chips.
  - Server-side rate limiting (in-memory IP tracking) and honeypot anti-spam protection.
  - Verification of service availability and price lookups directly from the database (never trusting client-supplied prices).
  - Magnetic submit button with particle burst confirmation.
- **Studio Atelier & Directions**: Opening hours, address, direct Google Maps directions link, and responsive multi-column footer.
- **Theme Switcher**: Class-based light (`#FFF8FA`) and dark (`#1A0F15`) mode toggle with persistent storage via `next-themes` and accessible mobile tap targets.
- **Custom Cursor & Progress Indicator**: Lagging rose pip cursor (desktop) and a persistent slim top reading progress bar.
- **Accessibility**: Full `prefers-reduced-motion` compliance, ARIA attributes, and keyboard navigation across all interactive components.

### Administrative Management Dashboard
- **Overview & KPI Analytics**: Real-time revenue and booking counters, monthly revenue area charts (`Recharts`), status breakdown donuts, and quick-action feeds.
- **"Up Next" Card & Detailed Day View**:
  - Compact countdown card in Overview showing the immediate next client ("in 45 min" or "Now" with soft pulse).
  - Dedicated `/admin/today` view showing today's chronological timeline, revenue earned vs. expected, and one-click status transitions.
- **Reservations Manager (`/admin/reservations`)**:
  - Live search across client names, phone numbers, and services.
  - Date range filtering with instant clear.
  - Custom animated listbox dropdown (`components/ui/Dropdown.tsx`) with desktop floating portal and mobile bottom sheet.
  - Instant contact shortcuts: direct phone call (`tel:`), pre-filled WhatsApp message (`https://wa.me/`), and Telegram (`https://t.me/`).
  - Real-time status badge pills (`new`, `confirmed`, `completed`, `cancelled`) with cancellation confirmation dialogs.
- **Services & Price Manager (`/admin/services`)**:
  - Drag-and-drop service reordering with Framer Motion.
  - Inline editing for service titles, prices, and durations.
  - Active/inactive visibility switches.
  - Safe deletion guard: prevents deleting services tied to active client reservations (offers safe deactivation instead).
  - On-demand server cache revalidation (`revalidateTag`).
- **Real-Time Supabase Sync**: Real-time `postgres_changes` subscriptions ensuring new bookings, badge counts, and status changes update instantly without page refreshes.

---

## Tech Stack

| Category | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | `16.4.6` | App Router, Server Components, Route Handlers & Turbopack |
| **UI Library** | React | `19.3.0` | React 19 runtime with concurrent features |
| **Styling** | Tailwind CSS | `4.3.3` | CSS-first configuration using `@theme` and custom variants |
| **Database & Auth** | Supabase | `^2.119.2` | PostgreSQL database, Auth, and Realtime WebSocket subscriptions |
| **SSR Cookie Auth** | `@supabase/ssr` | `^0.12.7` | Next.js App Router cookie-based session management |
| **Animation Engine** | Framer Motion | `^14.14.0` | Spring physics, layout animations, gestures & reordering |
| **Scroll Animation** | GSAP & ScrollTrigger | `^3.15.1` | ScrollTrigger integration & ticker frame coordination |
| **Smooth Scrolling** | Lenis | `^1.3.27` | Momentum-based viewport smooth scrolling |
| **Data Visualization**| Recharts | `^3.11.0` | SVG-based responsive analytics charts in admin dashboard |
| **Theme Management** | next-themes | `^0.4.6` | Class-based dark and light mode persistence |
| **Validation** | Zod | `^4.6.7` | Strict request schema validation for booking API routes |
| **Carousel** | Embla Carousel | `^8.6.0` | Touch and swipe-enabled carousel (`embla-carousel-react`) |
| **Icons** | Lucide React | `^1.77.0` | Lightweight modern vector icons |
| **Class Utilities** | clsx & tailwind-merge | `^2.1.1` / `^3.7.1` | Conflict-free conditional CSS class composition |
| **Language** | TypeScript | `^5.0.0` | Strict static typing across all routes and components |

---

## Configuration

The application requires three environment variables to connect to your Supabase project.

Copy `.env.example` to create your local `.env.local`:

```bash
cp .env.example .env.local
```

### Environment Variables Reference

| Variable | Scope | Description | Example / Format |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Your Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public / Client | Anon / Publishable API key | `eyJhbGciOi...` |
| `SUPABASE_SECRET_KEY` | Server-Only | Service role key with admin privileges | `eyJhbGciOi...` |

> [!WARNING]
> `SUPABASE_SECRET_KEY` bypasses PostgreSQL Row Level Security (RLS) and is used exclusively on the server (inside Route Handlers and database seed scripts). Never prefix it with `NEXT_PUBLIC_` and never expose it in client-side code. `.env.local` is git-ignored by default.

---

## Database Setup

The database schema is organized into two primary tables within Supabase: `services` and `reservations`.

### Schema Reference (`supabase/schema.sql`)

A complete database schema script is available at [`supabase/schema.sql`](supabase/schema.sql). Review the script before executing it in the **Supabase SQL Editor**.

#### 1. `services` Table
Stores salon service offerings, pricing, durations, and display ordering.
- `id` (`uuid`, Primary Key): Generated with `gen_random_uuid()`.
- `name` (`text`): Name of the service (e.g., "Russian Manicure & Nail Art").
- `price` (`numeric`): Service price in Algerian Dinars (DA).
- `duration_min` (`integer`): Estimated appointment duration in minutes.
- `active` (`boolean`): Whether the service is selectable in the public booking form.
- `position` (`integer`): Sorting order for drag-and-drop reordering.
- `created_at` (`timestamptz`): Timestamp of creation.

#### 2. `reservations` Table
Stores client appointment bookings, contact details, and lifecycle statuses.
- `id` (`uuid`, Primary Key): Unique appointment identifier.
- `name` (`text`): Client full name.
- `phone` (`text`): Client contact phone number.
- `service_id` (`uuid`, Foreign Key): Reference to `services.id`.
- `service` (`text`): Snapshot of service name at booking time.
- `price` (`numeric`): Snapshot of verified price at booking time.
- `date` (`text`): Appointment date formatted as `YYYY-MM-DD`.
- `time` (`text`): Time slot string (e.g., "10:00 AM", "11:30 AM").
- `note` (`text`, nullable): Optional client note or `[demo]` identifier.
- `status` (`text`): Appointment state: `'new'`, `'confirmed'`, `'completed'`, or `'cancelled'`.
- `created_at` (`timestamptz`): Timestamp of submission.

### Row Level Security (RLS) Approach

Row Level Security is enabled on both tables:
1. **`services`**:
   - `SELECT`: Allowed for public/anonymous users, restricted to active services (`active = true`).
   - `ALL` (Insert/Update/Delete): Restricted strictly to authenticated admin users.
2. **`reservations`**:
   - `INSERT`: Allowed for public booking submissions (validated server-side with Zod and conflict checks).
   - `SELECT` & `UPDATE`: Restricted strictly to authenticated admin sessions.
3. **Realtime Publication**: Both tables are published to `supabase_realtime` to enable WebSocket updates on the admin dashboard.

---

## Demo Data Scripts

The project includes CLI scripts to populate and clean demo reservations for testing the admin analytics and calendar views.

```bash
# Seed ~60 realistic demo reservations across the past 8 months
npm run seed:demo

# Safely delete all demo reservations (matching the [demo] tag)
npm run seed:demo:clean
```

> [!CAUTION]
> **Production Cleanup**: Always execute `npm run seed:demo:clean` before launching the application for real clients to ensure test data does not affect salon metrics or schedules.

---

## Getting Started

### Prerequisites

- Node.js `18.18+` or `20+`
- npm, pnpm, or yarn
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hmt-nada/Rose_Nails_Studio.git
   cd Rose_Nails_Studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials in .env.local
   ```

4. Initialize the database schema:
   - Open the **SQL Editor** in your Supabase dashboard.
   - Run the contents of [`supabase/schema.sql`](supabase/schema.sql).

5. Create your administrator account:
   - Go to **Authentication** $\rightarrow$ **Users** in Supabase.
   - Click **Add user** $\rightarrow$ **Create user** with your email and password.
   - Disable public user registrations under **Auth Settings** if not needed.

6. Start the local development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) for the public landing page, or [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the administrative dashboard.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Start local production server
npm run start
```

---

## Project Structure

```text
├── app/
│   ├── (admin)/                 # Route group for administrative dashboard
│   │   └── admin/
│   │       ├── (dashboard)/     # Authenticated dashboard views
│   │       │   ├── page.tsx     # Overview dashboard with analytics & KPIs
│   │       │   ├── reservations/# Reservations management table
│   │       │   ├── services/    # Services and prices manager
│   │       │   └── today/       # Detailed chronological day view
│   │       └── login/           # Admin authentication login page
│   ├── (site)/                  # Public landing page route group
│   │   └── page.tsx             # Landing page composing public sections
│   ├── api/                     # Server-side Route Handlers
│   │   ├── admin/reservations/  # Status update endpoints (admin auth protected)
│   │   ├── reservations/        # Public booking endpoint (Zod validated, rate-limited)
│   │   └── services/            # Public services retrieval endpoint
│   ├── globals.css              # Design tokens, @theme variables & animations
│   └── layout.tsx               # Root layout, fonts, theme provider & metadata
├── components/
│   ├── admin/                   # Administrative dashboard components
│   │   ├── AdminSidebar.tsx     # Desktop navigation with active sliding pill
│   │   ├── AdminTopBar.tsx      # Header with breadcrumbs and theme toggle
│   │   ├── AdminMobileNav.tsx   # Mobile bottom navigation bar
│   │   ├── ReservationsManager.tsx # Search, filter, sort & reservation actions
│   │   ├── ServicesManager.tsx  # Drag-to-reorder service editor
│   │   └── TodayDetailedView.tsx# Detailed day schedule and timeline
│   ├── sections/                # Public landing page sections
│   │   ├── Hero.tsx             # Hero with video showcase & floating bubbles
│   │   ├── Gallery.tsx          # 3D perspective work carousel
│   │   ├── Reviews.tsx          # Fanned card stack testimonials
│   │   ├── Services.tsx         # Salon service catalog cards
│   │   ├── HowItWorks.tsx       # Animated 3-step SVG timeline
│   │   ├── BookingForm.tsx      # Client reservation form with validation
│   │   └── Footer.tsx           # Contact details, atelier hours & wordmark
│   └── ui/                      # Reusable UI component library
│       ├── BrandLogo.tsx        # Vector/image studio emblem
│       ├── Dropdown.tsx         # Custom animated listbox & mobile bottom sheet
│       ├── MagneticButton.tsx   # Cursor attraction button wrapper
│       ├── PageIntro.tsx        # Synchronized liquid curtain entrance screen
│       └── ThemeToggle.tsx      # Animated light/dark mode switch
├── lib/
│   ├── constants.ts             # Content items, quotes, reviews & contact details
│   ├── currency.ts              # Local currency formatting utility
│   ├── supabase/                # Supabase client, server & middleware configurations
│   └── utils.ts                 # Class merger utility (clsx + twMerge)
├── public/                      # Static assets, favicon, video, and gallery images
├── scripts/
│   ├── seed-demo.ts             # Demo data population script
│   └── clean-demo.ts            # Demo data cleanup script
├── supabase/
│   └── schema.sql               # Database schema and RLS policies reference
├── .env.example                 # Example environment variables template
└── tsconfig.json                # TypeScript compiler configuration
```

---

## Roadmap

- [x] Responsive landing page with luxury blush/rose design identity
- [x] Synchronized page-load intro curtain and hero video presentation
- [x] Class-based light and dark mode with persistent user preference
- [x] Interactive 3D portfolio carousel with drag and keyboard controls
- [x] Fanned testimonial card deck with swipe gestures and client previews
- [x] Client booking form with Zod validation, rate limiting, and honeypot
- [x] Supabase database persistence, authentication, and realtime subscriptions
- [x] Comprehensive administrative dashboard (Overview KPIs, Today schedule, Reservations table, Services editor)
- [x] Custom accessible animated listbox dropdown with mobile bottom sheet
- [ ] Automated SMS/email notification webhooks for appointment confirmations
- [ ] External studio calendar availability synchronization (e.g. Google Calendar / Calendly)
- [ ] Online payment deposit gateway integration (e.g. Stripe)

---

## License

This project is licensed under the [MIT License](LICENSE).
