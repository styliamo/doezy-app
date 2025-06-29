import React from "react";

const MOCK_USERS = [
  { id: "u1", name: "Vendor A", role: "vendor" },
  { id: "u2", name: "Vendor B", role: "vendor" },
  { id: "u3", name: "Admin", role: "admin" },
  { id: "u4", name: "Kunde", role: "client" },
];

const Users = () => (
  <div className="p-8 max-w-2xl mx-auto">
    <h2 className="text-xl font-bold mb-4">User-Liste</h2>
    <table className="w-full border">
      <thead>
        <tr>
          <th className="border px-2 py-1">ID</th>
          <th className="border px-2 py-1">Name</th>
          <th className="border px-2 py-1">Rolle</th>
        </tr>
      </thead>
      <tbody>
        {MOCK_USERS.map((u) => (
          <tr key={u.id}>
            <td className="border px-2 py-1">{u.id}</td>
            <td className="border px-2 py-1">{u.name}</td>
            <td className="border px-2 py-1">{u.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Users;

