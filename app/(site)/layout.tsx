import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
