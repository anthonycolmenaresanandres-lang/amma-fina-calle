import React from "react";

// Location 02 keeps its own editable list. Starting recipes were transcribed
// from the existing Signature Cafecito board, not the live Holland Road catalog.
export const signatureItems = [
  { name: "Bodega Cat", description: "Espresso, lavender & white mocha" },
  { name: "Spanish Latte", description: "Espresso & condensed milk" },
  { name: "Coco Loco", description: "Espresso, coconut & condensed milk" },
  { name: "La Isla", description: "Espresso, mocha & coconut" },
  { name: "Canela Love", description: "Espresso, cinnamon & nutmeg" },
] as const;
export const sealPath = "/assets/bodega/review/bodega-round-seal-review.webp";

export function SecondLocationMenu({ seal = sealPath }: { seal?: string }) {
  return (
    <main className="bodega-second">
      <header className="bodega-second__mast">
        {/* Existing Bodega seal. The nearby wordmark repeats the same accessible name. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={seal} width="88" height="88" alt="" className="bodega-second__seal" />
        <p className="bodega-second__brand">Bodega Café</p>
        <p className="bodega-second__tag">Location 02</p>
      </header>
      <section className="bodega-second__menu" aria-labelledby="bodega-signature-title">
        <p className="bodega-second__caption">THE HOUSE FAVORITES</p>
        <h1 id="bodega-signature-title">Signature<br />cafecito.</h1>
        <ul className="bodega-second__list">
          {signatureItems.map(({ name, description }, index) => (
            <li key={name}>
              <span className="bodega-second__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div><h2>{name}</h2>{description ? <p>{description}</p> : null}</div>
            </li>
          ))}
        </ul>
      </section>
      <footer className="bodega-second__foot"><p>Menu only. Online ordering is not available.</p></footer>
    </main>
  );
}
