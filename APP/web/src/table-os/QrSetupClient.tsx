"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import type { TableOsVenue } from "./venue-config";
import styles from "./qr-setup.module.css";

type Props = Readonly<{ venue: TableOsVenue }>;

type QrCard = Readonly<{ table: number; destination: string; dataUrl: string }>;

export function QrSetupClient({ venue }: Props): React.JSX.Element {
  const [count, setCount] = useState(venue.tableRange.draftCount);
  const [cards, setCards] = useState<readonly QrCard[]>([]);
  const [origin, setOrigin] = useState("");

  const tableNumbers = useMemo(
    () => Array.from({ length: count }, (_, index) => index + venue.tableRange.min),
    [count, venue.tableRange.min],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setOrigin(window.location.origin), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!origin) {
      return;
    }

    let cancelled = false;

    void Promise.all(
      tableNumbers.map(async (table) => {
        const destination = `${origin}/table/${venue.id}/${table}`;
        const dataUrl = await QRCode.toDataURL(destination, {
          errorCorrectionLevel: "H",
          margin: 2,
          width: 640,
          color: { dark: "#061618", light: "#fff5d9" },
        });
        return { table, destination, dataUrl };
      }),
    ).then((nextCards) => {
      if (!cancelled) {
        setCards(nextCards);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [origin, tableNumbers, venue.id]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>Internal owner setup · noindex</span>
        <h1>One permanent QR<br />for every table.</h1>
        <p>
          These codes always open the Fina Calle table route. Change menu art, game skin, or Toast destinations later
          without reprinting the QR.
        </p>
        <label>
          Draft table count
          <input
            type="number"
            min={venue.tableRange.min}
            max={venue.tableRange.max}
            value={count}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value, 10);
              if (Number.isFinite(next)) {
                setCount(Math.min(venue.tableRange.max, Math.max(venue.tableRange.min, next)));
              }
            }}
          />
        </label>
        <button type="button" onClick={() => window.print()}>Print QR sheet</button>
      </header>

      <section className={styles.activation}>
        <strong>Before restaurant activation</strong>
        <span>Owner confirms table count and current menu.</span>
        <span>Toast Mobile Order & Pay is enabled and one URL per table is added to venue config.</span>
        <span>Two-device match and every QR destination are verified.</span>
      </section>

      <div className={styles.sheet}>
        {cards.map((card) => (
          <article className={styles.card} key={card.table}>
            {/* Generated locally from the stable route; no third-party QR service. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.dataUrl} alt={`QR code for ${venue.name} table ${card.table}`} />
            <div>
              <span>{venue.name}</span>
              <h2>Table {card.table}</h2>
              <p>MENU · ORDER · PLAY</p>
              <small>{card.destination}</small>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
