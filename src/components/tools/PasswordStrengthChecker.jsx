"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordStrengthChecker = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return { label: "Weak", color: "text-red-500", progress: "w-1/4 bg-red-500" };
      case 2:
        return { label: "Fair", color: "text-yellow-500", progress: "w-1/2 bg-yellow-500" };
      case 3:
        return { label: "Good", color: "text-blue-500", progress: "w-3/4 bg-blue-500" };
      case 4:
        return { label: "Strong", color: "text-green-500", progress: "w-full bg-green-500" };
      default:
        return { label: "Weak", color: "text-red-500", progress: "w-1/4 bg-red-500" };
    }
  };

  const strength = getStrength(password);

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="mt-3 flex items-center">
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div className={`h-2 rounded-full ${strength.progress}`}></div>
        </div>
        <span className={`ml-3 font-semibold ${strength.color}`}>{strength.label}</span>
      </div>

      <ul className="mt-4 text-sm text-gray-600 flex flex-wrap gap-5">
        <li className={`${password.length >= 8 ? "text-green-500" : "text-gray-400"}`}>
          ✅ At least 8 characters
        </li>
        <li className={`${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}`}>
          ✅ Contains an uppercase letter
        </li>
        <li className={`${/\d/.test(password) ? "text-green-500" : "text-gray-400"}`}>
          ✅ Includes a number
        </li>
        <li className={`${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-500" : "text-gray-400"}`}>
          ✅ Has a special character
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthChecker;
