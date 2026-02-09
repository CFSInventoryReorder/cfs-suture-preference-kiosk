"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadData } from "../lib/loadData";
import { formatLastUpdated } from "../lib/formatDateTime";
import { getLastUpdated } from "../lib/getLastUpdated";

export default function HomePage() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [query, setQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;

    function syncOnlineState() {
      if (!mounted) return;
      setOffline(!navigator.onLine);
    }

    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    loadData()
      .then((data) => {
        if (!mounted) return;
        setSpecialties(data);
        setStatus({ loading: false, error: "" });
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus({ loading: false, error: err?.message || "Failed to load data" });
      });

    getLastUpdated().then((d) => mounted && setLastUpdated(d)).catch(() => {});

    return () => {
      mounted = false;
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return specialties;
    return specialties.filter((s) => s.name.toLowerCase().includes(q));
  }, [specialties, query]);

  return (
    <>
      <header className="header">
        <h1 className="title">Suture Preference Cards</h1>
        <p className="subtitle">Select a surgical specialty</p>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <span className="pill">{offline ? "Offline mode" : "Online"}</span>
          <span className="pill">
            Last updated: {lastUpdated ? formatLastUpdated(lastUpdated) : "(not available)"}
          </span>
        </div>
      </header>

      <section className="panel">
        <div className="searchRow">
          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search specialty..."
            inputMode="search"
          />
        </div>

        {status.loading && <p className="subtitle">Loading…</p>}
        {status.error && (
          <p className="subtitle" style={{ color: "#b91c1c", fontWeight: 800 }}>
            {status.error}
          </p>
        )}

        {!status.loading && !status.error && (
          <div className="gridSpecialty">
            {filtered.map((s) => (
              <button
                key={s.name}
                className="btnCard btnSpecialty"
                onClick={() => router.push(`/specialty/${encodeURIComponent(s.name)}`)}
              >
                <div className="nameRow" style={{ justifyContent: "center" }}>
                  <span className="surgeon">{s.name}</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="subtitle">No matches. Try a different search.</p>}
          </div>
        )}
      </section>
    </>
  );
}
