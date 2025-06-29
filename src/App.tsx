import React, { useState } from "react";
import Budget from "./Budget";
import UserManagement from "./UserManagement";
import Timetable from "./Timetable";
import Account from "./Account";

export default function App() {
  const [page, setPage] = useState("budget");
  return (
    <div>
      <header style={{display:"flex", gap:16, alignItems:"center", marginBottom:24}}>
        <h1>DOSI Dashboard</h1>
        <button onClick={() => setPage("budget")}>Budget</button>
        <button onClick={() => setPage("users")}>User-Verwaltung</button>
        <button onClick={() => setPage("timetable")}>Timetable</button>
        <button onClick={() => setPage("account")}>Account</button>
      </header>
      <main>
        {page === "budget" && <Budget />}
        {page === "users" && <UserManagement />}
        {page === "timetable" && <Timetable />}
        {page === "account" && <Account />}
      </main>
    </div>
  );
}

