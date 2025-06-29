import React, { useState } from "react";

const KOSTENGRUPPEN = [
  { nr: "610", name: "Möblierung" },
  { nr: "620", name: "Elektro" },
  { nr: "630", name: "Bodenbeläge" },
  // ...weitere Blöcke aus HOAI bei Bedarf
];

const KATEGORIEN = [
  { value: "FF&E", label: "FF&E" },
  { value: "Construction", label: "Construction" },
  { value: "Montage", label: "Montage" },
];

const VENDORS = [
  { value: "-", label: "-" },
  { value: "Exidation", label: "Exidation" },
  // ...weitere Vendors
];

function calcVK(einkauf: number, marge: number) {
  return Math.round(einkauf * (1 + marge / 100));
}

export default function Budget() {
  const [zeilen, setZeilen] = useState([
    { artikel: "", menge: 1, ek: 0, kategorie: "FF&E", marge: 0, vendor: "-", transport: false },
  ]);

  // Positioniert eine neue Zeile immer vor Transport, falls schon vorhanden
  const addZeile = () => {
    setZeilen((z) => {
      const ohneTransport = z.filter((row) => !row.transport);
      const transportRow = z.find((row) => row.transport);
      const neue = [...ohneTransport, { artikel: "", menge: 1, ek: 0, kategorie: "FF&E", marge: 0, vendor: "-", transport: false }];
      return transportRow ? [...neue, transportRow] : neue;
    });
  };

  // Fügt die Transportzeile als letzte hinzu (nur eine pro Block!)
  const addTransport = () => {
    setZeilen((z) =>
      z.some((row) => row.transport)
        ? z
        : [...z, { artikel: "Liefer- und Transportkosten", menge: 1, ek: 0, kategorie: "", marge: 0, vendor: "-", transport: true }]
    );
  };

  // Löscht eine Zeile
  const removeZeile = (idx: number) => setZeilen(zeilen.filter((_, i) => i !== idx));

  // Automatisch richtige Nummerierung: .99 für Montage, 99 für Transport, sonst fortlaufend
  const nummer = (idx: number, row: any) => {
    const basis = "610";
    if (row.transport) return `${basis}.99`;
    const pos = zeilen.filter((z, i) => !z.transport && i <= idx).filter((z) => !z.transport).length;
    return row.kategorie === "Montage" ? `${basis}.${pos}.99` : `${basis}.${pos}`;
  };

  // Summe EK und VK
  const sumEK = (row: any) => (row.menge > 0 ? row.menge * row.ek : 0);
  const vkEinzel = (row: any) => calcVK(row.ek, row.marge);
  const sumVK = (row: any) => (row.menge > 0 ? row.menge * vkEinzel(row) : 0);

  // Gesamtsummen
  const totalEK = zeilen.filter((z) => !z.transport).reduce((a, z, i) => a + sumEK(z), 0);
  const totalVK = zeilen.filter((z) => !z.transport).reduce((a, z, i) => a + sumVK(z), 0);

  // Transport berechnen: z.B. 5% von VK (hier: Prozent im EK-Feld, z.B. 5 für 5%)
  const transportVK = (() => {
    const t = zeilen.find((z) => z.transport);
    if (!t) return 0;
    const prozent = Number(t.ek) || 0;
    return Math.round((prozent / 100) * totalVK);
  })();

  // Sichtbarkeit nach Rolle (hier nur Admin als Beispiel!)
  const rolle = "Admin";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h3>Kostenblock 610 – Möblierung</h3>
      <button onClick={addZeile}>+ Zeile</button>
      <button onClick={addTransport} style={{ marginLeft: 8 }}>+ Liefer- und Transportkosten</button>
      <table style={{ width: "100%", marginTop: 16 }}>
        <thead>
          <tr>
            <th>Kostenblock</th>
            <th>Artikel</th>
            <th>Menge</th>
            <th>Einzelpreis EK</th>
            <th>Summe EK</th>
            <th>Kategorie</th>
            <th>Marge %</th>
            <th>Vendor</th>
            <th>VK Einzelpreis</th>
            <th>VK Gesamtpreis</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((row, idx) => (
            <tr key={idx}>
              <td>{nummer(idx, row)}</td>
              <td>
                <input value={row.artikel} onChange={e => {
                  const n = [...zeilen];
                  n[idx].artikel = e.target.value;
                  setZeilen(n);
                }} disabled={row.transport} style={{ width: 180 }} />
              </td>
              <td>
                <input type="number" min={1} value={row.menge} onChange={e => {
                  const n = [...zeilen];
                  n[idx].menge = Math.max(1, Number(e.target.value));
                  setZeilen(n);
                }} disabled={row.transport} style={{ width: 60 }} />
              </td>
              <td>
                <input type="number" min={0} value={row.ek} onChange={e => {
                  const n = [...zeilen];
                  n[idx].ek = Number(e.target.value);
                  setZeilen(n);
                }} style={{ width: 80 }} />
              </td>
              <td>{sumEK(row)}</td>
              <td>
                {!row.transport ? (
                  <select value={row.kategorie} onChange={e => {
                    const n = [...zeilen];
                    n[idx].kategorie = e.target.value;
                    setZeilen(n);
                  }} style={{ width: 120 }}>
                    {KATEGORIEN.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                ) : null}
              </td>
              <td>
                {!row.transport ? (
                  <input type="number" min={0} max={99} value={row.marge} onChange={e => {
                    const n = [...zeilen];
                    n[idx].marge = Number(e.target.value);
                    setZeilen(n);
                  }} style={{ width: 60 }} />
                ) : null}
              </td>
              <td>
                {!row.transport ? (
                  <select value={row.vendor} onChange={e => {
                    const n = [...zeilen];
                    n[idx].vendor = e.target.value;
                    setZeilen(n);
                  }} style={{ width: 120 }}>
                    {VENDORS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                ) : null}
              </td>
              <td>{!row.transport ? vkEinzel(row) : ""}</td>
              <td>{!row.transport ? sumVK(row) : (transportVK)}</td>
              <td>
                {!row.transport && (
                  <button onClick={() => removeZeile(idx)}>X</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20 }}>
        <b>KG-Summe EK:</b> {totalEK} € <br />
        <b>GESAMTSUMME VK:</b> {totalVK + transportVK} €
      </div>
    </div>
  );
}

