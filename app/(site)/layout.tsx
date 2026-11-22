import { IntroProvider } from "@/components/providers/IntroProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntroProvider>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </IntroProvider>
  );
}
