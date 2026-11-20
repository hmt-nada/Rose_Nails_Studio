# Rosé Nails Studio

A luxurious, feminine booking landing page for a nail salon, designed to make a strong first impression: a cinematic video hero, a draggable work carousel, a stacked reviews section and smooth scroll-driven animations.

<!-- Add a screenshot or GIF here -->
<!-- ![Hero section](docs/screenshots/hero.png) -->

## Features

- **Hero section** with a video that plays once on arrival, freezes on its last frame, and replays when the user scrolls back to it
- **Glass navbar** with animated links, an active-section indicator, a "Book Now" button and a "Location" button that opens Google Maps
- **Our Work carousel**: capsule-shaped cards with round photos, centered active card, arrows, mouse/touch drag and keyboard navigation
- **Reviews**: a stack of testimonial cards with nail-result photos, auto-advance and swipe
- **How It Works** and **Booking form** sections
- **Footer** with contact information
- **Scroll animations**: smooth scrolling, parallax, reveal effects, custom cursor and a scroll progress bar
- Respects `prefers-reduced-motion`
- Desktop-first design, adapted for tablet and mobile

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion, GSAP + ScrollTrigger, Lenis |
| Carousel | Embla Carousel |
| Icons | lucide-react |

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding media

The video and photos are not included in the repository. Add your own files:

```
public/
├── videos/
│   └── hero.mp4              # H.264 MP4, ideally under 3 MB
└── images/
    ├── work/
    │   └── work-1.jpg ... work-9.jpg      # square photos for the carousel
    └── reviews/
        └── nails-1.jpg ... nails-5.jpg    # nail photos for the reviews
```

If a file is missing, the interface falls back to animated pink gradients.

## Customization

- **Text, names and links** (salon name, quotes, Google Maps URL, work items, reviews): see `lib/constants.ts`
- **Colors and fonts**: design tokens are defined in `app/globals.css` and the Tailwind config
- **Hero quote**: edit the quotes array to switch the headline

## Project structure

```
app/                  # App Router pages and global styles
components/
├── sections/         # Navbar, Hero, Gallery, Reviews, HowItWorks, BookingForm, Footer
└── ui/               # Shared components (buttons, bubbles, cursor, ...)
lib/                  # Constants and helpers
public/               # Videos and images
```

## Roadmap

- [x] Landing page with animated sections
- [ ] Responsive polish for tablet and mobile
- [ ] Booking form connected to a database
- [ ] Admin dashboard: login, reservations list, status updates, "today" view
- [ ] Deployment

## License

Add the license of your choice (for example MIT) in a `LICENSE` file.
