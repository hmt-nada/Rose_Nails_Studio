import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rosé Nails Studio",
    short_name: "Rosé Nails",
    description:
      "The art of luxury nail care. Book your bespoke manicure or nail art session online.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8FA",
    theme_color: "#FFF8FA",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
