"use client";
import { useState } from "react";

const RandomPasswordGenerator = () => {
  const [password, setPassword] = useState("");

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Random Password Generator</h2>
      <button onClick={generatePassword} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Generate Password
      </button>
      {password && <p className="mt-3">{password}</p>}
    </div>
  );
};

export default RandomPasswordGenerator;
