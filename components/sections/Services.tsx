"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  NailCareIcon,
  NailArtIcon,
  SpaBathIcon,
  TreatmentBottlesIcon,
} from "./ServiceIcons";
import { cn } from "@/lib/utils";
import SplitText from "@/components/ui/animations/SplitText";

const SERVICES = [
  {
    id: "extensions",
    icon: NailCareIcon,
    title: "Gel Extensions",
    description:
      "Custom sculpted extensions tailored to your natural nail shape for durable length and graceful symmetry.",
  },
  {
    id: "nail-art",
    icon: NailArtIcon,
    title: "Bespoke Nail Art",
    description:
      "Intricate hand-painted motifs, French chrome glazes, ombrés, and delicate 3D accents crafted to your vision.",
  },
  {
    id: "refill",
    icon: SpaBathIcon,
    title: "Refill & Rebalance",
    description:
      "Expert regrowth rebalancing and structural reinforcement to maintain pristine strength and brilliant shine.",
  },
  {
    id: "spa-care",
    icon: TreatmentBottlesIcon,
    title: "Deluxe Manicure",
    description:
      "Gentle dry cuticle refinement, nourishing organic oils, and restorative treatments for luminous, healthy nails.",
  },
];

export default function Services() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="services"
      className="relative py-16 sm:py-20 md:py-24 lg:py-28 w-full bg-[#FDF0F5] overflow-hidden select-none"
    >
      {/* Decorative ambient blurred blobs */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-rose/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-blush/20 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* ─── Header ─── */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16 md:mb-20">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-deep-rose mb-3">
            <SplitText by="word">Our Services</SplitText>
          </span>
          <h2 className="font-heading text-[clamp(2.15rem,5.5vw,4.5rem)] xl:text-7xl font-light text-plum tracking-tight mb-4">
            <SplitText by="word" stagger={0.06} delay={0.1}>
              Crafted for Elegance
            </SplitText>
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg font-light text-plum/65 max-w-md">
            <SplitText by="word" stagger={0.03} delay={0.25}>
              Bespoke manicures, enduring enhancements, and handcrafted artistry.
            </SplitText>
          </p>
        </div>

        {/* ─── 4 Service Cards Aligned Horizontally with Equal Dimensions ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 xl:gap-8 items-stretch">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={service.id}
                initial={shouldReduce ? {} : { opacity: 0, y: 28 }}
                whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: shouldReduce ? 0 : index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "group relative flex flex-col items-center text-center justify-start h-full",
                  // Individual card styling with soft pink aesthetic and delicate rounded corners
                  "bg-white/95 backdrop-blur-xs rounded-[30px]",
                  "border border-white/80 hover:border-blush/70",
                  "shadow-[0_10px_35px_rgba(184,74,110,0.08),0_2px_12px_rgba(249,198,212,0.18)]",
                  "hover:shadow-[0_18px_45px_rgba(184,74,110,0.15)]",
                  "p-8 lg:p-7 xl:p-9",
                  "transition-all duration-300 ease-out cursor-default",
                  "hover:-translate-y-2"
                )}
              >
                {/* Minimal line-style icon at the top (exact vector shape from reference, monochromatic) */}
                <div className="h-16 flex items-center justify-center mb-6 text-plum group-hover:text-deep-rose transition-colors duration-300">
                  <Icon className="h-12 w-auto max-w-[52px] transition-transform duration-300 ease-out group-hover:scale-105" />
                </div>

                {/* Service Title */}
                <h3 className="font-heading text-2xl lg:text-[26px] font-medium text-plum mb-3 tracking-wide group-hover:text-deep-rose transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="font-body text-sm font-light text-plum/70 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
