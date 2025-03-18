"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaTrash } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"; // For better visualization

const ColorTrendAnalyzer = () => {
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState("#FF6B6B");
  const [trendData, setTrendData] = useState({});
  const [timeFrame, setTimeFrame] = useState("monthly"); // New: Weekly/Monthly/Yearly
  const [showRGB, setShowRGB] = useState(true);

  // Mock trend data generator
  const generateMockTrendData = useCallback((colorList) => {
    const periods = timeFrame === "weekly" ? 52 : timeFrame === "monthly" ? 12 : 5; // Weeks, Months, Years
    const data = {};
    colorList.forEach((color) => {
      data[color] = Array.from({ length: periods }, () => Math.floor(Math.random() * 101));
    });
    return data;
  }, [timeFrame]);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 0, g: 0, b: 0 };
  };

  // Add a new color
  const addColor = () => {
    if (!colors.includes(newColor) && /^#[0-9A-F]{6}$/i.test(newColor)) {
      setColors([...colors, newColor]);
      setNewColor("#000000");
    }
  };

  // Remove a color
  const removeColor = (color) => {
    setColors(colors.filter((c) => c !== color));
  };

  // Reset all colors and settings
  const reset = () => {
    setColors([]);
    setNewColor("#FF6B6B");
    setTrendData({});
    setTimeFrame("monthly");
    setShowRGB(true);
  };

  // Download trend data as CSV
  const downloadCSV = () => {
    if (!Object.keys(trendData).length) return;
    const headers = ["Color", ...Array.from({ length: trendData[colors[0]].length }, (_, i) => `${timeFrame === "weekly" ? "Week" : timeFrame === "monthly" ? "Month" : "Year"} ${i + 1}`)];
    const rows = colors.map((color) => [color, ...trendData[color]].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `color_trend_data_${timeFrame}.csv`;
    link.click();
  };

  // Update trend data when colors or timeframe change
  useEffect(() => {
    if (colors.length > 0) {
      setTrendData(generateMockTrendData(colors));
    } else {
      setTrendData({});
    }
  }, [colors, timeFrame, generateMockTrendData]);

  // Prepare data for chart
  const chartData = Array.from({ length: timeFrame === "weekly" ? 52 : timeFrame === "monthly" ? 12 : 5 }, (_, i) => {
    const period = { name: `${timeFrame === "weekly" ? "W" : timeFrame === "monthly" ? "M" : "Y"}${i + 1}` };
    colors.forEach((color) => {
      period[color] = trendData[color]?.[i] || 0;
    });
    return period;
  });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Color Trend Analyzer</h1>

        <div className="space-y-6">
          {/* Color Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Add Color</h2>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#HEXCODE"
                />
                <button
                  onClick={addColor}
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Time Frame</h2>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly (52 periods)</option>
                <option value="monthly">Monthly (12 periods)</option>
                <option value="yearly">Yearly (5 periods)</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={downloadCSV}
                disabled={!colors.length}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download CSV
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Tracked Colors */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Tracked Colors</h2>
            {colors.length === 0 ? (
              <p className="text-gray-500 italic">No colors added yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {colors.map((color, index) => {
                  const rgb = hexToRgb(color);
                  return (
                    <div key={index} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 rounded shadow" style={{ backgroundColor: color }} />
                      <p className="text-xs mt-2 font-medium">{color}</p>
                      {showRGB && (
                        <p className="text-xs text-gray-600">RGB: {rgb.r}, {rgb.g}, {rgb.b}</p>
                      )}
                      <button
                        onClick={() => removeColor(color)}
                        className="text-red-500 text-xs mt-1 hover:text-red-700 transition-colors flex items-center"
                      >
                        <FaTrash className="mr-1" /> Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trend Visualization */}
          {colors.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Trend Analysis (Mock Data)</h2>
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={showRGB}
                    onChange={(e) => setShowRGB(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  Show RGB
                </label>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {colors.map((color, index) => (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={color}
                      stroke={color}
                      strokeWidth={2}
                      name={`${color} Usage`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2">
                Note: This is mock data simulating {timeFrame} usage frequency (0-100%).
              </p>
            </div>
          )}

          {/* Trend Details */}
          {colors.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">{timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Trend Data</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Color</th>
                      {Array.from({ length: trendData[colors[0]]?.length || 0 }, (_, i) => (
                        <th key={i} className="p-2">
                          {timeFrame === "weekly" ? "W" : timeFrame === "monthly" ? "M" : "Y"}{i + 1}
                        </th>
                      ))}
                      <th className="p-2">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((color, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                          {color}
                        </td>
                        {trendData[color]?.map((value, period) => (
                          <td key={period} className="p-2 text-center">{value}%</td>
                        ))}
                        <td className="p-2 text-center font-medium">
                          {Math.round(trendData[color]?.reduce((sum, val) => sum + val, 0) / trendData[color]?.length) || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Track multiple colors with HEX input</li>
              <li>Switch between weekly, monthly, or yearly trends</li>
              <li>Interactive line chart visualization</li>
              <li>Download trend data as CSV</li>
              <li>RGB display toggle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTrendAnalyzer;