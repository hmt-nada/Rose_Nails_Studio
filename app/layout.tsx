import type { Metadata } from "next";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rosé Nails Studio — Book Your Appointment",
  description:
    "Rosé Nails Studio — The art of luxury nail care. Book your session online and experience bespoke nail art and manicures crafted just for you.",
  keywords: ["nail studio", "manicure", "nail art", "booking", "beauty", "luxury"],
  openGraph: {
    title: "Rosé Nails Studio",
    description: "The art of luxury nail care. Book your session online.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-pearl text-plum">
        {children}
      </body>
    </html>
  );
}
