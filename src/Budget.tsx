import React, { useState } from "react";

// Beispielhafte HOAI-Kostengruppen
const HOAI_BLOCKS = [
  { nr: "400", label: "400 – Technische Anlagen" },
  { nr: "600", label: "600 – Ausstattung" },
  { nr: "610", label: "610 – Möbelierung" },
  { nr: "620", label: "620 – Elektro" },
  { nr: "630", label: "630 – Bodenbeläge" },
  { nr: "640", label: "640 – Raumtextilien" },
  { nr: "650", label: "650 – Sonderausstattung" },
];

const CATEGORIES = [
  { value: "FF&E", label: "FF&E" },
  { value: "Construction", label: "Construction" },
  { value: "Montage", label: "Montage" },
];

// Beispielhafte Vendor-Liste
const VENDORS = [
  "Exidation",
  "Musterlieferant",
  "Polsterwerk",
  "Lighting GmbH",
];

function getNextRowNumber(rows: any[]) {
  const filtered = rows.filter((r) => !String(r.nr).endsWith(".99"));
  return (
    (filtered.length > 0
      ? Math.max(...filtered.map((r) => Number(r.nr.split(".")[1])))
      : 0) + 1
  );
}

function formatRowNr(blockNr: string, idx: number, category: string) {
  if (category === "Montage" || idx === 99) return `${blockNr}.99`;
  return `${blockNr}.${idx}`;
}

function Budget() {
  // Rollen-Demo (für UI-Test)
  const [role, setRole] = useState("Admin");
  const [vendor, setVendor] = useState(VENDORS[0]);
  const [popup, setPopup] = useState(false);

  // Budgetstruktur: Kostenblöcke mit Zeilen
  const [blocks, setBlocks] = useState([
    {
      nr: "610",
      label: "Möblierung",
      rows: [
        {
          nr: "610.1",
          artikel: "",
          menge: 1,
          ek: 0,
          kategorie: "FF&E",
          marge: 0,
          vendor: "",
        },
        {
          nr: "610.99",
          artikel: "Liefer- und Transportkosten",
          menge: 1,
          ek: 0,
          kategorie: "FF&E",
          marge: 0,
          vendor: "",
        },
      ],
    },
  ]);

  // Kostenblock hinzufügen (Popup)
  function addBlock(nr: string, label: string) {
    if (blocks.some((b) => b.nr === nr)) return setPopup(false); // Kein Doppelblock
    const newBlock = {
      nr,
      label,
      rows: [
        {
          nr: `${nr}.1`,
          artikel: "",
          menge: 1,
          ek: 0,
          kategorie: "FF&E",
          marge: 0,
          vendor: "",
        },
        {
          nr: `${nr}.99`,
          artikel: "Liefer- und Transportkosten",
          menge: 1,
          ek: 0,
          kategorie: "FF&E",
          marge: 0,
          vendor: "",
        },
      ],
    };
    // Nach Nummer einsortieren
    const newBlocks = [...blocks, newBlock].sort((a, b) =>
      Number(a.nr) - Number(b.nr)
    );
    setBlocks(newBlocks);
    setPopup(false);
  }

  // Block löschen
  function removeBlock(idx: number) {
    setBlocks(blocks.filter((_, i) => i !== idx));
  }

  // Zeile hinzufügen (ohne .99)
  function addRow(blockIdx: number) {
    setBlocks((prev) => {
      const updated = [...prev];
      const block = updated[blockIdx];
      const nextNr = getNextRowNumber(block.rows);
      // Montagezeile checken (existiert schon als .99)
      block.rows.splice(
        block.rows.length - 1,
        0,
        {
          nr: formatRowNr(block.nr, nextNr, "FF&E"),
          artikel: "",
          menge: 1,
          ek: 0,
          kategorie: "FF&E",
          marge: 0,
          vendor: "",
        }
      );
      return updated;
    });
  }

  // Zeile löschen
  function removeRow(blockIdx: number, rowIdx: number) {
    setBlocks((prev) => {
      const updated = [...prev];
      updated[blockIdx].rows = updated[blockIdx].rows.filter((_, i) => i !== rowIdx);
      // Nummerierung korrigieren
      updated[blockIdx].rows = updated[blockIdx].rows.map((r, i) => {
        // .99 bleibt .99
        if (r.nr.endsWith(".99")) return r;
        return { ...r, nr: `${updated[blockIdx].nr}.${i + 1}` };
      });
      return updated;
    });
  }

  // Eingabewerte ändern
  function onChange(blockIdx: number, rowIdx: number, field: string, value: any) {
    setBlocks((prev) => {
      const updated = [...prev];
      let row = { ...updated[blockIdx].rows[rowIdx] };
      if (field === "menge") {
        // Mindestens 1!
        value = Math.max(1, Number(value));
      }
      if (field === "kategorie" && value === "Montage") {
        // Zeilennummer auf .99
        row.nr = `${updated[blockIdx].nr}.99`;
        row.kategorie = "Montage";
        row.artikel = "Montage";
      } else if (field === "kategorie" && row.nr.endsWith(".99")) {
        // Wenn Kategorie von Montage auf anderes geändert wird: neue Nummer!
        const rowsWithout99 = updated[blockIdx].rows.filter(r => !r.nr.endsWith(".99"));
        const newNr = `${updated[blockIdx].nr}.${rowsWithout99.length + 1}`;
        row.nr = newNr;
        row.kategorie = value;
        row.artikel = "";
      } else if (field === "kategorie") {
        row.kategorie = value;
      } else {
        row[field] = value;
      }
      updated[blockIdx].rows[rowIdx] = row;
      return updated;
    });
  }

  // Vendor-Zuweisung
  function onVendor(blockIdx: number, rowIdx: number, value: string) {
    setBlocks((prev) => {
      const updated = [...prev];
      updated[blockIdx].rows[rowIdx].vendor = value;
      return updated;
    });
  }

  // Summenberechnung (EK/VK/FF&E)
  function calc(block: any) {
    let kgSum = 0;
    let ffesum = 0;
    block.rows.forEach((row: any) => {
      if (!row.nr.endsWith(".99") && row.kategorie) {
        const ek = Number(row.ek) || 0;
        const menge = Number(row.menge) || 1;
        const marge = Number(row.marge) || 0;
        const vkEinzel = ek * (1 + marge / 100);
        const vkGesamt = vkEinzel * menge;
        kgSum += vkGesamt;
        if (row.kategorie === "FF&E") ffesum += vkGesamt;
      }
    });
    // Transportkosten (.99): berechnen sich prozentual aus KG-Summe
    const tRow = block.rows.find((r: any) => r.nr.endsWith(".99") && r.artikel === "Liefer- und Transportkosten");
    if (tRow) {
      const perc = Number(tRow.ek) || 0;
      tRow.vkEinzel = Math.round(kgSum * perc / 100);
      tRow.vkGesamt = tRow.vkEinzel;
      kgSum += tRow.vkGesamt;
    }
    return { kgSum, ffesum };
  }

  // Gesamtsummen
  let ffesumAll = 0;
  let kgsumAll = 0;
  blocks.forEach((b) => {
    const { kgSum, ffesum } = calc(b);
    kgsumAll += kgSum;
    ffesumAll += ffesum;
  });

  // Sichtbarkeiten je Rolle
  function isVisible(row: any) {
    if (role === "Admin") return true;
    if (role === "Vendor") return row.vendor === vendor;
    if (role === "Kunde") return true;
    return false;
  }
  function isEditable(row: any, field: string) {
    if (role === "Admin") return true;
    if (role === "Vendor" && field === "ek" && row.vendor === vendor) return true;
    return false;
  }
  function showField(field: string) {
    if (role === "Admin") return true;
    if (role === "Vendor") return ["artikel", "menge", "ek", "kategorie", "vendor"].includes(field);
    if (role === "Kunde") return ["artikel", "menge", "vkEinzel", "vkGesamt"].includes(field);
    return false;
  }

  return (
    <div style={{ maxWidth: 1300, margin: "2rem auto", fontFamily: "Inter, Arial, sans-serif" }}>
      {/* Rollenauswahl (für Demo) */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        <div>
          Rolle:&nbsp;
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option>Admin</option>
            <option>Vendor</option>
            <option>Kunde</option>
          </select>
        </div>
        {role === "Vendor" && (
          <div>
            Vendor:&nbsp;
            <select value={vendor} onChange={e => setVendor(e.target.value)}>
              {VENDORS.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        )}
        <button style={{ marginLeft: "auto", fontSize: 14 }} onClick={() => setPopup(true)}>+ Kostenblock hinzufügen</button>
      </div>
      {popup && (
        <div style={{
          background: "#fff", border: "1px solid #444", position: "absolute", zIndex: 9, padding: 20,
          boxShadow: "0 6px 32px #0003"
        }}>
          <div style={{ marginBottom: 12 }}>Kostenblock auswählen</div>
          {HOAI_BLOCKS.map(block => (
            <div key={block.nr} style={{ marginBottom: 7 }}>
              <button
                style={{ minWidth: 280, textAlign: "left", fontWeight: 600, padding: 5, background: "#222", color: "#fff", borderRadius: 4 }}
                onClick={() => addBlock(block.nr, block.label.split("–")[1]?.trim() || "")}
                disabled={blocks.some(b => b.nr === block.nr)}
              >
                {block.label}
              </button>
            </div>
          ))}
          <button style={{ marginTop: 16 }} onClick={() => setPopup(false)}>Abbrechen</button>
        </div>
      )}
      {/* Kostenblöcke */}
      {blocks.map((block, blockIdx) => {
        const { kgSum, ffesum } = calc(block);
        return (
          <div key={block.nr} style={{
            margin: "30px 0 18px 0",
            border: "1px solid #eee",
            borderRadius: 8,
            boxShadow: "0 2px 8px #0001",
            background: "#fafbfc",
            padding: "1rem 2rem 2rem 2rem"
          }}>
            <div style={{
              display: "flex", alignItems: "center", marginBottom: 10,
              borderBottom: "1px solid #ccc", paddingBottom: 2
            }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                Kostenblock {block.nr} – <span style={{ fontWeight: 400, fontSize: 16 }}>{block.label}</span>
              </div>
              <button style={{ marginLeft: 12, fontSize: 13, padding: "2px 7px", background: "#eee", border: "1px solid #bbb", borderRadius: 4, cursor: "pointer" }}
                onClick={() => removeBlock(blockIdx)}>x</button>
            </div>
            <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fff" }}>
                  <th align="left">Kostenblock</th>
                  <th align="left">Artikel</th>
                  <th>Menge</th>
                  {showField("ek") && <th>Einzelpreis EK</th>}
                  {showField("summeEk") && <th>Summe EK</th>}
                  {showField("kategorie") && <th>Kategorie</th>}
                  {showField("marge") && <th>Marge %</th>}
                  {showField("vendor") && <th>Vendor</th>}
                  {showField("vkEinzel") && <th>VK Einzelpreis</th>}
                  {showField("vkGesamt") && <th>VK Gesamtpreis</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {block.rows.filter(isVisible).map((row, rowIdx) => {
                  // EK und Marge
                  const ek = Number(row.ek) || 0;
                  const menge = Number(row.menge) || 1;
                  const marge = Number(row.marge) || 0;
                  const vkEinzel = Math.round(ek * (1 + marge / 100));
                  const vkGesamt = Math.round(vkEinzel * menge);

                  return (
                    <tr key={row.nr} style={row.nr.endsWith(".99") ? { background: "#f7f7fa" } : {}}>
                      <td>{row.nr}</td>
                      <td>
                        {row.nr.endsWith(".99") ?
                          (row.artikel || "Liefer- und Transportkosten")
                          : (
                            showField("artikel") ?
                              <input type="text" value={row.artikel} disabled={!isEditable(row, "artikel")} onChange={e => onChange(blockIdx, rowIdx, "artikel", e.target.value)} style={{ width: 140 }} />
                              : row.artikel
                          )}
                      </td>
                      <td>
                        <input type="number" min={1} value={menge} disabled={row.nr.endsWith(".99") || !isEditable(row, "menge")}
                          style={{ width: 60 }} onChange={e => onChange(blockIdx, rowIdx, "menge", e.target.value)} />
                      </td>
                      {showField("ek") &&
                        <td>
                          <input type="number" min={0} value={ek} disabled={!isEditable(row, "ek")} style={{ width: 70 }} onChange={e => onChange(blockIdx, rowIdx, "ek", e.target.value)} />
                        </td>}
                      {showField("summeEk") &&
                        <td>{ek * menge}</td>}
                      {showField("kategorie") &&
                        <td>
                          <select value={row.kategorie}
                            disabled={row.nr.endsWith(".99") || !isEditable(row, "kategorie")}
                            onChange={e => onChange(blockIdx, rowIdx, "kategorie", e.target.value)}
                          >
                            {CATEGORIES.map(cat => <option key={cat.value}>{cat.value}</option>)}
                          </select>
                        </td>}
                      {showField("marge") &&
                        <td>
                          <input type="number" min={0} value={marge} disabled={!isEditable(row, "marge")} style={{ width: 60 }} onChange={e => onChange(blockIdx, rowIdx, "marge", e.target.value)} />
                        </td>}
                      {showField("vendor") &&
                        <td>
                          <select value={row.vendor} onChange={e => onVendor(blockIdx, rowIdx, e.target.value)}>
                            <option value="">–</option>
                            {VENDORS.map(v => <option key={v}>{v}</option>)}
                          </select>
                        </td>}
                      {showField("vkEinzel") &&
                        <td>{vkEinzel}</td>}
                      {showField("vkGesamt") &&
                        <td>{vkGesamt}</td>}
                      <td>
                        {row.nr.endsWith(".99") ? null :
                          <button onClick={() => removeRow(blockIdx, rowIdx)} style={{ fontSize: 13, background: "#fff", border: "1px solid #ccc", borderRadius: 3, padding: "2px 7px" }}>X</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Add Row */}
            {role === "Admin" && (
              <button style={{ marginTop: 10, fontSize: 15, padding: "4px 18px" }} onClick={() => addRow(blockIdx)}>+ Zeile</button>
            )}
            {/* Summen */}
            <div style={{ marginTop: 10 }}>
              <span style={{ marginRight: 20 }}>KG-Summe: <b>{kgSum} €</b></span>
              <span>FF&E-Summe: <b>{ffesum} €</b></span>
            </div>
          </div>
        );
      })}
      {/* Gesamtsummen */}
      <div style={{ margin: "30px 0 10px 0", fontWeight: 700, fontSize: 16 }}>
        FF&E-Summe: {ffesumAll} €<br />
        GESAMTSUMME: {kgsumAll} €
      </div>
    </div>
  );
}

export default Budget;

