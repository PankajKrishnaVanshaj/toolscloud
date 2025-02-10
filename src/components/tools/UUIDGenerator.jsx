"use client";
import { useState } from "react";

const UUIDGenerator = () => {
  const [uuid, setUuid] = useState("");

  const generateUUID = () => {
    const newUuid = crypto.randomUUID();
    setUuid(newUuid);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-2">UUID Generator</h2>
      <button onClick={generateUUID} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Generate UUID
      </button>
      {uuid && <p className="mt-3 text-lg font-medium break-all">{uuid}</p>}
    </div>
  );
};

export default UUIDGenerator;
