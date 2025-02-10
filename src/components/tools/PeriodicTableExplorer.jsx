"use client";

import { useState } from "react";

// Periodic Table Data (simplified for demo)
const periodicTable = [
  { number: 1, symbol: "H", name: "Hydrogen", atomicMass: 1.008, category: "Nonmetal", electronConfig: "1s¹" },
  { number: 2, symbol: "He", name: "Helium", atomicMass: 4.0026, category: "Noble Gas", electronConfig: "1s²" },
  { number: 3, symbol: "Li", name: "Lithium", atomicMass: 6.94, category: "Alkali Metal", electronConfig: "[He] 2s¹" },
  { number: 4, symbol: "Be", name: "Beryllium", atomicMass: 9.0122, category: "Alkaline Earth", electronConfig: "[He] 2s²" },
  { number: 5, symbol: "B", name: "Boron", atomicMass: 10.81, category: "Metalloid", electronConfig: "[He] 2s² 2p¹" },
  { number: 6, symbol: "C", name: "Carbon", atomicMass: 12.011, category: "Nonmetal", electronConfig: "[He] 2s² 2p²" },
  { number: 7, symbol: "N", name: "Nitrogen", atomicMass: 14.007, category: "Nonmetal", electronConfig: "[He] 2s² 2p³" },
  { number: 8, symbol: "O", name: "Oxygen", atomicMass: 15.999, category: "Nonmetal", electronConfig: "[He] 2s² 2p⁴" },
  { number: 9, symbol: "F", name: "Fluorine", atomicMass: 18.998, category: "Halogen", electronConfig: "[He] 2s² 2p⁵" },
  { number: 10, symbol: "Ne", name: "Neon", atomicMass: 20.180, category: "Noble Gas", electronConfig: "[He] 2s² 2p⁶" },
];

const PeriodicTableExplorer = () => {
  const [selectedElement, setSelectedElement] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Periodic Table Explorer</h2>

      {/* Grid Display of Elements */}
      <div className="grid grid-cols-5 gap-3 text-center">
        {periodicTable.map((element) => (
          <button
            key={element.number}
            className="p-4 border rounded-lg bg-gray-100 hover:bg-blue-200 transition duration-200"
            onClick={() => setSelectedElement(element)}
          >
            <div className="text-xl font-bold">{element.symbol}</div>
            <div className="text-sm">{element.number}</div>
          </button>
        ))}
      </div>

      {/* Selected Element Details */}
      {selectedElement && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold">{selectedElement.name} ({selectedElement.symbol})</h3>
          <p><strong>Atomic Number:</strong> {selectedElement.number}</p>
          <p><strong>Atomic Mass:</strong> {selectedElement.atomicMass}</p>
          <p><strong>Category:</strong> {selectedElement.category}</p>
          <p><strong>Electron Configuration:</strong> {selectedElement.electronConfig}</p>
        </div>
      )}
    </div>
  );
};

export default PeriodicTableExplorer;
