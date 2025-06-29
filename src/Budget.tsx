import React, { useState } from "react";

const HOAI_KOSTENBLOECKE = [
  { nr: 400, label: "Technische Anlagen" },
  { nr: 610, label: "Möblierung" },
  { nr: 620, label: "Elektro" },
  { nr: 630, label: "Bodenbeläge" },
  { nr: 640, label: "Raumtextilien" },
  { nr: 650, label: "Sonderausstattung" }
];

const VENDORS = ["–", "Exidation", "Visage", "Testfirma"];

type Kategorie = "FF&E" | "Construction" | "Montage";

function getPositionsNummer(block: number, index: number, kategorie: Kategorie) {
  if (kategorie === "Montage") {
    return `${block}.${index + 1}.99`;
  }
  return `${block}.${index + 1}`;
}

function Budget() {
  const [role, setRole] = useState<"Admin" | "Vendor" | "Client">("Admin");
  const [activeVendor, setActiveVendor] = useState("–");
  const [blocks, setBlocks] = useState([
    {
      nr: 610,
      label: "Möblierung",
      zeilen: [
        { artikel: "", menge: 1, ek: 0, kategorie: "FF&E" as Kategorie, marge: 0, vendor: "–" },
      ],
      lieferung: { menge: 1, ek: 0 }, // nur eine Transportzeile pro Block
    },
  ]);

  function handleAddBlock() {
    const usedNrs = blocks.map((b) => b.nr);
    const available = HOAI_KOSTENBLOECKE.filter((k) => !usedNrs.includes(k.nr));
    if (available.length === 0) return;
    const next = available[0];
    setBlocks([
      ...blocks,
      {
        nr: next.nr,
        label: next.label,
        zeilen: [
          { artikel: "", menge: 1, ek: 0, kategorie: "FF&E" as Kategorie, marge: 0, vendor: "–" },
        ],
        lieferung: { menge: 1, ek: 0 },
      },
    ]);
  }

  function handleAddZeile(bIndex: number) {
    setBlocks((blocks) =>
      blocks.map((b, i) =>
        i !== bIndex
          ? b
          : {
              ...b,
              zeilen: [
                ...b.zeilen,
                { artikel: "", menge: 1, ek: 0, kategorie: "FF&E" as Kategorie, marge: 0, vendor: "–" },
              ],
            }
      )
    );
  }

  function handleDeleteZeile(bIndex: number, zIndex: number) {
    setBlocks((blocks) =>
      blocks.map((b, i) =>
        i !== bIndex ? b : { ...b, zeilen: b.zeilen.filter((_, j) => j !== zIndex) }
      )
    );
  }

  function handleDeleteBlock(bIndex: number) {
    setBlocks((blocks) => blocks.filter((_, i) => i !== bIndex));
  }

  function handleChangeZeile(bIndex: number, zIndex: number, key: string, value: any) {
    setBlocks((blocks) =>
      blocks.map((b, i) =>
        i !== bIndex
          ? b
          : {
              ...b,
              zeilen: b.zeilen.map((z, j) =>
                j !== zIndex
                  ? z
                  : { ...z, [key]: key === "menge" || key === "ek" || key === "marge" ? Number(value) : value }
              ),
            }
      )
    );
  }

  function handleChangeLieferung(bIndex: number, key: string, value: any) {
    setBlocks((blocks) =>
      blocks.map((b, i) =>
        i !== bIndex ? b : { ...b, lieferung: { ...b.lieferung, [key]: Number(value) } }
      )
    );
  }

  function getSummeEK(zeile: any) {
    return zeile.menge * zeile.ek;
  }
  function getSummeVK(zeile: any) {
    return zeile.menge * (zeile.ek + (zeile.ek * zeile.marge) / 100);
  }
  function blockSumme(block: any) {
    return block.zeilen.reduce((sum: number, z: any) => sum + getSummeVK(z), 0) + block.lieferung.ek;
  }
  function blockFFESumme(block: any) {
    return block.zeilen.filter((z: any) => z.kategorie === "FF&E").reduce((sum: number, z: any) => sum + getSummeVK(z), 0);
  }

  // Filter für Sichtbarkeit nach Rolle
  function zeileVisible(z: any) {
    if (role === "Admin") return true;
    if (role === "Vendor") return z.vendor === activeVendor;
    if (role === "Client") return true;
    return false;
  }
  function lieferungVisible() {
    // Admin & Client sehen Lieferung, Vendor nicht
    return role !== "Vendor";
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 10 }}>
        <label>Rolle: </label>
        <select value={role} onChange={e => setRole(e.target.value as any)} style={{ marginRight: 8 }}>
          <option>Admin</option>
          <option>Vendor</option>
          <option>Client</option>
        </select>
        {role === "Vendor" && (
          <>
            <label>Vendor: </label>
            <select value={activeVendor} onChange={e => setActiveVendor(e.target.value)}>
              {VENDORS.map(v => <option key={v}>{v}</option>)}
            </select>
          </>
        )}
        {role === "Admin" && (
          <button onClick={handleAddBlock} style={{ marginLeft: 16, fontWeight: 700 }}>+ Kostenblock hinzufügen</button>
        )}
      </div>
      {blocks.map((block, bIndex) => (
        <div key={block.nr} style={{ border: "1px solid #aaa", borderRadius: 7, marginBottom: 28, padding: 12, background: "#fff" }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
            Kostenblock {block.nr} – {block.label}
            {role === "Admin" && (
              <button style={{ marginLeft: 8, fontSize: 14 }} onClick={() => handleDeleteBlock(bIndex)}>Löschen</button>
            )}
          </div>
          <table style={{ width: "100%", fontSize: 15 }}>
            <thead>
              <tr>
                <th>Kostenblock</th>
                <th>Artikel</th>
                <th>Menge</th>
                {role !== "Client" && <th>Einzelpreis EK</th>}
                {role !== "Client" && <th>Summe EK</th>}
                <th>Kategorie</th>
                {role === "Admin" && <th>Marge %</th>}
                {role === "Admin" && <th>Vendor</th>}
                <th>VK Einzelpreis</th>
                <th>VK Gesamtpreis</th>
                {role === "Admin" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {block.zeilen.map((z, zIndex) =>
                zeileVisible(z) ? (
                  <tr key={zIndex}>
                    <td>{getPositionsNummer(block.nr, zIndex, z.kategorie)}</td>
                    <td>
                      <input
                        value={z.artikel}
                        onChange={e => handleChangeZeile(bIndex, zIndex, "artikel", e.target.value)}
                        style={{ width: 130 }}
                        disabled={role === "Vendor" || role === "Client"}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={z.menge}
                        onChange={e => handleChangeZeile(bIndex, zIndex, "menge", Math.max(1, Number(e.target.value)))}
                        style={{ width: 44 }}
                        disabled={role === "Vendor" || role === "Client"}
                      />
                    </td>
                    {role !== "Client" && (
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={z.ek}
                          onChange={e => handleChangeZeile(bIndex, zIndex, "ek", Number(e.target.value))}
                          style={{ width: 70 }}
                          disabled={
                            role === "Vendor"
                              ? activeVendor !== z.vendor
                              : role === "Client"
                          }
                        />
                      </td>
                    )}
                    {role !== "Client" && (
                      <td>{getSummeEK(z)}</td>
                    )}
                    <td>
                      <select
                        value={z.kategorie}
                        onChange={e => handleChangeZeile(bIndex, zIndex, "kategorie", e.target.value)}
                        disabled={role === "Vendor" || role === "Client"}
                      >
                        <option>FF&E</option>
                        <option>Construction</option>
                        <option>Montage</option>
                      </select>
                    </td>
                    {role === "Admin" && (
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={z.marge}
                          onChange={e => handleChangeZeile(bIndex, zIndex, "marge", Number(e.target.value))}
                          style={{ width: 45 }}
                        />
                      </td>
                    )}
                    {role === "Admin" && (
                      <td>
                        <select
                          value={z.vendor}
                          onChange={e => handleChangeZeile(bIndex, zIndex, "vendor", e.target.value)}
                        >
                          {VENDORS.map(v => <option key={v}>{v}</option>)}
                        </select>
                      </td>
                    )}
                    <td>{z.ek + (z.ek * z.marge) / 100}</td>
                    <td>{getSummeVK(z)}</td>
                    {role === "Admin" && (
                      <td>
                        <button onClick={() => handleDeleteZeile(bIndex, zIndex)}>X</button>
                      </td>
                    )}
                  </tr>
                ) : null
              )}
              {lieferungVisible() && (
                <tr>
                  <td>{block.nr}.99</td>
                  <td>Liefer- und Transportkosten</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={block.lieferung.menge}
                      onChange={e => handleChangeLieferung(bIndex, "menge", Math.max(1, Number(e.target.value)))}
                      style={{ width: 44 }}
                      disabled={role !== "Admin"}
                    />
                  </td>
                  {role !== "Client" && (
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={block.lieferung.ek}
                        onChange={e => handleChangeLieferung(bIndex, "ek", Number(e.target.value))}
                        style={{ width: 70 }}
                        disabled={role !== "Admin"}
                      />
                    </td>
                  )}
                  {role !== "Client" && (
                    <td>{block.lieferung.menge * block.lieferung.ek}</td>
                  )}
                  <td>-</td>
                  {role === "Admin" && <td>-</td>}
                  {role === "Admin" && <td>-</td>}
                  <td>-</td>
                  <td>{block.lieferung.menge * block.lieferung.ek}</td>
                  {role === "Admin" && <td></td>}
                </tr>
              )}
            </tbody>
          </table>
          {role === "Admin" && (
            <button style={{ marginTop: 8 }} onClick={() => handleAddZeile(bIndex)}>+ Zeile</button>
          )}
          <div style={{ marginTop: 8 }}>
            <b>KG-Summe:</b> {blockSumme(block)} €<br />
            <b>FF&E-Summe:</b> {blockFFESumme(block)} €
          </div>
        </div>
      ))}
      <div style={{ marginTop: 18, fontWeight: 700 }}>
        GESAMTSUMME: {blocks.reduce((s, b) => s + blockSumme(b), 0)} €
      </div>
      <div>
        FF&E-GESAMTSUMME: {blocks.reduce((s, b) => s + blockFFESumme(b), 0)} €
      </div>
    </div>
  );
}

export default Budget;

