import React from "react";
import { Link } from "react-router-dom";

const Navigation = () => (
  <nav className="bg-gray-200 py-3 px-8 flex gap-6">
    <Link to="/" className="font-bold">Dashboard</Link>
    <Link to="/users">Users</Link>
    <Link to="/account">Account</Link>
    <Link to="/timetable">Timetable</Link>
    <Link to="/budget">Budget</Link>
    <Link to="/comments">Comments</Link>
    <Link to="/invoices">Invoices</Link>
  </nav>
);

export default Navigation;

