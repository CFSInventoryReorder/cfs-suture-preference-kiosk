"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadData } from "../../../lib/loadData";
import { getLastUpdated } from "../../../lib/getLastUpdated";
import { formatLastUpdated } from "../../../lib/formatDateTime";

export default function SpecialtyPage() {
  const router = useRouter();
  const params = useParams();
  const specialtyName = decodeURIComponent(params?.name || "");

  const [specialty, setSpecialty] = useState(null);
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
        const found = data.find((s) => s.name === specialtyName);
        if (!found) {
          setStatus({ loading: false, error: "Specialty not found." });
          return;
        }
        setSpecialty(found);
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
  }, [specialtyName]);

  const filteredCards = useMemo(() => {
    if (!specialty) return [];
    const q = query.trim().toLowerCase();
    if (!q) return specialty.cards;

    return specialty.cards.filter((c) =>
      `${c.surgeon} ${c.procedure}`.toLowerCase().includes(q)
    );
  }, [specialty, query]);

  return (
    <>
      <header className="header">
        <h1 className="title">{specialtyName}</h1>
        <p className="subtitle">Select surgeon and procedure</p>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span className="pill">
            <span className={`statusDot ${offline ? "offline" : "online"}`} />
            {offline ? "Offline" : "Online"}
          </span>

          <span className="pill">
            Last updated: {lastUpdated ? formatLastUpdated(lastUpdated) : "(not available)"}
          </span>
        </div>
      </header>

      <section className="panel">
        {/* Back navigation */}
        <div className="backRow">
          <button className="btnBack" onClick={() => router.back()}>
            ← Back
          </button>
        </div>

        {/* Search */}
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
            {filteredCards.map((c) => (
              <button
                key={c.id}
                className="btnCard"
                onClick={() => router.push(`/card/${c.id}`)}
              >
                <div className="nameRow">
                  <span className="surgeon">{c.surgeon}</span>
                  <span className="procedure">{c.procedure}</span>
                </div>
              </button>
            ))}

            {filteredCards.length === 0 && (
              <p className="subtitle">No matches. Try a different search.</p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
