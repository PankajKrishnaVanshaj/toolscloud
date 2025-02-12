"use client";
import { useState } from "react";
import { FaCopy, FaEye, FaEyeSlash } from "react-icons/fa";

const RandomPasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    let chars = "";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += "0123456789";
    if (includeSpecial) chars += "!@#$%^&*";

    if (excludeSimilar) {
      chars = chars.replace(/[IlO0]/g, "");
    }

    if (chars.length === 0) {
      setPassword("Please select at least one character type.");
      return;
    }

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    alert("Password copied to clipboard!");
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (includeUppercase) strength++;
    if (includeLowercase) strength++;
    if (includeNumbers) strength++;
    if (includeSpecial) strength++;

    if (strength <= 1) return "Weak";
    if (strength === 2) return "Medium";
    return "Strong";
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Password Length */}
      <label className="block mb-2 font-medium">
        Password Length: {length}
      </label>
      <input
        type="range"
        min="6"
        max="100"
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        className="w-full mb-4 h-2 rounded-lg accent-primary"
      />

      {/* Character Options */}
      <div className="mb-4 flex flex-wrap gap-3">
        <label className="block font-medium">Character Options:</label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
            className="accent-primary rounded"

          />
          <span>Include Uppercase Letters</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
            className="accent-primary rounded"

          />
          <span>Include Lowercase Letters</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            className="accent-primary rounded"

          />
          <span>Include Numbers</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeSpecial}
            onChange={(e) => setIncludeSpecial(e.target.checked)}
            className="accent-primary rounded"

          />
          <span>Include Special Characters</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={excludeSimilar}
            onChange={(e) => setExcludeSimilar(e.target.checked)}
            className="accent-primary rounded"

          />
          <span>Exclude Similar Characters (e.g., I, l, O, 0)</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePassword}
        className="px-4 py-2 text-primary border hover:border-secondary font-semibold rounded-lg w-full mb-4"
      >
        Generate Password
      </button>

      {/* Password Output */}
      {password && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
          <p className="truncate">
            {showPassword ? password : "●".repeat(password.length)}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-primary"
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
            <button onClick={copyToClipboard} className="text-secondary">
              <FaCopy className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Password Strength Indicator */}
      {password && (
        <div className="mt-2">
          <span className="font-medium">Password Strength: </span>
          <span
            className={`font-semibold ${
              getPasswordStrength() === "Strong"
                ? "text-green-600"
                : getPasswordStrength() === "Medium"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {getPasswordStrength()}
          </span>
        </div>
      )}
    </div>
  );
};

export default RandomPasswordGenerator;
