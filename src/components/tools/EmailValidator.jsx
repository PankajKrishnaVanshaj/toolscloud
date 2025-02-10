"use client";

import { useState } from "react";

const EmailValidator = () => {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(null);

  const validateEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setIsValid(emailRegex.test(email));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <input
        type="text"
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter email (e.g., user@example.com)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="w-full mt-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        onClick={validateEmail}
      >
        Validate Email
      </button>

      {isValid !== null && (
        <p
          className={`mt-3 text-center font-medium ${
            isValid ? "text-green-600" : "text-red-600"
          }`}
        >
          {isValid ? "✅ Valid Email Address" : "❌ Invalid Email Address"}
        </p>
      )}
    </div>
  );
};

export default EmailValidator;
