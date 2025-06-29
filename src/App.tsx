
import React from "react";
import Budget from "./Budget";
// Falls du Navigation oder andere Tabs hast, importiere sie hier:
// import Navigation from "./Navigation";
// import Projects from "./Projects";
// import UserManagement from "./UserManagement";
// import Timetable from "./Timetable";

function App() {
  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif", background: "#fafbfc", minHeight: "100vh", padding: 32 }}>
      {/* Hier nur das Budget-Modul direkt gerendert */}
      <h1 style={{ fontWeight: 900, fontSize: 28, marginBottom: 18 }}>DOSI Dashboard – Budget</h1>
      <Budget />
    </div>
  );
}

export default App;

