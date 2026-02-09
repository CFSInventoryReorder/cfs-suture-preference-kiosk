"use client";

import { useRef } from "react";

export default function LogoBar() {
  const tRef = useRef(null);

  async function hardRefresh() {
    // Clear local storage
    try {
      localStorage.clear();
    } catch {}

    // Clear Cache Storage (service worker caches)
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {}

    // Force reload (best effort across iOS)
    try {
      window.location.reload();
    } catch {
      window.location.href = window.location.href;
    }
  }

  function onDown() {
    // Long press ~1.2s
    tRef.current = setTimeout(() => {
      tRef.current = null;
      hardRefresh();
    }, 1200);
  }

  function onUp() {
    if (tRef.current) {
      clearTimeout(tRef.current);
      tRef.current = null;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "16px 0 8px",
      }}
    >
      <img
        src="/ucsd-logo.jpg"
        alt="UC San Diego School of Medicine – Center for the Future of Surgery"
        style={{ maxWidth: "420px", width: "100%", height: "auto", userSelect: "none" }}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        draggable={false}
      />
    </div>
  );
}
