"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadData } from "../../../lib/loadData";
import { getLastUpdated } from "../../../lib/getLastUpdated";
import { formatLastUpdated } from "../../../lib/formatDateTime";

export default function SpecialtyPage() {
  const router = useRouter();
  const params = useParams();
  const name = decodeURIComponent(params?.name || "");

  const [cards, setCards] = useState([]);
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
        const found = data.find((d) => d.name === name);
        setCards(found ? found.cards : []);
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
  }, [name]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => `${c.surgeon} ${c.procedure}`.toLowerCase().includes(q));
  }, [cards, query]);

  return (
    <>
      <header className="header">
        <div className="topRow" style={{ justifyContent: "center" }}>
          <div>
            <h1 className="title" style={{ marginBottom: 2, fontSize: 32 }}>{name}</h1>
            <p className="subtitle">Select surgeon and procedure</p>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="pill">{offline ? "Offline mode" : "Online"}</span>
              <span className="pill">
                Last updated: {lastUpdated ? formatLastUpdated(lastUpdated) : "(not provided by host)"}
              </span>
            </div>
          </div>
          <button
            className="btnCard"
            onClick={() => router.push("/")}
            style={{ width: "auto", padding: "12px 14px" }}
          >
            ← Back
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="searchRow">
          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search surgeon or procedure..."
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
          <div className="list">
            {filtered.map((c) => (
              <button key={c.id} className="btnCard" onClick={() => router.push(`/card/${c.id}`)}>
                <div className="nameRow">
                  <span className="surgeon">{c.surgeon}</span>
                  <span className="lab"> | {c.procedure}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className="pill">{c.items.length} items</span>
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
