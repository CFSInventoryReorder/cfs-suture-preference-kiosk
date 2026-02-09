/** @type {import('next').NextConfig} */
const fs = require("fs");
const path = require("path");

let offlineManifest = [];
try {
  const p = path.join(__dirname, "public", "offline-manifest.json");
  if (fs.existsSync(p)) {
    offlineManifest = JSON.parse(fs.readFileSync(p, "utf8"));
  }
} catch (_) {
  offlineManifest = [];
}

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],

  // FULL offline: precache every Specialty + Card route generated from the CSV
  additionalManifestEntries: offlineManifest,

  runtimeCaching: [
    // Navigation (pages): cache-first so route clicks work in Airplane Mode
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "CacheFirst",
      options: {
        cacheName: "pages-cache",
        expiration: { maxEntries: 512, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },

    // Next.js static assets
    {
      urlPattern: /^https?:.*\/(?:_next\/static|_next\/image)\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },

    // CSV / JSON data
    {
      urlPattern: /^https?:.*\/data\/.*\.(?:csv|json)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "data-cache",
        expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },

    // Everything else
    {
      urlPattern: /^https?:.*$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "http-cache",
        expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
};

module.exports = withPWA(nextConfig);
