import React, { useState } from "react";

const roles = ["Admin", "Lieferant", "Kunde"];
const mockProjects = ["Hotelprojekt Wien", "Showroom Linz"];

const initialUsers = [
  { email: "admin@beispiel.com", rolle: "Admin", projekt: "Hotelprojekt Wien" },
  { email: "lieferant@beispiel.com", rolle: "Lieferant", projekt: "Showroom Linz" },
  { email: "kunde@beispiel.com", rolle: "Kunde", projekt: "Hotelprojekt Wien" }
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [rolle, setRolle] = useState(roles[0]);
  const [projekt, setProjekt] = useState(mockProjects[0]);

  function handleAdd() {
    if (!email) return;
    setUsers([...users, { email, rolle, projekt }]);
    setEmail("");
    setRolle(roles[0]);
    setProjekt(mockProjects[0]);
  }

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: 40,
      maxWidth: 900,
      margin: "40px auto",
      boxShadow: "0 6px 40px #eee"
    }}>
      <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 28 }}>Userverwaltung</h1>
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: "7px 12px",
            fontSize: 17,
            minWidth: 180
          }}
        />
        <select
          value={rolle}
          onChange={e => setRolle(e.target.value)}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: "7px 12px",
            fontSize: 17
          }}
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={projekt}
          onChange={e => setProjekt(e.target.value)}
          style={{
            border: "1px solid #2361c9",
            borderRadius: 6,
            padding: "7px 12px",
            fontSize: 17
          }}
        >
          {mockProjects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          onClick={handleAdd}
          style={{
            background: "#2361c9",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            borderRadius: 8,
            padding: "7px 28px",
            fontSize: 18,
            marginLeft: 10,
            cursor: "pointer"
          }}
        >Hinzufügen</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fcfcff", borderRadius: 10 }}>
        <thead style={{ background: "#f8faff" }}>
          <tr>
            <th style={{ textAlign: "left", padding: 10 }}>E-Mail</th>
            <th style={{ textAlign: "left", padding: 10 }}>Rolle</th>
            <th style={{ textAlign: "left", padding: 10 }}>Projekt</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: 10 }}>{u.email}</td>
              <td style={{ padding: 10 }}>{u.rolle}</td>
              <td style={{ padding: 10 }}>{u.projekt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

