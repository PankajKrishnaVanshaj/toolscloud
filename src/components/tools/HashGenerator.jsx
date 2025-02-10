"use client";
import { useState } from "react";

const HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");

  const generateHash = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    setHash(hashHex);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <input
        type="text"
        className="border p-2 w-full mb-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={generateHash} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Generate Hash
      </button>
      {hash && <p className="mt-3 break-all">{hash}</p>}
    </div>
  );
};

export default HashGenerator;
