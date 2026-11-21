// ─── Site-wide constants ───────────────────────────────────────────────────

/** Hero quotes — change index 0 to swap the displayed quote. */
export const HERO_QUOTES = [
  "Life is not perfect, but your nails can be.",
  "I don't do drama, I do nails.",
] as const;

/**
 * Studio contact and location details.
 */
export const STUDIO_CONTACT = {
  address: "482 North Camden Drive, Penthouse Suite 300",
  city: "Beverly Hills, CA 90210",
  fullAddress: "482 North Camden Drive, Suite 300, Beverly Hills, CA 90210",
  phone: "+1 (310) 843-9210",
  phoneRaw: "+13108439210",
  email: "concierge@rosenailsstudio.com",
  hours: {
    weekdays: "9:00 AM – 7:30 PM",
    saturday: "9:30 AM – 7:00 PM",
    sunday: "10:00 AM – 5:00 PM",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=482+North+Camden+Drive+Beverly+Hills+CA+90210",
} as const;

export const GOOGLE_MAPS_URL = STUDIO_CONTACT.mapsUrl;

export const SITE_NAME = "Rosé Nails Studio";

/**
 * Our Work gallery items.
 * Images are expected in /images/work/work-1.jpg ... work-9.jpg.
 * Gradient fallbacks are displayed when image files are not yet present.
 */
export interface WorkItem {
  id: string;
  name: string;
  image: string;
  gradient: string;
}

export const WORK_ITEMS: WorkItem[] = [
  {
    id: "work-1",
    name: "French Nails",
    image: "/images/work/work-1.jpg",
    gradient: "from-[#FAD0C4] via-[#FFD1FF] to-[#F9C6D4]",
  },
  {
    id: "work-2",
    name: "Long Almond",
    image: "/images/work/work-2.jpg",
    gradient: "from-[#F9C6D4] via-[#E88AA6] to-[#D87093]",
  },
  {
    id: "work-3",
    name: "Baddie Nails",
    image: "/images/work/work-3.jpg",
    gradient: "from-[#B84A6E] via-[#E88AA6] to-[#F9C6D4]",
  },
  {
    id: "work-4",
    name: "Chrome Glaze",
    image: "/images/work/work-4.jpg",
    gradient: "from-[#FFF8FA] via-[#F9C6D4] to-[#E88AA6]",
  },
  {
    id: "work-5",
    name: "Pearl Glow",
    image: "/images/work/work-5.jpg",
    gradient: "from-[#FFE5EC] via-[#FFC2D1] to-[#FFB3C6]",
  },
  {
    id: "work-6",
    name: "Floral Art",
    image: "/images/work/work-6.jpg",
    gradient: "from-[#F8BBD0] via-[#F48FB1] to-[#EC407A]",
  },
  {
    id: "work-7",
    name: "Glitter Ombre",
    image: "/images/work/work-7.jpg",
    gradient: "from-[#E88AA6] via-[#B84A6E] to-[#6A1B4D]",
  },
  {
    id: "work-8",
    name: "Classic Gel",
    image: "/images/work/work-8.jpg",
    gradient: "from-[#FFD8DF] via-[#F9C6D4] to-[#E88AA6]",
  },
  {
    id: "work-9",
    name: "Minimal Nude",
    image: "/images/work/work-9.jpg",
    gradient: "from-[#F7D6D0] via-[#EFC5BA] to-[#DFAB9F]",
  },
];

/**
 * Client reviews for the Reviews section stack.
 * Images target nail-result photos sent by clients: /images/reviews/nails-1.jpg ... nails-5.jpg.
 * Gradient circles with client initials are displayed as fallback if the file is missing.
 */
export interface ReviewItem {
  id: string;
  name: string;
  initials: string;
  service: string;
  rating: number;
  text: string;
  image: string;
  gradient: string;
}

export const REVIEWS: ReviewItem[] = [
  {
    id: "review-1",
    name: "Camille L.",
    initials: "CL",
    service: "Chrome Glaze Gel",
    rating: 5,
    text: "The attention to detail here is truly unmatched. My chrome glaze manicure lasted three full weeks without a single chip, and the studio atmosphere is so calming and luxurious. I won't go anywhere else!",
    image: "/images/reviews/nails-1.jpg",
    gradient: "from-[#FAD0C4] to-[#E88AA6]",
  },
  {
    id: "review-2",
    name: "Sophia B.",
    initials: "SB",
    service: "French Almond Nails",
    rating: 5,
    text: "Obsessed with my fresh almond set! The shape is impeccably symmetrical and the hand care left my skin silky smooth. You can genuinely feel the difference with their luxury products.",
    image: "/images/reviews/nails-2.jpg",
    gradient: "from-[#F9C6D4] to-[#B84A6E]",
  },
  {
    id: "review-3",
    name: "Elena R.",
    initials: "ER",
    service: "Floral Nail Art",
    rating: 5,
    text: "I brought in a delicate floral design reference and she brought it to life even more beautifully than the picture. Pure artistry and precision — I receive non-stop compliments every day.",
    image: "/images/reviews/nails-3.jpg",
    gradient: "from-[#FFE5EC] to-[#E88AA6]",
  },
  {
    id: "review-4",
    name: "Chloe V.",
    initials: "CV",
    service: "Luxury Gel Treatment",
    rating: 5,
    text: "The cuticle work is the cleanest and gentlest I have ever experienced anywhere. The finish is immaculate, ultra-glossy, and the team treated me like royalty from the moment I walked in.",
    image: "/images/reviews/nails-4.jpg",
    gradient: "from-[#F8BBD0] to-[#A8385C]",
  },
  {
    id: "review-5",
    name: "Mia A.",
    initials: "MA",
    service: "Glitter Ombre Fade",
    rating: 5,
    text: "Such a warm, aesthetic space paired with expert technique. My glitter ombre fade is seamlessly blended and catching the light everywhere I go. Booking was effortless and worth every penny.",
    image: "/images/reviews/nails-5.jpg",
    gradient: "from-[#E88AA6] to-[#6A1B4D]",
  },
];

/**
 * Available atelier services for the booking system.
 */
export const BOOKING_SERVICES = [
  "Gel Extensions",
  "Bespoke Nail Art",
  "Refill & Rebalance",
  "Deluxe Manicure",
  "Classic Gel Nails",
  "Chrome Glaze Finish",
] as const;

export type BookingService = (typeof BOOKING_SERVICES)[number];

/**
 * Available appointment time slots for the booking system.
 */
export const BOOKING_TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
  "5:30 PM",
] as const;

export type BookingTimeSlot = (typeof BOOKING_TIME_SLOTS)[number];

