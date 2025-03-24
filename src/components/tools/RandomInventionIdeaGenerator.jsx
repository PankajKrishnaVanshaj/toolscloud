"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const RandomInventionIdeaGenerator = () => {
  const [inventions, setInventions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [count, setCount] = useState(1);

  // Expanded arrays for more variety
  const components = [
    "Robot", "Device", "Gadget", "Machine", "App", "Wearable", "Drone", 
    "Implant", "Vehicle", "System", "Tool", "Platform", "Sensor", "Helmet", 
    "Glove", "Shield", "Lens", "Fabric"
  ];

  const purposes = [
    "cleaning", "cooking", "traveling", "learning", "exercising", "monitoring",
    "entertaining", "communicating", "organizing", "healing", "gaming", 
    "creating", "protecting", "exploring", "analyzing", "teaching", 
    "recycling", "navigating", "meditating"
  ];

  const features = [
    "AI-powered", "solar-powered", "voice-activated", "self-learning", 
    "biodegradable", "invisible", "foldable", "waterproof", "holographic",
    "telepathic", "self-repairing", "temperature-controlled", 
    "gravity-defying", "time-tracking", "motion-sensing", "energy-harvesting",
    "shape-shifting", "self-cleaning", "multi-dimensional"
  ];

  const adjectives = [
    "Smart", "Portable", "Eco-Friendly", "Futuristic", "Compact", 
    "Intelligent", "Revolutionary", "Ultra-Light", "Versatile", 
    "Hyper-Efficient", "Quantum", "Nano", "Dynamic", "Adaptive", 
    "Stealth", "Resilient", "Interactive", "Modular"
  ];

  const categories = {
    all: [...components],
    wearable: ["Wearable", "Implant", "Helmet", "Glove", "Lens", "Fabric"],
    robotics: ["Robot", "Drone", "Machine"],
    digital: ["App", "Platform", "System"],
    utility: ["Device", "Gadget", "Tool", "Sensor", "Shield"]
  };

  // Generate invention(s)
  const generateInventions = useCallback(() => {
    const filteredComponents =
      categoryFilter === "all" ? components : categories[categoryFilter];
    const newInventions = Array.from({ length: Math.min(count, 10) }, () => {
      const component =
        filteredComponents[Math.floor(Math.random() * filteredComponents.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const feature = features[Math.floor(Math.random() * features.length)];
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

      const name = `${adjective} ${component}`;
      const description = `A ${feature} ${component.toLowerCase()} designed for ${purpose}.`;

      return { name, description };
    });

    setInventions(newInventions);
  }, [categoryFilter, count]);

  // Download as text file
  const downloadInventions = () => {
    if (inventions.length === 0) return;

    const textContent = inventions
      .map((inv) => `${inv.name}\n${inv.description}\n`)
      .join("\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invention-ideas-${Date.now()}.txt`;
    link.click();
  };

  // Clear inventions
  const clearInventions = () => {
    setInventions([]);
    setCount(1);
    setCategoryFilter("all");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Invention Idea Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All</option>
                <option value="wearable">Wearable</option>
                <option value="robotics">Robotics</option>
                <option value="digital">Digital</option>
                <option value="utility">Utility</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Ideas (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(10, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={generateInventions}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                Generate
              </button>
              <button
                onClick={clearInventions}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync />
              </button>
            </div>
          </div>

          {/* Invention Display */}
          {inventions.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {inventions.map((invention, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-md text-center border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold mb-2 text-indigo-600">
                    {invention.name}
                  </h2>
                  <p className="text-gray-700">{invention.description}</p>
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  onClick={downloadInventions}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download Ideas
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 italic">
              Click "Generate" to create some random invention ideas!
            </p>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="font-semibold text-indigo-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-indigo-600 text-sm space-y-1">
            <li>Generate multiple invention ideas at once (up to 10)</li>
            <li>Filter by category: Wearable, Robotics, Digital, Utility</li>
            <li>Expanded list of components, purposes, and features</li>
            <li>Download ideas as a text file</li>
            <li>Clear all option</li>
          </ul>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional invention ideas generated for inspiration and fun!
        </p>
      </div>
    </div>
  );
};

export default RandomInventionIdeaGenerator;