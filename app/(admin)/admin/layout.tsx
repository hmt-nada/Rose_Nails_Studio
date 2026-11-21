import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Rosé Admin",
    default: "Admin Portal | Rosé Nails Studio",
  },
  description: "Management dashboard for Rosé Nails Studio appointments and services.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pearl text-plum font-body selection:bg-rose/20 selection:text-plum flex flex-col admin-portal">
      {children}
    </div>
  );
}
