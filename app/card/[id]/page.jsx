"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadData } from "../../../lib/loadData";
import { getLastUpdated } from "../../../lib/getLastUpdated";
import { formatLastUpdated } from "../../../lib/formatDateTime";

export default function CardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [all, setAll] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
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
        setAll(data);
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

  const card = useMemo(() => {
    for (const s of all) {
      const found = s.cards.find((c) => c.id === id);
      if (found) return found;
    }
    return null;
  }, [all, id]);

  return (
    <>
      <header className="header">
        <div className="topRow" style={{ justifyContent: "center" }}>
          <div>
            <h1 className="title" style={{ marginBottom: 2, fontSize: 32 }}>
              {card ? `${card.surgeon} — ${card.procedure}` : "Preference Card"}
            </h1>
            <p className="subtitle">{card ? card.specialty : " "}</p>
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
            ← Home
          </button>
        </div>
      </header>

      <section className="panel">
        {status.loading && <p className="subtitle">Loading…</p>}
        {status.error && (
          <p className="subtitle" style={{ color: "#b91c1c", fontWeight: 800 }}>
            {status.error}
          </p>
        )}
        {!status.loading && !status.error && !card && (
          <p className="subtitle">Card not found. Return Home and reselect.</p>
        )}

        {!status.loading && !status.error && card && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Suture</th>
                  <th>SKU</th>
                  <th className="qty">Qty</th>
                </tr>
              </thead>
              <tbody>
                {card.items.map((i, idx) => (
                  <tr key={`${i.sutureName}-${idx}`}>
                    <td>
                      <div style={{ fontWeight: 900 }}>{i.sutureName}</div>
                      {i.description ? <div className="note">{i.description}</div> : null}
                    </td>
                    <td>{i.sku || ""}</td>
                    <td className="qty">{i.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="stickyFooter">
              <button className="btnPrimary" onClick={() => router.push("/")}>
                Finish
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
