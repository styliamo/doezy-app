import React, { useEffect, useState } from "react";

// === Supabase-Client-Setup ===
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rshorvzyxmzvdxwfdtqs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzaG9ydnp5eG16dmR4d2ZkdHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODgzMTMsImV4cCI6MjA2NjI2NDMxM30.1Cp2Wrd71w3oBr8Djsd8LNLoE6NfJHFW2icqQnwmm40";
const supabase = createClient(supabaseUrl, supabaseKey);

// === Styles ===
const navStyle = { display: 'flex', gap: 30, marginBottom: 30, fontSize: 36, fontWeight: 700, fontFamily: 'sans-serif' };
const navActive = { textDecoration: 'underline', color: '#19232e' };
const navInactive = { color: '#888' };
const sectionStyle = { marginLeft: 36 };
const card = { background: "#f7f7f7", borderRadius: 20, padding: 30, marginBottom: 30, width: 380, boxShadow: "0 4px 32px #0001" };

function App() {
  const [tab, setTab] = useState<"projects" | "users" | "account">("projects");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Projects laden
  useEffect(() => {
    if (tab !== "projects") return;
    setLoading(true);
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setProjects(data || []);
        setLoading(false);
      });
  }, [tab]);

  return (
    <div style={{ fontFamily: "Inter,sans-serif", background: "#fcfcfc", minHeight: "100vh" }}>
      {/* Navigation */}
      <div style={navStyle}>
        <span style={tab === "projects" ? navActive : navInactive} onClick={() => setTab("projects")}>Projects</span>
        <span style={tab === "users" ? navActive : navInactive} onClick={() => setTab("users")}>Users</span>
        <span style={tab === "account" ? navActive : navInactive} onClick={() => setTab("account")}>Account</span>
      </div>
      <div style={sectionStyle}>
        {/* Projekte */}
        {tab === "projects" && (
          <>
            <h1 style={{ fontSize: 56, margin: "36px 0 24px" }}>Projects</h1>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: "red" }}>Fehler: {error}</div>}
            {projects.length === 0 && !loading && <div>No projects found.</div>}
            {projects.map((p: any) => (
              <div style={card} key={p.id}>
                <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 12 }}>{p.name || "No Name"}</div>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{p.beschreibung || "No description"}</div>
                <div style={{ color: "#555", marginBottom: 4 }}>Status: {p.status || "n/a"}</div>
                <div style={{ color: "#555", marginBottom: 4 }}>
                  Start: {p.startdatum || "n/a"} — Ende: {p.enddatum || "n/a"}
                </div>
                <div style={{ color: "#555", marginBottom: 4 }}>
                  Budget: {p.budget ? `${p.budget} €` : "n/a"}
                </div>
              </div>
            ))}
          </>
        )}
        {/* Users-Tab */}
        {tab === "users" && (
          <>
            <h1 style={{ fontSize: 56, margin: "36px 0 24px" }}>Users</h1>
            <div>Hier kommen die User später hin ...</div>
          </>
        )}
        {/* Account-Tab */}
        {tab === "account" && (
          <>
            <h1 style={{ fontSize: 56, margin: "36px 0 24px" }}>Account</h1>
            <div>Account-Einstellungen folgen ...</div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

