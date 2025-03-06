// components/UnitPriceComparator.js
'use client';

import React, { useState, useEffect } from 'react';

const UnitPriceComparator = () => {
  const [items, setItems] = useState([
    { name: '', price: '', quantity: '', unit: 'unit' },
    { name: '', price: '', quantity: '', unit: 'unit' },
  ]);
  const [unitPrices, setUnitPrices] = useState([]);

  const units = ['unit', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'count'];

  const calculateUnitPrices = () => {
    const prices = items.map(item => {
      if (!item.price || !item.quantity || isNaN(item.price) || isNaN(item.quantity)) {
        return { name: item.name || 'Unnamed Item', unitPrice: null };
      }
      const price = parseFloat(item.price);
      const quantity = parseFloat(item.quantity);
      const unitPrice = price / quantity;
      return { name: item.name || 'Unnamed Item', unitPrice: unitPrice.toFixed(2) };
    });
    setUnitPrices(prices);
  };

  useEffect(() => {
    calculateUnitPrices();
  }, [items]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', price: '', quantity: '', unit: 'unit' }]);
  };

  const removeItem = (index) => {
    if (items.length > 2) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Unit Price Comparator</h1>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Item ${index + 1}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price ($)</label>
              <input
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
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
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
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
                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            {items.length > 2 && (
              <button
                onClick={() => removeItem(index)}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors h-10"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="flex justify-center">
          <button
            onClick={addItem}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add Item
          </button>
        </div>

        {/* Results */}
        {unitPrices.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-center">Unit Price Results</h2>
            <ul className="space-y-2">
              {unitPrices.map((result, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{result.name}:</span>{' '}
                  {result.unitPrice ? (
                    <span className="text-green-600">${result.unitPrice} per {items[index].unit}</span>
                  ) : (
                    <span className="text-red-600">Invalid input</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Enter price and quantity for each item to compare unit prices. Lower unit price indicates better value.
      </p>
    </div>
  );
};

export default UnitPriceComparator;