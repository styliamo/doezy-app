import React from "react";

const weeks = Array.from({ length: 12 }, (_, i) => `KW ${i + 1}`);

const Timetable = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h2 className="text-xl font-bold mb-4">Projekt-Timetable</h2>
    <table className="w-full border">
      <thead>
        <tr>
          <th className="border px-2 py-1">Aufgabe</th>
          {weeks.map((w) => (
            <th key={w} className="border px-2 py-1">{w}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border px-2 py-1">Planung</td>
          {weeks.map((_, i) => (
            <td key={i} className="border px-2 py-1">{i < 2 ? "x" : ""}</td>
          ))}
        </tr>
        <tr>
          <td className="border px-2 py-1">Ausführung</td>
          {weeks.map((_, i) => (
            <td key={i} className="border px-2 py-1">{i >= 2 && i < 8 ? "x" : ""}</td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);

export default Timetable;

