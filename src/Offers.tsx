import React from "react";

const dummyOffers = [
  { id: 1, name: "Offer 1", file: "#", date: "2025-07-01" },
  { id: 2, name: "Offer 2", file: "#", date: "2025-07-05" },
];

export default function Offers() {
  return (
    <div className="offers">
      <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>Offers</div>
      <table className="table-lg">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {dummyOffers.map((o) => (
            <tr key={o.id}>
              <td>{o.name}</td>
              <td>{o.date}</td>
              <td>
                <a href={o.file} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-sm" style={{ marginTop: 12 }}>Neues Angebot</button>
    </div>
  );
}

