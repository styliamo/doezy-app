import React, { useState } from "react";

const initialBlocks = [
  {
    id: 610,
    name: "Möblierung",
    positions: [
      { pos: 1, artikel: "", menge: 1, ek: 0, kategorie: "FF&E", marge: 0, vendor: "" }
    ],
    liefer: { label: "Liefer- und Transportkosten", ek: 0 }
  }
];

function getPositionNum(blockId: number, pos: number, montage?: boolean) {
  return montage ? `${blockId}.${pos}.99` : `${blockId}.${pos}`;
}

export default function Budget() {
  const [blocks, setBlocks] = useState(initialBlocks);

  const handleAddPos = (blockIdx: number) => {
    setBlocks(blocks =>
      blocks.map((b, i) =>
        i === blockIdx
          ? {
              ...b,
              positions: [
                ...b.positions,
                { pos: b.positions.length + 1, artikel: "", menge: 1, ek: 0, kategorie: "FF&E", marge: 0, vendor: "" }
              ]
            }
          : b
      )
    );
  };

  const handleBlockChange = (blockIdx: number, posIdx: number, key: string, value: any) => {
    setBlocks(blocks =>
      blocks.map((b, i) =>
        i === blockIdx
          ? {
              ...b,
              positions: b.positions.map((p, j) =>
                j === posIdx ? { ...p, [key]: value } : p
              )
            }
          : b
      )
    );
  };

  const getSum = (block: any) =>
    block.positions.reduce((sum: number, p: any) => sum + (Number(p.ek) * Number(p.menge)), 0) +
    Number(block.liefer.ek);

  return (
    <div style={{margin:32}}>
      <h2>DOSI Dashboard – Budget</h2>
      {blocks.map((block, blockIdx) => (
        <div key={block.id} style={{border: "1px solid #aaa", borderRadius:8, marginBottom:32, padding:24}}>
          <div style={{display:"flex", alignItems:"center", marginBottom:8}}>
            <h3 style={{marginRight:16, fontSize:22}}>
              Kostenblock {block.id} – {block.name}
            </h3>
          </div>
          <table style={{width:"100%", marginBottom:16}}>
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
              </tr>
            </thead>
            <tbody>
              {block.positions.map((p: any, posIdx: number) => (
                <tr key={posIdx}>
                  <td>{getPositionNum(block.id, p.pos, p.kategorie === "Montage")}</td>
                  <td>
                    <input value={p.artikel} onChange={e=>handleBlockChange(blockIdx, posIdx, "artikel", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" min="1" value={p.menge} onChange={e=>handleBlockChange(blockIdx, posIdx, "menge", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" min="0" value={p.ek} onChange={e=>handleBlockChange(blockIdx, posIdx, "ek", e.target.value)} />
                  </td>
                  <td>{Number(p.ek) * Number(p.menge)}</td>
                  <td>
                    <select value={p.kategorie} onChange={e=>handleBlockChange(blockIdx, posIdx, "kategorie", e.target.value)}>
                      <option>FF&E</option>
                      <option>Construction</option>
                      <option>Montage</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" min="0" value={p.marge} onChange={e=>handleBlockChange(blockIdx, posIdx, "marge", e.target.value)} />
                  </td>
                  <td>
                    <input value={p.vendor} onChange={e=>handleBlockChange(blockIdx, posIdx, "vendor", e.target.value)} />
                  </td>
                </tr>
              ))}
              <tr>
                <td>{block.id}.99</td>
                <td>{block.liefer.label}</td>
                <td>1</td>
                <td>
                  <input type="number" min="0" value={block.liefer.ek} onChange={e=>setBlocks(blocks =>
                    blocks.map((b,i) => i === blockIdx ? { ...b, liefer: { ...b.liefer, ek: e.target.value } } : b))} />
                </td>
                <td>{block.liefer.ek}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
          <button onClick={() => handleAddPos(blockIdx)}>+ Zeile</button>
          <div style={{marginTop:16, fontWeight:"bold"}}>
            KG-Summe: {getSum(block)} €
          </div>
        </div>
      ))}
    </div>
  );
}

