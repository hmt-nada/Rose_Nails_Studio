import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Gallery from "@/components/sections/Gallery";
import Reviews from "@/components/sections/Reviews";
import Services from "@/components/sections/Services";
import HowItWorks from "@/components/sections/HowItWorks";
import BookingForm from "@/components/sections/BookingForm";
import Footer from "@/components/sections/Footer";
import LiquidDivider from "@/components/ui/LiquidDivider";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col w-full overflow-x-clip max-w-full">
        <Hero />
        <LiquidDivider fromColor="fill-[var(--divider-wave-fill)]" toColor="bg-[var(--divider-wave-bg)]" />
        <Gallery />
        <LiquidDivider fromColor="fill-[var(--divider-wave-bg)]" toColor="bg-[var(--divider-wave-fill)]" flip />
        <Reviews />
        <LiquidDivider fromColor="fill-[var(--divider-wave-fill)]" toColor="bg-[var(--divider-wave-bg)]" />
        <Services />
        <LiquidDivider fromColor="fill-[var(--divider-wave-bg)]" toColor="bg-[var(--divider-wave-fill)]" flip />
        <HowItWorks />
        <LiquidDivider fromColor="fill-[var(--divider-wave-fill)]" toColor="bg-[var(--divider-wave-bg)]" />
        <BookingForm />
        <LiquidDivider fromColor="fill-[var(--divider-wave-bg)]" toColor="bg-[var(--divider-wave-fill)]" flip />
        <Footer />
      </main>
    </>
  );
}
