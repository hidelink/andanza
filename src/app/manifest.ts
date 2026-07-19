import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Andanza",
    short_name: "Andanza",
    description: "Convierte tus reels guardados en planes de viaje",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f2",
    theme_color: "#0f6e56",
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
    share_target: {
      action: "/share-target",
      method: "GET",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };
}
