import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Gallery from "@/components/sections/Gallery";
import Reviews from "@/components/sections/Reviews";
import Services from "@/components/sections/Services";
import HowItWorks from "@/components/sections/HowItWorks";
import BookingForm from "@/components/sections/BookingForm";
import Footer from "@/components/sections/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import LiquidDivider from "@/components/ui/LiquidDivider";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Navbar />
      <main className="flex flex-col w-full overflow-hidden">
        <Hero />
        <LiquidDivider fromColor="fill-[#FFF8FA]" toColor="bg-[#FDF0F5]" />
        <Gallery />
        <LiquidDivider fromColor="fill-[#FDF0F5]" toColor="bg-[#FFF8FA]" flip />
        <Reviews />
        <LiquidDivider fromColor="fill-[#FFF8FA]" toColor="bg-[#FDF0F5]" />
        <Services />
        <LiquidDivider fromColor="fill-[#FDF0F5]" toColor="bg-[#FFF8FA]" flip />
        <HowItWorks />
        <LiquidDivider fromColor="fill-[#FFF8FA]" toColor="bg-[#FDF0F5]" />
        <BookingForm />
        <LiquidDivider fromColor="fill-[#FDF0F5]" toColor="bg-[#FFF8FA]" flip />
        <Footer />
      </main>
    </SmoothScrollProvider>
  );
}
