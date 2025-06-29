import React from "react";

const dummyInvoices = [
  { id: 1, title: "Invoice 1", date: "2025-07-01", amount: "3.800 €", status: "Paid", pdf: "#" },
  { id: 2, title: "Invoice 2", date: "2025-07-15", amount: "2.450 €", status: "Open", pdf: "#" },
];

export default function Invoices() {
  return (
    <div className="invoices">
      <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>Invoices</div>
      <table className="table-lg">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {dummyInvoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.title}</td>
              <td>{inv.date}</td>
              <td>{inv.amount}</td>
              <td>{inv.status}</td>
              <td>
                <a href={inv.pdf} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-sm" style={{ marginTop: 12 }}>Neue Invoice</button>
    </div>
  );
}

