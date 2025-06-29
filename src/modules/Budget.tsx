import React, { useState, useMemo } from "react";

const MOCK_USERS = [
  { id: "u1", name: "Vendor A", role: "vendor" },
  { id: "u2", name: "Vendor B", role: "vendor" },
  { id: "u3", name: "Admin", role: "admin" },
  { id: "u4", name: "Kunde", role: "client" },
];

const CATEGORIES = ["FF&E", "Construction", "Montage"] as const;
type Category = (typeof CATEGORIES)[number];
type UserRole = "admin" | "vendor" | "client";

type CostBlock = {
  id: string;
  nr: string;
  bezeichnung: string;
  open: boolean;
  items: CostItem[];
};

type CostItem = {
  id: string;
  posNr: number;
  description: string;
  menge: number;
  einheit: string;
  einkaufspreis: number;
  marge: number;
  kategorie: Category;
  assignedUser: string | null;
};

type BudgetProps = {
  userRole: UserRole;
  userId: string;
  users?: { id: string; name: string; role: string }[];
  transportPercent?: number;
};

const generatePosNr = (blockNr: string, idx: number) => `${blockNr}.${idx + 1}`;

const emptyItem = (blockNr: string, posNr: number): CostItem => ({
  id: Math.random().toString(36).slice(2),
  posNr,
  description: "",
  menge: 1,
  einheit: "",
  einkaufspreis: 0,
  marge: 0.15,
  kategorie: "FF&E",
  assignedUser: null,
});

const initialBlocks = [
  {
    id: "b1",
    nr: "610",
    bezeichnung: "Baukonstruktionen",
    open: true,
    items: [emptyItem("610", 1)],
  },
];

const Budget: React.FC<BudgetProps> = ({
  userRole,
  userId,
  users = MOCK_USERS,
  transportPercent = 0.05,
}) => {
  const [blocks, setBlocks] = useState<CostBlock[]>(initialBlocks);

  const vendorList = useMemo(
    () => users.filter((u) => u.role === "vendor"),
    [users]
  );

  const canEdit = userRole === "admin";
  const canEditEinkaufspreis = (item: CostItem) =>
    userRole === "vendor" && item.assignedUser === userId;

  const addBlock = () => {
    const nr = prompt("Kostenblock-Nummer (z. B. 630):", "");
    const bezeichnung = prompt("Bezeichnung:", "");
    if (!nr || !bezeichnung) return;
    setBlocks([
      ...blocks,
      {
        id: Math.random().toString(36).slice(2),
        nr,
        bezeichnung,
        open: true,
        items: [emptyItem(nr, 1)],
      },
    ]);
  };
  const addItem = (blockIdx: number) => {
    setBlocks((prev) =>
      prev.map((block, idx) =>
        idx === blockIdx
          ? {
              ...block,
              items: [
                ...block.items,
                emptyItem(block.nr, block.items.length + 1),
              ],
            }
          : block
      )
    );
  };
  const removeItem = (blockIdx: number, itemIdx: number) => {
    setBlocks((prev) =>
      prev.map((block, idx) =>
        idx === blockIdx
          ? { ...block, items: block.items.filter((_, i) => i !== itemIdx) }
          : block
      )
    );
  };
  const removeBlock = (blockIdx: number) => {
    setBlocks((prev) => prev.filter((_, idx) => idx !== blockIdx));
  };
  const toggleBlock = (blockIdx: number) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === blockIdx ? { ...b, open: !b.open } : b))
    );
  };
  const onItemChange = (
    blockIdx: number,
    itemIdx: number,
    field: keyof CostItem,
    value: any
  ) => {
    setBlocks((prev) =>
      prev.map((block, bIdx) =>
        bIdx === blockIdx
          ? {
              ...block,
              items: block.items.map((item, iIdx) =>
                iIdx === itemIdx ? { ...item, [field]: value } : item
              ),
            }
          : block
      )
    );
  };
  const onBlockMetaChange = (
    blockIdx: number,
    field: "nr" | "bezeichnung",
    value: string
  ) => {
    setBlocks((prev) =>
      prev.map((block, idx) =>
        idx === blockIdx ? { ...block, [field]: value } : block
      )
    );
  };

  function getVerkaufspreis(item: CostItem) {
    return item.einkaufspreis * (1 + item.marge);
  }
  function rowSum(item: CostItem) {
    return getVerkaufspreis(item) * item.menge;
  }
  function blockSum(block: CostBlock) {
    return block.items.reduce((s, i) => s + rowSum(i), 0);
  }
  function blockTransport(block: CostBlock) {
    return blockSum(block) * transportPercent;
  }
  function blockSumTotal(block: CostBlock) {
    return blockSum(block) + blockTransport(block);
  }
  function projectSum() {
    return blocks.reduce((sum, b) => sum + blockSumTotal(b), 0);
  }

  function showEinkaufspreis(item: CostItem) {
    return userRole === "admin" || (userRole === "vendor" && item.assignedUser === userId);
  }
  function showMarge() {
    return userRole === "admin";
  }
  function showVerkaufspreis() {
    return userRole !== "vendor" || userRole === "admin";
  }
  function filterItems(block: CostBlock) {
    if (userRole === "vendor") {
      return block.items.filter((i) => i.assignedUser === userId);
    }
    if (userRole === "client") {
      return block.items.filter((i) => i.assignedUser !== null);
    }
    return block.items;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 p-4">
      <div className="flex items-center mb-6 justify-between">
        <h2 className="text-2xl font-bold">Budget-Modul (Kostenblöcke nach HOAI/DIN 276)</h2>
        {canEdit && (
          <button
            onClick={addBlock}
            className="bg-blue-700 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-800"
          >
            + Kostenblock
          </button>
        )}
      </div>
      <div>
        {blocks.map((block, blockIdx) => (
          <div
            key={block.id}
            className="mb-6 border rounded-2xl shadow bg-white"
          >
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-lg font-semibold"
              onClick={() => toggleBlock(blockIdx)}
              type="button"
            >
              <span className="flex items-center gap-2">
                {canEdit ? (
                  <input
                    value={block.nr}
                    onChange={(e) =>
                      onBlockMetaChange(blockIdx, "nr", e.target.value)
                    }
                    className="w-20 border-b-2 font-bold text-lg text-blue-900 mr-2"
                  />
                ) : (
                  <span className="font-bold mr-2">{block.nr}</span>
                )}
                {canEdit ? (
                  <input
                    value={block.bezeichnung}
                    onChange={(e) =>
                      onBlockMetaChange(blockIdx, "bezeichnung", e.target.value)
                    }
                    className="border-b-2 text-lg text-gray-800"
                  />
                ) : (
                  <span>{block.bezeichnung}</span>
                )}
              </span>
              <span>{block.open ? "▲" : "▼"}</span>
            </button>
            {block.open && (
              <div className="p-4">
                {/* Tabellenkopf */}
                <div className="grid grid-cols-11 gap-2 font-semibold border-b pb-2">
                  <div>Pos</div>
                  <div>Beschreibung</div>
                  <div>Menge</div>
                  <div>Einheit</div>
                  {showEinkaufspreis({assignedUser: null} as any) && <div>EK Einzel</div>}
                  {showMarge() && <div>Marge</div>}
                  {showVerkaufspreis() && <div>VK Einzel</div>}
                  {showVerkaufspreis() && <div>VK Gesamt</div>}
                  <div>Kategorie</div>
                  <div>Lieferant</div>
                  {canEdit && <div>Aktion</div>}
                </div>
                {/* Zeilen */}
                {filterItems(block).map((item, itemIdx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-11 gap-2 py-1 items-center"
                  >
                    {/* Positionsnummer */}
                    <div>
                      <span>
                        {generatePosNr(block.nr, itemIdx)}
                      </span>
                    </div>
                    {/* Beschreibung */}
                    <div>
                      <input
                        type="text"
                        value={item.description}
                        className="w-full border rounded px-2"
                        onChange={(e) =>
                          canEdit &&
                          onItemChange(
                            blockIdx,
                            itemIdx,
                            "description",
                            e.target.value
                          )
                        }
                        disabled={!canEdit}
                      />
                    </div>
                    {/* Menge */}
                    <div>
                      <input
                        type="number"
                        value={item.menge}
                        min={1}
                        className="w-16 border rounded px-1"
                        onChange={(e) =>
                          (canEdit || canEditEinkaufspreis(item)) &&
                          onItemChange(
                            blockIdx,
                            itemIdx,
                            "menge",
                            Number(e.target.value)
                          )
                        }
                        disabled={!(canEdit || canEditEinkaufspreis(item))}
                      />
                    </div>
                    {/* Einheit */}
                    <div>
                      <input
                        type="text"
                        value={item.einheit}
                        className="w-16 border rounded px-1"
                        onChange={(e) =>
                          canEdit &&
                          onItemChange(
                            blockIdx,
                            itemIdx,
                            "einheit",
                            e.target.value
                          )
                        }
                        disabled={!canEdit}
                      />
                    </div>
                    {/* Einkaufspreis */}
                    {showEinkaufspreis(item) && (
                      <div>
                        <input
                          type="number"
                          value={item.einkaufspreis}
                          min={0}
                          step="0.01"
                          className="w-24 border rounded px-1"
                          onChange={(e) =>
                            (canEdit || canEditEinkaufspreis(item)) &&
                            onItemChange(
                              blockIdx,
                              itemIdx,
                              "einkaufspreis",
                              Number(e.target.value)
                            )
                          }
                          disabled={!(canEdit || canEditEinkaufspreis(item))}
                        />
                      </div>
                    )}
                    {/* Marge */}
                    {showMarge() && (
                      <div>
                        <input
                          type="number"
                          value={item.marge}
                          min={0}
                          max={1}
                          step="0.01"
                          className="w-16 border rounded px-1"
                          onChange={(e) =>
                            canEdit &&
                            onItemChange(
                              blockIdx,
                              itemIdx,
                              "marge",
                              Number(e.target.value)
                            )
                          }
                          disabled={!canEdit}
                        />
                      </div>
                    )}
                    {/* VK Einzel */}
                    {showVerkaufspreis() && (
                      <div>
                        {getVerkaufspreis(item).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    )}
                    {/* VK Gesamt */}
                    {showVerkaufspreis() && (
                      <div>
                        {rowSum(item).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </div>
                    )}
                    {/* Kategorie */}
                    <div>
                      {canEdit ? (
                        <select
                          value={item.kategorie}
                          className="border rounded px-2"
                          onChange={(e) =>
                            onItemChange(
                              blockIdx,
                              itemIdx,
                              "kategorie",
                              e.target.value as Category
                            )
                          }
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{item.kategorie}</span>
                      )}
                    </div>
                    {/* Lieferant */}
                    <div>
                      {canEdit ? (
                        <select
                          value={item.assignedUser ?? ""}
                          className="border rounded px-2"
                          onChange={(e) =>
                            onItemChange(
                              blockIdx,
                              itemIdx,
                              "assignedUser",
                              e.target.value
                            )
                          }
                        >
                          <option value="">–</option>
                          {vendorList.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>
                          {vendorList.find((v) => v.id === item.assignedUser)?.name || "–"}
                        </span>
                      )}
                    </div>
                    {/* Aktion */}
                    {canEdit && (
                      <div>
                        <button
                          className="text-red-600 px-2"
                          onClick={() => removeItem(blockIdx, itemIdx)}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {/* Add Item */}
                {canEdit && (
                  <button
                    className="mt-2 bg-green-500 text-white px-4 py-1 rounded shadow hover:bg-green-600"
                    onClick={() => addItem(blockIdx)}
                  >
                    + Zeile
                  </button>
                )}
                {/* Transport & Lieferung-Zeile */}
                <div className="flex justify-end mt-3">
                  <div className="italic bg-gray-100 p-2 rounded">
                    Transport & Lieferung ({(transportPercent * 100).toFixed(1)}%):{" "}
                    {blockTransport(block).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                </div>
                {/* Blocksumme */}
                <div className="flex justify-end mt-1 font-bold">
                  <span>
                    Blocksumme inkl. Transport:{" "}
                    {blockSumTotal(block).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
                {/* Remove Block */}
                {canEdit && (
                  <button
                    className="mt-2 text-red-500 px-3 py-1 rounded hover:bg-red-100"
                    onClick={() => removeBlock(blockIdx)}
                  >
                    Kostenblock löschen
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Projektsumme */}
      <div className="flex justify-end mt-8">
        <div className="text-xl font-bold bg-blue-50 p-4 rounded-2xl shadow">
          Projektsumme:{" "}
          {projectSum().toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}
        </div>
      </div>
    </div>
  );
};

export default Budget;

