"use client";
import { useState } from "react";

const RandomNumberGenerator = () => {
  const [number, setNumber] = useState(0);

  const generateNumber = () => {
    setNumber(Math.floor(Math.random() * 100));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Random Number Generator</h2>
      <button onClick={generateNumber} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Generate Number
      </button>
      <p className="mt-3 text-lg font-medium">{number}</p>
    </div>
  );
};

export default RandomNumberGenerator;
