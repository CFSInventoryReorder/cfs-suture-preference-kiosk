import "./globals.css";

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
          <div style={{ display: "flex", justifyContent: "center", margin: "16px 0 8px" }}>
            <img
              src="/ucsd-logo.jpg"
              alt="UC San Diego School of Medicine – Center for the Future of Surgery"
              style={{ maxWidth: "420px", width: "100%", height: "auto" }}
            />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
