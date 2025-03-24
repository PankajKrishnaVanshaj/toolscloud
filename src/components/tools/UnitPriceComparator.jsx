"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaSync, FaDownload } from "react-icons/fa";

const UnitPriceComparator = () => {
  const [items, setItems] = useState([
    { name: "", price: "", quantity: "", unit: "unit" },
    { name: "", price: "", quantity: "", unit: "unit" },
  ]);
  const [unitPrices, setUnitPrices] = useState([]);
  const [currency, setCurrency] = useState("$");
  const [sortBy, setSortBy] = useState("none"); // none, priceAsc, priceDesc

  const units = ["unit", "oz", "lb", "g", "kg", "ml", "l", "count"];
  const currencies = ["$", "€", "£", "¥"];

  // Calculate unit prices
  const calculateUnitPrices = useCallback(() => {
    const prices = items.map((item) => {
      if (
        !item.price ||
        !item.quantity ||
        isNaN(item.price) ||
        isNaN(item.quantity) ||
        parseFloat(item.quantity) <= 0
      ) {
        return { name: item.name || "Unnamed Item", unitPrice: null, unit: item.unit };
      }
      const price = parseFloat(item.price);
      const quantity = parseFloat(item.quantity);
      const unitPrice = price / quantity;
      return {
        name: item.name || "Unnamed Item",
        unitPrice: unitPrice.toFixed(2),
        unit: item.unit,
      };
    });

    // Sort if applicable
    if (sortBy === "priceAsc") {
      prices.sort((a, b) => (a.unitPrice || Infinity) - (b.unitPrice || Infinity));
    } else if (sortBy === "priceDesc") {
      prices.sort((a, b) => (b.unitPrice || -Infinity) - (a.unitPrice || -Infinity));
    }

    setUnitPrices(prices);
  }, [items, sortBy]);

  useEffect(() => {
    calculateUnitPrices();
  }, [items, sortBy, calculateUnitPrices]);

  // Handle input changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "price" || field === "quantity" ? value.replace(/^0+/, "") : value;
    setItems(newItems);
  };

  // Add/remove items
  const addItem = () => {
    setItems([...items, { name: "", price: "", quantity: "", unit: "unit" }]);
  };

  const removeItem = (index) => {
    if (items.length > 2) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  // Reset all
  const reset = () => {
    setItems([
      { name: "", price: "", quantity: "", unit: "unit" },
      { name: "", price: "", quantity: "", unit: "unit" },
    ]);
    setCurrency("$");
    setSortBy("none");
  };

  // Download results as CSV
  const downloadCSV = () => {
    const headers = ["Item Name", "Price", "Quantity", "Unit", "Unit Price"];
    const rows = items.map((item, index) => [
      item.name || `Item ${index + 1}`,
      item.price ? `${currency}${item.price}` : "",
      item.quantity,
      item.unit,
      unitPrices[index].unitPrice ? `${currency}${unitPrices[index].unitPrice}` : "N/A",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `unit-prices-${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Unit Price Comparator
        </h1>

        {/* Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="priceAsc">Unit Price (Low to High)</option>
                <option value="priceDesc">Unit Price (High to Low)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={reset}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Item Inputs */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, "name", e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`Item ${index + 1}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ({currency})</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, "price", e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              {items.length > 2 && (
                <button
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors h-10"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button
              onClick={addItem}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Item
            </button>
            <button
              onClick={downloadCSV}
              disabled={!unitPrices.some((p) => p.unitPrice)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download CSV
            </button>
          </div>
        </div>

        {/* Results */}
        {unitPrices.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-center">Unit Price Results</h2>
            <ul className="space-y-2">
              {unitPrices.map((result, index) => (
                <li
                  key={index}
                  className={`text-sm p-2 rounded-md ${
                    result.unitPrice && sortBy !== "none"
                      ? index === 0
                        ? "bg-green-100"
                        : "bg-white"
                      : "bg-white"
                  }`}
                >
                  <span className="font-medium">{result.name}:</span>{" "}
                  {result.unitPrice ? (
                    <span className="text-green-600">
                      {currency}
                      {result.unitPrice} per {result.unit}
                    </span>
                  ) : (
                    <span className="text-red-600">Invalid input</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Compare multiple items with different units</li>
            <li>Customizable currency</li>
            <li>Sort by unit price (ascending/descending)</li>
            <li>Add/remove items dynamically</li>
            <li>Download results as CSV</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Enter price and quantity for each item to compare unit prices. Lower unit price indicates
          better value.
        </p>
      </div>
    </div>
  );
};

export default UnitPriceComparator;