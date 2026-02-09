import "./globals.css";
import pkg from "../package.json";
import LogoBar from "./components/LogoBar";

export const metadata = {
  title: "Suture Preference Cards",
  description: "Offline-ready iPad kiosk for suture preference cards",
  themeColor: "#1d4ed8",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Suture Cards" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>

      <body>
        <div className="shell">
          {/* Long-press UCSD logo to force refresh (staff-only gesture) */}
          <LogoBar />

          {children}

          {/* Version badge (reads package.json version) */}
          <div className="versionBadge">v{pkg.version}</div>
        </div>
      </body>
    </html>
  );
}
