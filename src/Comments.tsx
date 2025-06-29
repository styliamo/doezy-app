import React, { useState } from "react";

type Comment = { author: string; text: string; date: string };

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([
    { author: "Admin", text: "Projektstart! 🎉", date: "2025-06-29" },
    { author: "Vendor", text: "Lieferung avisiert, Rückfragen offen.", date: "2025-07-01" },
  ]);
  const [input, setInput] = useState("");

  function addComment() {
    if (!input.trim()) return;
    setComments([
      ...comments,
      { author: "You", text: input, date: new Date().toISOString().slice(0, 10) },
    ]);
    setInput("");
  }

  return (
    <div className="comments">
      <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10 }}>Kommentare</div>
      <div style={{ marginBottom: 18 }}>
        <input
          className="input-md"
          style={{ width: 330 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Kommentar hinzufügen..."
        />
        <button className="btn-sm" onClick={addComment} style={{ marginLeft: 10 }}>
          Publish
        </button>
      </div>
      <div>
        {comments.map((c, i) => (
          <div
            key={i}
            style={{
              background: "#f3f3f3",
              borderRadius: 8,
              marginBottom: 8,
              padding: "7px 16px",
            }}
          >
            <b>{c.author}</b> <span style={{ color: "#aaa", fontSize: 13 }}>{c.date}</span>
            <div>{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

