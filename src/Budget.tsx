import React, { useState } from "react";
import { FaTrashAlt, FaPlusCircle } from "react-icons/fa";

const HOAI_BLOCKS = [
  { number: 610, name: "Beleuchtung & Elektroinstallation" },
  { number: 611, name: "Feste Einbauten (Tischlerarbeiten)" },
  { number: 612, name: "Lose Möbel" },
  { number: 613, name: "Bodenbeläge" },
  { number: 614, name: "Wandgestaltung (Maler/Tapezieren)" },
  { number: 615, name: "Sanitärinstallationen" },
  { number: 616, name: "Bett & Heimtextilien" },
  { number: 617, name: "Accessoires" },
  { number: 619, name: "Glas & Spiegel" },
  { number: 800, name: "Projektmanagement/Transport/Spesen" },
];

const CATEGORY_OPTIONS = [
  { value: "FF&E", label: "FF&E" },
  { value: "Construction", label: "Construction" },
  { value: "Montage", label: "Montage" },
];

const VENDORS = [
  { value: "Exidation", label: "Exidation" },
  { value: "Musterfirma", label: "Musterfirma" },
  // Weitere Vendoren...
];

function calcSum(qty: number, price: number) {
  return qty > 0 && price > 0 ? qty * price : 0;
}

function getNextMainPos(blockRows, baseNum) {
  // Zähle bisherige Hauptpositionen (ohne Montage und ohne Transport)
  const mainRows = blockRows.filter(r => !/\.99$/.test(r.pos));
  return `${baseNum}.${mainRows.length + 1}`;
}

function getMontagePos(productPos) {
  return `${productPos}.99`;
}

function getTransportPos(baseNum) {
  return `${baseNum}.99`;
}

function getFFESum(rows) {
  return rows
    .filter(r => r.category === "FF&E")
    .reduce((sum, r) => sum + calcSum(r.qty, r.salePrice), 0);
}

function getTotalSum(rows) {
  return rows.reduce((sum, r) => sum + calcSum(r.qty, r.salePrice), 0);
}

function roleFilter(row, role, myVendor = "") {
  if (role === "admin") return true;
  if (role === "vendor") return row.vendor === myVendor;
  if (role === "client") return true; // Kunde sieht alle Zeilen außer EK/Marge
  return false;
}

export default function Budget() {
  const [role, setRole] = useState("admin");
  const [vendorName] = useState("Exidation");
  const [blocks, setBlocks] = useState([
    {
      baseNum: 610,
      name: "Beleuchtung & Elektroinstallation",
      rows: [
        {
          pos: "610.1",
          desc: "Deckenspots Eingangsbereich und Bad LED",
          qty: 2,
          unit: "Stk",
          category: "Construction",
          vendor: "Exidation",
          purchasePrice: 53,
          salePrice: 106,
        },
        {
          pos: "610.1.99",
          desc: "Montage Deckenspots vor Ort",
          qty: 2,
          unit: "E",
          category: "Montage",
          vendor: "Exidation",
          purchasePrice: 25,
          salePrice: 50,
        },
        {
          pos: "610.2",
          desc: "Rond Steckdosen inkl. Wandhalterungen",
          qty: 6,
          unit: "Stk",
          category: "Construction",
          vendor: "Exidation",
          purchasePrice: 61,
          salePrice: 364,
        },
        {
          pos: "610.2.99",
          desc: "Montage Steckdosen",
          qty: 6,
          unit: "E",
          category: "Montage",
          vendor: "Exidation",
          purchasePrice: 25,
          salePrice: 151,
        },
      ],
      transport: {
        pos: "610.99",
        desc: "Transport und Handling der Beleuchtung & Elektroinstallation",
        qty: 1,
        unit: "E",
        purchasePrice: 290,
        salePrice: 290,
      },
    },
  ]);

  const [addingBlock, setAddingBlock] = useState(false);
  const [blockToAdd, setBlockToAdd] = useState(HOAI_BLOCKS[1].number);

  // ----- Kostenblock hinzufügen -----
  const handleAddBlock = () => {
    const block = HOAI_BLOCKS.find(b => b.number === Number(blockToAdd));
    if (!block) return;
    if (blocks.some(b => b.baseNum === block.number)) return;
    setBlocks(prev => {
      const all = [
        ...prev,
        {
          baseNum: block.number,
          name: block.name,
          rows: [],
          transport: {
            pos: `${block.number}.99`,
            desc: `Transport und Handling der ${block.name}`,
            qty: 1,
            unit: "E",
            purchasePrice: 0,
            salePrice: 0,
          }
        }
      ];
      return all.sort((a, b) => a.baseNum - b.baseNum);
    });
    setAddingBlock(false);
  };

  // ----- Zeile hinzufügen -----
  const handleAddRow = (blockIndex) => {
    setBlocks(prev => {
      const blocksCopy = [...prev];
      const block = blocksCopy[blockIndex];
      const nextPos = getNextMainPos(block.rows, block.baseNum);
      block.rows.push({
        pos: nextPos,
        desc: "",
        qty: 1,
        unit: "",
        category: "FF&E",
        vendor: "",
        purchasePrice: 0,
        salePrice: 0,
      });
      return blocksCopy;
    });
  };

  // ----- Montagezeile direkt nach Hauptzeile -----
  const handleAddMontageRow = (blockIndex, rowIndex) => {
    setBlocks(prev => {
      const blocksCopy = [...prev];
      const block = blocksCopy[blockIndex];
      const basePos = block.rows[rowIndex].pos;
      if (block.rows.some(r => r.pos === getMontagePos(basePos))) return blocksCopy;
      block.rows.splice(rowIndex + 1, 0, {
        pos: getMontagePos(basePos),
        desc: `Montage ${block.rows[rowIndex].desc}`,
        qty: block.rows[rowIndex].qty,
        unit: "E",
        category: "Montage",
        vendor: block.rows[rowIndex].vendor,
        purchasePrice: 0,
        salePrice: 0,
      });
      return blocksCopy;
    });
  };

  // ----- Zeile ändern -----
  const handleChangeRow = (blockIndex, rowIndex, key, value) => {
    setBlocks(prev => {
      const blocksCopy = [...prev];
      const block = blocksCopy[blockIndex];
      block.rows[rowIndex][key] = value;

      // Positionsnummer automatisch anpassen
      if (key === "category" && value === "Montage") {
        const basePos = block.rows[rowIndex].pos.split(".")[0] + "." + block.rows[rowIndex].pos.split(".")[1];
        block.rows[rowIndex].pos = getMontagePos(basePos);
      }
      if (key === "category" && value !== "Montage" && block.rows[rowIndex].pos.endsWith(".99")) {
        // Finde nächste freie Hauptnummer
        const mainRows = block.rows.filter(r => !r.pos.endsWith(".99"));
        const nextNum = mainRows.length + 1;
        block.rows[rowIndex].pos = `${block.baseNum}.${nextNum}`;
      }
      return blocksCopy;
    });
  };

  // ----- Zeile löschen -----
  const handleDeleteRow = (blockIndex, rowIndex) => {
    setBlocks(prev => {
      const blocksCopy = [...prev];
      blocksCopy[blockIndex].rows.splice(rowIndex, 1);
      return blocksCopy;
    });
  };

  // ----- Block löschen -----
  const handleDeleteBlock = (blockIndex) => {
    setBlocks(prev => prev.filter((_, i) => i !== blockIndex));
  };

  // ----- Transportzeile ändern -----
  const handleTransportChange = (blockIndex, key, value) => {
    setBlocks(prev => {
      const blocksCopy = [...prev];
      blocksCopy[blockIndex].transport[key] = value;
      return blocksCopy;
    });
  };

  return (
    <div className="max-w-screen-lg mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Budget nach HOAI / DIN 276</h1>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border p-1 rounded ml-4"
        >
          <option value="admin">Admin</option>
          <option value="vendor">Vendor</option>
          <option value="client">Client</option>
        </select>
        {role === "admin" && (
          <button
            className="flex items-center px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 ml-4"
            onClick={() => setAddingBlock(true)}
          >
            <FaPlusCircle className="mr-2" /> Kostenblock hinzufügen
          </button>
        )}
      </div>

      {addingBlock && (
        <div className="mb-4 flex gap-4 items-center">
          <select
            className="p-2 border rounded"
            value={blockToAdd}
            onChange={e => setBlockToAdd(Number(e.target.value))}
          >
            {HOAI_BLOCKS.map(block =>
              blocks.some(b => b.baseNum === block.number) ? null : (
                <option key={block.number} value={block.number}>
                  {block.number} {block.name}
                </option>
              )
            )}
          </select>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-xl"
            onClick={handleAddBlock}
          >Hinzufügen</button>
          <button
            className="px-4 py-2 bg-gray-200 rounded-xl"
            onClick={() => setAddingBlock(false)}
          >Abbrechen</button>
        </div>
      )}

      {blocks.map((block, blockIndex) => (
        <div key={block.baseNum} className="border rounded-2xl mb-8 p-4 shadow-lg bg-white">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-xl font-bold">{block.baseNum}</span>{" "}
              <span className="text-lg text-gray-700">{block.name}</span>
            </div>
            {role === "admin" && (
              <button
                className="text-red-600 hover:text-red-900"
                title="Block löschen"
                onClick={() => handleDeleteBlock(blockIndex)}
              >
                <FaTrashAlt />
              </button>
            )}
          </div>

          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">Pos</th>
                <th className="px-2 py-1 text-left">Beschreibung</th>
                <th className="px-2 py-1">Menge</th>
                <th className="px-2 py-1">Einheit</th>
                {(role !== "client") && (
                  <>
                    <th className="px-2 py-1">Kategorie</th>
                    <th className="px-2 py-1">Vendor</th>
                  </>
                )}
                {(role === "admin") && (
                  <th className="px-2 py-1">EK (€)</th>
                )}
                <th className="px-2 py-1">VK (€)</th>
                <th className="px-2 py-1">Summe (€)</th>
                {role === "admin" && <th />}
              </tr>
            </thead>
            <tbody>
              {block.rows
                .filter(row => roleFilter(row, role, vendorName))
                .map((row, rowIndex) => (
                <tr key={row.pos} className="bg-gray-50">
                  <td className="font-mono px-2 py-1">{row.pos}</td>
                  <td>
                    <input
                      className="w-full px-2 py-1 border rounded"
                      value={row.desc}
                      onChange={e =>
                        handleChangeRow(blockIndex, rowIndex, "desc", e.target.value)
                      }
                      disabled={role !== "admin"}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="w-16 px-2 py-1 border rounded"
                      min={1}
                      value={row.qty}
                      onChange={e =>
                        handleChangeRow(blockIndex, rowIndex, "qty", Math.max(1, Number(e.target.value)))
                      }
                      disabled={role !== "admin"}
                    />
                  </td>
                  <td>
                    <input
                      className="w-12 px-2 py-1 border rounded"
                      value={row.unit}
                      onChange={e =>
                        handleChangeRow(blockIndex, rowIndex, "unit", e.target.value)
                      }
                      disabled={role !== "admin"}
                    />
                  </td>
                  {(role !== "client") && (
                    <>
                      <td>
                        <select
                          className="px-2 py-1 border rounded"
                          value={row.category}
                          onChange={e =>
                            handleChangeRow(blockIndex, rowIndex, "category", e.target.value)
                          }
                          disabled={role !== "admin"}
                        >
                          {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="px-2 py-1 border rounded"
                          value={row.vendor}
                          onChange={e =>
                            handleChangeRow(blockIndex, rowIndex, "vendor", e.target.value)
                          }
                          disabled={role !== "admin"}
                        >
                          <option value="">–</option>
                          {VENDORS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    </>
                  )}
                  {(role === "admin") && (
                    <td>
                      <input
                        type="number"
                        className="w-20 px-2 py-1 border rounded"
                        value={row.purchasePrice}
                        onChange={e =>
                          handleChangeRow(blockIndex, rowIndex, "purchasePrice", Number(e.target.value))
                        }
                        disabled={role !== "admin"}
                      />
                    </td>
                  )}
                  <td>
                    <input
                      type="number"
                      className="w-20 px-2 py-1 border rounded"
                      value={row.salePrice}
                      onChange={e =>
                        handleChangeRow(blockIndex, rowIndex, "salePrice", Number(e.target.value))
                      }
                      disabled={role !== "admin"}
                    />
                  </td>
                  <td className="font-mono px-2 py-1">
                    {calcSum(row.qty, row.salePrice).toLocaleString()}
                  </td>
                  {role === "admin" && (
                    <td>
                      <button
                        className="text-red-500 hover:text-red-800"
                        title="Zeile löschen"
                        onClick={() => handleDeleteRow(blockIndex, rowIndex)}
                      >
                        <FaTrashAlt />
                      </button>
                      <button
                        className="text-blue-500 hover:text-blue-800 ml-2"
                        title="Montagezeile hinzufügen"
                        onClick={() => handleAddMontageRow(blockIndex, rowIndex)}
                        disabled={row.category === "Montage" || block.rows.some(r => r.pos === getMontagePos(row.pos))}
                      >
                        <FaPlusCircle />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Transport-Zeile */}
              <tr className="bg-yellow-50 font-semibold">
                <td className="font-mono px-2 py-1">{block.transport.pos}</td>
                <td>
                  <input
                    className="w-full px-2 py-1 border rounded"
                    value={block.transport.desc}
                    onChange={e =>
                      handleTransportChange(blockIndex, "desc", e.target.value)
                    }
                    disabled={role !== "admin"}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border rounded"
                    min={1}
                    value={block.transport.qty}
                    onChange={e =>
                      handleTransportChange(blockIndex, "qty", Math.max(1, Number(e.target.value)))
                    }
                    disabled={role !== "admin"}
                  />
                </td>
                <td>
                  <input
                    className="w-12 px-2 py-1 border rounded"
                    value={block.transport.unit}
                    onChange={e =>
                      handleTransportChange(blockIndex, "unit", e.target.value)
                    }
                    disabled={role !== "admin"}
                  />
                </td>
                {role !== "client" && <td colSpan={4} />}
                {role === "client" && (
                  <>
                    <td />
                    <td className="font-mono px-2 py-1">
                      {calcSum(block.transport.qty, block.transport.salePrice).toLocaleString()}
                    </td>
                  </>
                )}
                {role === "admin" && <td />}
              </tr>
            </tbody>
          </table>

          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-2">
            <div>
              <strong>KG-Summe:</strong>{" "}
              {(
                getTotalSum(block.rows) +
                calcSum(block.transport.qty, block.transport.salePrice)
              ).toLocaleString()}
            </div>
            <div>
              <strong>FF&E-Summe:</strong>{" "}
              {getFFESum(block.rows).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {role === "admin" && (
              <button
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-700"
                onClick={() => handleAddRow(blockIndex)}
              >
                <FaPlusCircle className="mr-2" /> Neue Zeile hinzufügen
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Gesamtsummen für alle Kostenblöcke */}
      <div className="border-t pt-6 mt-8 space-y-2">
        <div>
          <strong>Gesamtsumme aller Kostenblöcke:</strong>{" "}
          {blocks
            .reduce(
              (sum, block) =>
                sum +
                getTotalSum(block.rows) +
                calcSum(block.transport.qty, block.transport.salePrice),
              0
            )
            .toLocaleString()}
        </div>
        <div>
          <strong>FF&E Gesamtsumme:</strong>{" "}
          {blocks.reduce((sum, block) => sum + getFFESum(block.rows), 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

