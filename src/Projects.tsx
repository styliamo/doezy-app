// src/Projects.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type Project = {
  id: string;
  title: string;
  client: string;
  company: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  isActive: boolean;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase.from("projects").select("*");
    if (error) {
      alert("Error loading projects");
      return;
    }
    setProjects(data as Project[]);
  }

  function toggleAccordion(id: string) {
    setOpenId(openId === id ? null : id);
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 20 }}>Projects</h2>
      {projects.map((project) => (
        <div key={project.id} style={{
          border: "1px solid #eee",
          borderRadius: 12,
          marginBottom: 12,
          boxShadow: openId === project.id ? "0 2px 8px #bbb2" : "none"
        }}>
          <div
            style={{
              padding: 16,
              fontSize: 20,
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
            onClick={() => toggleAccordion(project.id)}
          >
            <span>{project.title}</span>
            <span>{openId === project.id ? "–" : "+"}</span>
          </div>
          {openId === project.id && (
            <div style={{ background: "#f9f9f9", padding: 20, borderTop: "1px solid #eee" }}>
              <div><b>Client:</b> {project.client}</div>
              <div><b>Company:</b> {project.company}</div>
              <div><b>Address:</b> {project.address}, {project.zip} {project.city}, {project.country}</div>
              <div>
                <b>Status:</b> {project.isActive ? "Active" : "Inactive"}
              </div>
              {/* Hier weitere Live-Edit Felder oder Buttons für Details etc. */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

