"use client";
import { useState } from "react";

const LoremIpsumGenerator = () => {
  const loremText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  const [text, setText] = useState("");

  const generateText = () => {
    setText(loremText);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-2">Lorem Ipsum Generator</h2>
      <button onClick={generateText} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Generate Text
      </button>
      {text && <p className="mt-3">{text}</p>}
    </div>
  );
};

export default LoremIpsumGenerator;
