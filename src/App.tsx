import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopMenu from "./TopMenu";
import Navigation from "./Navigation";
import Users from "./Users";
import Account from "./Account";
import Timetable from "./Timetable";
import Budget from "./modules/Budget";
import Comments from "./Comments";
import Invoices from "./Invoices";

function App() {
  return (
    <BrowserRouter>
      <TopMenu />
      <Navigation />
      <Routes>
        <Route path="/" element={<Budget userRole="admin" userId="u3" />} />
        <Route path="/users" element={<Users />} />
        <Route path="/account" element={<Account />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/budget" element={<Budget userRole="admin" userId="u3" />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/invoices" element={<Invoices />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

