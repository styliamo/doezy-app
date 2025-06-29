import React, { useState } from "react";

// Dummy-Daten für HOAI-Kostenblöcke (später aus DB laden)
const COST_BLOCKS = [
  { kg: 610, name: "Möblierung" },
  { kg: 620, name: "Elektro" },
  { kg: 630, name: "Bodenbeläge" },
  { kg: 640, name: "Raumtextilien" },
  { kg: 650, name: "Sonderausstattung" },
];

const CATEGORIES = ["FF&E", "Construction", "Montage"];

export default function Budget() {
  const [blocks, setBlocks] = useState([
    {
      kg: 610,
      name: "Möblierung",
      rows: [
        {
          id: 1,
          artikel: "",
          menge: 1,
          ek: 0,
          kategorie: "FF&E",
          marge: 0,
          vendor: "-",
        },
      ],
      transport: { betrag: 0 },
    },
  ]);
  const [role, setRole] = useState("admin");

  function addBlock() {
    const nextKg = COST_BLOCKS.find(
      b => !blocks.some(block => block.kg === b.kg)
    );
    if (!nextKg) return;
    setBlocks([
      ...blocks,
      {
        kg: nextKg.kg,
        name: nextKg.name,
        rows: [
          {
            id: 1,
            artikel: "",
            menge: 1,
            ek: 0,
            kategorie: "FF&E",
            marge: 0,
            vendor: "-",
          },
        ],
        transport: { betrag: 0 },
      },
    ]);
  }

  function addRow(blockIdx) {
    setBlocks(blocks =>
      blocks.map((block, idx) =>
        idx === blockIdx
          ? {
              ...block,
              rows: [
                ...block.rows,
                {
                  id: block.rows.length + 1,
                  artikel: "",
                  menge: 1,
                  ek: 0,
                  kategorie: "FF&E",
                  marge: 0,
                  vendor: "-",
                },
              ],
            }
          : block
      )
    );
  }

  function setRowValue(blockIdx, rowIdx, key, value) {
    setBlocks(blocks =>
      blocks.map((block, bidx) =>
        bidx === blockIdx
          ? {
              ...block,
              rows: block.rows.map((row, ridx) =>
                ridx === rowIdx
                  ? {
                      ...row,
                      [key]:
                        key === "menge"
                          ? Math.max(1, parseInt(value) || 1)
                          : key === "ek" || key === "marge"
                          ? Math.max(0, parseFloat(value) || 0)
                          : value,
                    }
                  : row
              ),
            }
          : block
      )
    );
  }

  function setTransport(blockIdx, betrag) {
    setBlocks(blocks =>
      blocks.map((block, idx) =>
        idx === blockIdx
          ? { ...block, transport: { betrag: Math.max(0, parseFloat(betrag) || 0) } }
          : block
      )
    );
  }

  function removeRow(blockIdx, rowIdx) {
    setBlocks(blocks =>
      blocks.map((block, idx) =>
        idx === blockIdx
          ? {
              ...block,
              rows: block.rows.length > 1
                ? block.rows.filter((_, ridx) => ridx !== rowIdx)
                : block.rows,
            }
          : block
      )
    );
  }

  // Kalkulationen:
  function calcNum(block, row, idx) {
    // Normale Zeile: 610.1, 610.2
    // Wenn Montage: 610.1.99, 610.2.99
    let num = `${block.kg}.${row.id}`;
    if (row.kategorie === "Montage") num += ".99";
    return num;
  }

  function calcSum(menge, ek, marge) {
    const vk = ek * (1 + (marge || 0) / 100);
    return [ek * menge, vk, vk * menge];
  }

  function sumBlock(block) {
    let ekSum = 0, vkSum = 0;
    block.rows.forEach(row => {
      const [ekSumRow, , vkSumRow] = calcSum(row.menge, row.ek, row.marge);
      ekSum += ekSumRow;
      vkSum += vkSumRow;
    });
    vkSum += block.transport.betrag;
    return { ekSum, vkSum };
  }

  function sumFFEBLOCK(block) {
    let sum = 0;
    block.rows.forEach(row => {
      if (row.kategorie === "FF&E") {
        const [, , vkSumRow] = calcSum(row.menge, row.ek, row.marge);
        sum += vkSumRow;
      }
    });
    return sum;
  }

  // Summen alle Blöcke:
  const totalEk = blocks.reduce((s, b) => s + sumBlock(b).ekSum, 0);
  const totalVk = blocks.reduce((s, b) => s + sumBlock(b).vkSum, 0);
  const totalFFE = blocks.reduce((s, b) => s + sumFFEBLOCK(b), 0);

  return (
    <div className="p-6">
      <div className="flex mb-4 gap-2">
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="vendor">Vendor</option>
          <option value="client">Client</option>
        </select>
        {role === "admin" && (
          <button
            className="px-4 py-2 rounded bg-blue-700 text-white"
            onClick={addBlock}
            disabled={blocks.length >= COST_BLOCKS.length}
          >
            + Kostenblock hinzufügen
          </button>
        )}
      </div>
      {blocks.map((block, blockIdx) => (
        <div key={block.kg} className="mb-10 border rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <strong>
              Kostenblock {block.kg} – {block.name}
            </strong>
            {role === "admin" && (
              <button
                className="text-xs px-2 py-1 ml-2 bg-red-300 text-red-900 rounded"
                onClick={() =>
                  setBlocks(blocks.filter((_, i) => i !== blockIdx))
                }
              >
                Block löschen
              </button>
            )}
          </div>
          <table className="w-full mb-2 border">
            <thead>
              <tr className="bg-gray-100">
                <th>Kostenblock</th>
                <th>Artikel</th>
                <th>Menge</th>
                {role !== "client" && <th>Einzelpreis EK</th>}
                {role !== "client" && <th>Summe EK</th>}
                <th>Kategorie</th>
                {role === "admin" && <th>Marge %</th>}
                {role === "admin" && <th>Vendor</th>}
                <th>VK Einzelpreis</th>
                <th>VK Gesamtpreis</th>
                {role === "admin" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIdx) => {
                const [sumEk, vkEinzel, vkSum] = calcSum(
                  row.menge,
                  row.ek,
                  row.marge
                );
                return (
                  <tr key={rowIdx}>
                    <td className="font-mono">{calcNum(block, row, rowIdx)}</td>
                    <td>
                      <input
                        className="border px-2 py-1 rounded w-full"
                        value={row.artikel}
                        onChange={e =>
                          setRowValue(blockIdx, rowIdx, "artikel", e.target.value)
                        }
                        disabled={role === "client"}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="w-14 px-2 py-1 border rounded"
                        value={row.menge}
                        min={1}
                        onChange={e =>
                          setRowValue(blockIdx, rowIdx, "menge", e.target.value)
                        }
                        disabled={role === "client"}
                      />
                    </td>
                    {role !== "client" && (
                      <>
                        <td>
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border rounded"
                            value={row.ek}
                            min={0}
                            onChange={e =>
                              setRowValue(blockIdx, rowIdx, "ek", e.target.value)
                            }
                            disabled={role === "vendor" && row.vendor !== "Exidation"}
                          />
                        </td>
                        <td>
                          {sumEk.toLocaleString()}
                        </td>
                      </>
                    )}
                    <td>
                      <select
                        value={row.kategorie}
                        onChange={e =>
                          setRowValue(blockIdx, rowIdx, "kategorie", e.target.value)
                        }
                        disabled={role === "client"}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>
                    {role === "admin" && (
                      <>
                        <td>
                          <input
                            type="number"
                            className="w-14 px-2 py-1 border rounded"
                            value={row.marge}
                            min={0}
                            onChange={e =>
                              setRowValue(blockIdx, rowIdx, "marge", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="w-24 px-2 py-1 border rounded"
                            value={row.vendor}
                            onChange={e =>
                              setRowValue(blockIdx, rowIdx, "vendor", e.target.value)
                            }
                          />
                        </td>
                      </>
                    )}
                    <td>{vkEinzel.toLocaleString()}</td>
                    <td>{vkSum.toLocaleString()}</td>
                    {role === "admin" && (
                      <td>
                        <button
                          className="text-xs bg-gray-200 rounded px-2"
                          onClick={() => removeRow(blockIdx, rowIdx)}
                        >
                          X
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Liefer- und Transportkosten als letzte Zeile */}
              <tr className="bg-gray-50">
                <td className="font-mono">{block.kg}.99</td>
                <td>Liefer- und Transportkosten</td>
                <td></td>
                {role !== "client" && <td colSpan={2}></td>}
                <td colSpan={role !== "client" ? (role === "admin" ? 4 : 3) : 3}></td>
                <td>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 border rounded"
                    value={block.transport.betrag}
                    min={0}
                    onChange={e => setTransport(blockIdx, e.target.value)}
                    disabled={role === "vendor"}
                  />
                </td>
                <td>{block.transport.betrag.toLocaleString()}</td>
                {role === "admin" && <td />}
              </tr>
            </tbody>
          </table>
          {/* Summen */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-2">
            <div>
              <strong>KG-Summe:</strong> {sumBlock(block).vkSum.toLocaleString()}
            </div>
            <div>
              <strong>FF&E-Summe:</strong> {sumFFEBLOCK(block).toLocaleString()}
            </div>
          </div>
          {role === "admin" && (
            <div className="flex gap-2 mt-4">
              <button
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-700"
                onClick={() => addRow(blockIdx)}
              >
                + Neue Zeile hinzufügen
              </button>
            </div>
          )}
        </div>
      ))}
      {/* Gesamtsummen */}
      <div className="border-t pt-6 mt-8 space-y-2">
        <div>
          <strong>Gesamtsumme aller Kostenblöcke:</strong> {totalVk.toLocaleString()}
        </div>
        <div>
          <strong>FF&E Gesamtsumme:</strong> {totalFFE.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

