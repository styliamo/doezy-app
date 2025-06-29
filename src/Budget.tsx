import React, { useState } from "react";

// Definition der HOAI/HUAI Kostenblöcke
const KOSTENBLOECKE = [
  { nummer: "400", name: "Technische Anlagen" },
  { nummer: "610", name: "Möblierung" },
  { nummer: "620", name: "Elektro" },
  { nummer: "630", name: "Bodenbeläge" },
  { nummer: "640", name: "Raumtextilien" },
  { nummer: "650", name: "Sonderausstattung" }
];

const KATEGORIEN = ["FF&E", "Construction", "Montage"];

const initialUser = {
  rolle: "Admin", // Alternativ: "Vendor", "Kunde"
  vendorName: "Exidation"
};

const initialVendors = [
  "Exidation",
  "Musterlieferant",
  "TestVendor"
];

function getNextPositionsnummer(zeilen) {
  let nummer = 1;
  while (
    zeilen.some(
      (z) =>
        z.nummer ===
        `${z.kostenblock}.${nummer}${z.kategorie === "Montage" ? ".99" : ""}`
    )
  ) {
    nummer++;
  }
  return nummer;
}

function sortiereZeilen(zeilen) {
  // Sortiert nach Positionsnummernlogik und 99-Anhang bei Montage
  return [...zeilen].sort((a, b) => {
    const aSplit = a.nummer.split(".");
    const bSplit = b.nummer.split(".");
    for (let i = 0; i < Math.max(aSplit.length, bSplit.length); i++) {
      const na = parseInt(aSplit[i] || "0", 10);
      const nb = parseInt(bSplit[i] || "0", 10);
      if (na !== nb) return na - nb;
    }
    return 0;
  });
}

export default function Budget() {
  const [kostenbloecke, setKostenbloecke] = useState([
    {
      kostenblock: "610",
      name: "Möblierung",
      zeilen: [
        {
          nummer: "610.1",
          artikel: "",
          menge: 1,
          einzelpreis: 0,
          kategorie: "FF&E",
          marge: 0,
          vendor: "",
        }
      ],
      lieferTransport: {
        nummer: "610.99",
        artikel: "Liefer- und Transportkosten",
        menge: 1,
        einzelpreis: 0,
        kategorie: "FF&E",
        marge: 0,
        vendor: "",
        istLieferTransport: true,
        prozent: 0,
      }
    }
  ]);
  const [showKostenblockModal, setShowKostenblockModal] = useState(false);
  const [user, setUser] = useState(initialUser);

  // Kostenblock hinzufügen mit Modal
  function handleKostenblockHinzufuegen(nummer, name) {
    setKostenbloecke((prev) =>
      sortiereKostenbloecke([
        ...prev,
        {
          kostenblock: nummer,
          name,
          zeilen: [
            {
              nummer: `${nummer}.1`,
              artikel: "",
              menge: 1,
              einzelpreis: 0,
              kategorie: "FF&E",
              marge: 0,
              vendor: "",
            }
          ],
          lieferTransport: {
            nummer: `${nummer}.99`,
            artikel: "Liefer- und Transportkosten",
            menge: 1,
            einzelpreis: 0,
            kategorie: "FF&E",
            marge: 0,
            vendor: "",
            istLieferTransport: true,
            prozent: 0,
          }
        }
      ])
    );
    setShowKostenblockModal(false);
  }

  // Kostenblöcke sortieren nach Nummer
  function sortiereKostenbloecke(bl) {
    return [...bl].sort((a, b) => parseInt(a.kostenblock) - parseInt(b.kostenblock));
  }

  // Zeile hinzufügen
  function handleZeileHinzufuegen(idx) {
    setKostenbloecke((prev) => {
      const klone = [...prev];
      const block = { ...klone[idx] };
      const zeilen = [...block.zeilen];
      const nextNr = zeilen.length + 1;
      zeilen.push({
        nummer: `${block.kostenblock}.${nextNr}`,
        artikel: "",
        menge: 1,
        einzelpreis: 0,
        kategorie: "FF&E",
        marge: 0,
        vendor: "",
      });
      block.zeilen = sortiereZeilen(zeilen);
      klone[idx] = block;
      return klone;
    });
  }

  // Zeile ändern
  function handleZeileChange(blockIdx, zeileIdx, feld, value) {
    setKostenbloecke((prev) => {
      const klone = [...prev];
      const block = { ...klone[blockIdx] };
      const zeilen = [...block.zeilen];
      let zeile = { ...zeilen[zeileIdx] };
      if (feld === "kategorie" && value === "Montage" && !zeile.nummer.endsWith(".99")) {
        zeile.nummer = `${block.kostenblock}.${zeile.nummer.split(".")[1]}.99`;
      }
      if (feld === "kategorie" && value !== "Montage" && zeile.nummer.endsWith(".99")) {
        zeile.nummer = `${block.kostenblock}.${zeile.nummer.split(".")[1]}`;
      }
      if (feld === "menge") {
        zeile[feld] = Math.max(1, parseInt(value) || 1);
      } else {
        zeile[feld] = value;
      }
      zeilen[zeileIdx] = zeile;
      block.zeilen = sortiereZeilen(zeilen);
      klone[blockIdx] = block;
      return klone;
    });
  }

  // Zeile löschen
  function handleZeileLoeschen(blockIdx, zeileIdx) {
    setKostenbloecke((prev) => {
      const klone = [...prev];
      const block = { ...klone[blockIdx] };
      const zeilen = [...block.zeilen];
      zeilen.splice(zeileIdx, 1);
      block.zeilen = zeilen;
      klone[blockIdx] = block;
      return klone;
    });
  }

  // Kostenblock löschen
  function handleKostenblockLoeschen(idx) {
    setKostenbloecke((prev) => prev.filter((_, i) => i !== idx));
  }

  // Liefer- und Transportkosten ändern
  function handleLieferTransportChange(blockIdx, feld, value) {
    setKostenbloecke((prev) => {
      const klone = [...prev];
      const block = { ...klone[blockIdx] };
      const ltk = { ...block.lieferTransport };
      if (feld === "prozent") {
        ltk.prozent = Math.max(0, Math.min(100, parseInt(value) || 0));
        // Automatisch Einzelpreis berechnen (auf VK aller Zeilen, außer Montage/Transport)
        const vkSumme = block.zeilen
          .filter((z) => !z.istLieferTransport && z.kategorie !== "Montage")
          .reduce(
            (sum, z) =>
              sum + ((z.einzelpreis * z.menge) * (1 + (parseFloat(z.marge) || 0) / 100)),
            0
          );
        ltk.einzelpreis = Math.round((vkSumme * ltk.prozent) / 100);
      } else {
        ltk[feld] = value;
      }
      block.lieferTransport = ltk;
      klone[blockIdx] = block;
      return klone;
    });
  }

  // Summe je Block berechnen
  function blockSummen(block) {
    let ek = block.zeilen.reduce(
      (sum, z) => sum + ((parseFloat(z.einzelpreis) || 0) * (parseFloat(z.menge) || 1)),
      0
    );
    let vk = block.zeilen.reduce(
      (sum, z) =>
        sum +
        ((parseFloat(z.einzelpreis) || 0) *
          (parseFloat(z.menge) || 1) *
          (1 + (parseFloat(z.marge) || 0) / 100)),
      0
    );
    // Liefer- und Transportkosten dazurechnen (nur VK!)
    vk += parseFloat(block.lieferTransport.einzelpreis) || 0;
    return { ek, vk };
  }

  // Gesamtsummen berechnen
  const ffesumme = kostenbloecke
    .map((block) =>
      block.zeilen
        .filter((z) => z.kategorie === "FF&E")
        .reduce(
          (sum, z) =>
            sum +
            ((parseFloat(z.einzelpreis) || 0) *
              (parseFloat(z.menge) || 1) *
              (1 + (parseFloat(z.marge) || 0) / 100)),
          0
        )
    )
    .reduce((a, b) => a + b, 0);

  const gesamtsumme = kostenbloecke
    .map((block) => blockSummen(block).vk)
    .reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: 24 }}>
      <h2>Budget-Tabelle</h2>
      <div>
        <button onClick={() => setShowKostenblockModal(true)}>
          + Kostenblock hinzufügen
        </button>
      </div>
      {kostenbloecke.map((block, idx) => (
        <div
          key={block.kostenblock}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            marginTop: 20,
            padding: 10,
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              Kostenblock {block.kostenblock} – {block.name}
            </div>
            <button
              style={{
                marginLeft: 8,
                fontSize: 14,
                background: "#eee",
                border: "none",
                padding: "2px 8px",
                cursor: "pointer",
              }}
              onClick={() => handleKostenblockLoeschen(idx)}
              title="Block löschen"
            >
              x
            </button>
          </div>
          <table style={{ width: "100%", marginTop: 10 }}>
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
              {block.zeilen.map((zeile, zeileIdx) => (
                <tr key={zeile.nummer}>
                  <td>{zeile.nummer}</td>
                  <td>
                    <input
                      value={zeile.artikel}
                      onChange={(e) =>
                        handleZeileChange(idx, zeileIdx, "artikel", e.target.value)
                      }
                      style={{ width: 110 }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={zeile.menge}
                      min={1}
                      onChange={(e) =>
                        handleZeileChange(idx, zeileIdx, "menge", e.target.value)
                      }
                      style={{ width: 55 }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={zeile.einzelpreis}
                      min={0}
                      onChange={(e) =>
                        handleZeileChange(idx, zeileIdx, "einzelpreis", e.target.value)
                      }
                      style={{ width: 80 }}
                    />
                  </td>
                  <td>
                    {parseFloat(zeile.einzelpreis || 0) *
                      parseInt(zeile.menge || 1)}
                  </td>
                  <td>
                    <select
                      value={zeile.kategorie}
                      onChange={(e) =>
                        handleZeileChange(idx, zeileIdx, "kategorie", e.target.value)
                      }
                    >
                      {KATEGORIEN.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={zeile.marge}
                      min={0}
                      max={99}
                      onChange={(e) =>
                        handleZeileChange(idx, zeileIdx, "marge", e.target.value)
                      }
                      style={{ width: 55 }}
                    />
                  </td>
                  <td>
                    <select
                      value={zeile.vendor}
                      onChange={(e) =>
                        handleZeileChange(idx, zeileIdx, "vendor", e.target.value)
                      }
                    >
                      <option value="">–</option>
                      {initialVendors.map((vn) => (
                        <option key={vn} value={vn}>
                          {vn}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {Math.round(
                      parseFloat(zeile.einzelpreis || 0) *
                        (1 + (parseFloat(zeile.marge) || 0) / 100)
                    )}
                  </td>
                  <td>
                    {Math.round(
                      parseFloat(zeile.einzelpreis || 0) *
                        parseInt(zeile.menge || 1) *
                        (1 + (parseFloat(zeile.marge) || 0) / 100)
                    )}
                  </td>
                  <td>
                    <button
                      style={{
                        fontSize: 14,
                        background: "#eee",
                        border: "none",
                        padding: "2px 6px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleZeileLoeschen(idx, zeileIdx)}
                    >
                      x
                    </button>
                  </td>
                </tr>
              ))}
              {/* Liefer- und Transportkosten */}
              <tr>
                <td>{block.lieferTransport.nummer}</td>
                <td>
                  <input
                    value={block.lieferTransport.artikel}
                    disabled
                    style={{ width: 140 }}
                  />
                </td>
                <td>
                  <input value={1} disabled style={{ width: 55 }} />
                </td>
                <td>
                  <input
                    type="number"
                    value={block.lieferTransport.einzelpreis}
                    min={0}
                    disabled
                    style={{ width: 80 }}
                  />
                </td>
                <td>
                  {block.lieferTransport.einzelpreis}
                </td>
                <td>
                  <select disabled>
                    <option>FF&E</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={block.lieferTransport.prozent}
                    min={0}
                    max={100}
                    onChange={(e) =>
                      handleLieferTransportChange(
                        idx,
                        "prozent",
                        e.target.value
                      )
                    }
                    style={{ width: 55 }}
                  />{" "}
                  %
                </td>
                <td>
                  <select disabled>
                    <option>–</option>
                  </select>
                </td>
                <td>{block.lieferTransport.einzelpreis}</td>
                <td>{block.lieferTransport.einzelpreis}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <button onClick={() => handleZeileHinzufuegen(idx)} style={{ marginTop: 6 }}>
            + Zeile
          </button>
          <div style={{ marginTop: 8, fontSize: 14 }}>
            KG-Summe: {blockSummen(block).vk.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} <br />
            FF&E-Summe: {block.zeilen
              .filter((z) => z.kategorie === "FF&E")
              .reduce(
                (sum, z) =>
                  sum +
                  ((parseFloat(z.einzelpreis) || 0) *
                    (parseFloat(z.menge) || 1) *
                    (1 + (parseFloat(z.marge) || 0) / 100)),
                0
              ).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 18, fontWeight: 600, fontSize: 16 }}>
        FF&E-Summe: {ffesumme.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} <br />
        GESAMTSUMME: {gesamtsumme.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
      </div>

      {showKostenblockModal && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.2)",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 340,
              boxShadow: "0 2px 12px #0002"
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
              Kostenblock auswählen
            </div>
            <ul>
              {KOSTENBLOECKE.filter(
                (kb) => !kostenbloecke.some((k) => k.kostenblock === kb.nummer)
              ).map((kb) => (
                <li key={kb.nummer} style={{ margin: "12px 0" }}>
                  <button
                    style={{
                      padding: "8px 18px",
                      borderRadius: 7,
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      background: "#f5f5f5",
                      fontWeight: 500
                    }}
                    onClick={() => handleKostenblockHinzufuegen(kb.nummer, kb.name)}
                  >
                    {kb.nummer} – {kb.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              style={{
                marginTop: 12,
                background: "#eee",
                border: "none",
                padding: "6px 18px",
                borderRadius: 7,
                cursor: "pointer"
              }}
              onClick={() => setShowKostenblockModal(false)}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

