import React, { useState } from "react";

const Comments = () => {
  const [comments, setComments] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    setComments([...comments, input]);
    setInput("");
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Kommentare</h2>
      <div>
        <input
          type="text"
          value={input}
          className="border p-2 mr-2"
          onChange={(e) => setInput(e.target.value)}
          placeholder="Kommentar..."
        />
        <button
          onClick={handleAdd}
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
          Hinzufügen
        </button>
      </div>
      <ul className="mt-4">
        {comments.map((c, i) => (
          <li key={i} className="py-1 border-b">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;

