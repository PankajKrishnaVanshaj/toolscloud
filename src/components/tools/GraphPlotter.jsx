"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaDownload, FaSync, FaChartLine } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the graph

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraphPlotter = () => {
  const [expression, setExpression] = useState("");
  const [xMin, setXMin] = useState("-10");
  const [xMax, setXMax] = useState("10");
  const [yMin, setYMin] = useState("");
  const [yMax, setYMax] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [pointStyle, setPointStyle] = useState("circle");
  const [lineColor, setLineColor] = useState("#4BC0C0");
  const chartRef = React.useRef(null);

  // Evaluate the function
  const evaluateFunction = (exp, x) => {
    try {
      let parsedExp = exp
        .replace(/x/g, `${x}`)
        .replace(/\^/g, "**")
        .replace(/sin/g, "Math.sin")
        .replace(/cos/g, "Math.cos")
        .replace(/tan/g, "Math.tan")
        .replace(/ln/g, "Math.log")
        .replace(/log/g, "Math.log10")
        .replace(/sqrt/g, "Math.sqrt")
        .replace(/pi/g, "Math.PI")
        .replace(/e/g, "Math.E");
      return eval(parsedExp); // Use with caution; consider a math parser library for production
    } catch (e) {
      throw new Error("Invalid function expression");
    }
  };

  // Generate graph data
  const generateGraphData = useCallback(() => {
    const steps = ["Generating graph data:"];
    const minX = parseFloat(xMin);
    const maxX = parseFloat(xMax);
    const minY = yMin ? parseFloat(yMin) : null;
    const maxY = yMax ? parseFloat(yMax) : null;

    if (isNaN(minX) || isNaN(maxX) || minX >= maxX) {
      return { error: "X range must be valid numbers with min < max" };
    }
    if (!expression) {
      return { error: "Function expression is required" };
    }
    if (minY !== null && maxY !== null && minY >= maxY) {
      return { error: "Y range must be valid with min < max if specified" };
    }

    const stepSize = (maxX - minX) / 200; // Increased resolution to 200 points
    const labels = [];
    const dataPoints = [];

    for (let x = minX; x <= maxX; x += stepSize) {
      labels.push(x.toFixed(2));
      try {
        const y = evaluateFunction(expression, x);
        if (isNaN(y) || y === Infinity || y === -Infinity) {
          dataPoints.push(null);
        } else if ((minY !== null && y < minY) || (maxY !== null && y > maxY)) {
          dataPoints.push(null); // Outside Y range
        } else {
          dataPoints.push(y);
        }
        if (steps.length < 6) {
          steps.push(`x = ${x.toFixed(2)}, y = ${y !== null ? y.toFixed(2) : "undefined"}`);
        }
      } catch (e) {
        return { error: "Invalid function expression" };
      }
    }
    if (dataPoints.length > 5) steps.push("...and more points");

    const chartData = {
      labels,
      datasets: [
        {
          label: expression,
          data: dataPoints,
          borderColor: lineColor,
          backgroundColor: lineColor,
          pointStyle: pointStyle,
          tension: 0.1,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };

    return { chartData, steps };
  }, [expression, xMin, xMax, yMin, yMax, lineColor, pointStyle]);

  // Input handlers
  const handleExpressionChange = (e) => {
    const value = e.target.value;
    setExpression(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, expression: value ? "" : "Function is required" }));
  };

  const handleRangeChange = (field) => (e) => {
    const value = e.target.value;
    const setters = {
      xMin: setXMin,
      xMax: setXMax,
      yMin: setYMin,
      yMax: setYMax,
    };
    setters[field](value);
    setResult(null);
    setErrors((prev) => ({
      ...prev,
      [field]: value && !isNaN(parseFloat(value)) ? "" : "Must be a number",
    }));
  };

  // Validation
  const isValid = useMemo(() => {
    const minX = parseFloat(xMin);
    const maxX = parseFloat(xMax);
    const minY = yMin ? parseFloat(yMin) : null;
    const maxY = yMax ? parseFloat(yMax) : null;
    return (
      expression &&
      !isNaN(minX) &&
      !isNaN(maxX) &&
      minX < maxX &&
      (minY === null || maxY === null || (!isNaN(minY) && !isNaN(maxY) && minY < maxY)) &&
      Object.values(errors).every((err) => !err)
    );
  }, [expression, xMin, xMax, yMin, yMax, errors]);

  // Plot graph
  const plot = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, general: "Please provide valid inputs" }));
      return;
    }

    const plotResult = generateGraphData();
    if (plotResult.error) {
      setErrors({ general: plotResult.error });
    } else {
      setResult(plotResult);
    }
  };

  // Reset state
  const reset = () => {
    setExpression("");
    setXMin("-10");
    setXMax("10");
    setYMin("");
    setYMax("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPointStyle("circle");
    setLineColor("#4BC0C0");
  };

  // Download graph
  const downloadGraph = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `graph-${expression}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Graph of ${expression || "Function"}` },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "X" } },
      y: {
        title: { display: true, text: "Y" },
        min: yMin ? parseFloat(yMin) : undefined,
        max: yMax ? parseFloat(yMax) : undefined,
      },
    },
    hover: { mode: "nearest", intersect: true },
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Graph Plotter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Function
              </label>
              <input
                type="text"
                value={expression}
                onChange={handleExpressionChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2x + 3, x^2, sin(x), sqrt(x)"
              />
              {errors.expression && (
                <p className="text-red-600 text-sm mt-1">{errors.expression}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Line Color
              </label>
              <input
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="w-full h-10 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={xMin}
                  onChange={handleRangeChange("xMin")}
                  className="w-1/2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="-10"
                />
                <span className="self-center">to</span>
                <input
                  type="number"
                  step="0.01"
                  value={xMax}
                  onChange={handleRangeChange("xMax")}
                  className="w-1/2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                />
              </div>
              {(errors.xMin || errors.xMax) && (
                <p className="text-red-600 text-sm mt-1">{errors.xMin || errors.xMax}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Y Range (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={yMin}
                  onChange={handleRangeChange("yMin")}
                  className="w-1/2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto"
                />
                <span className="self-center">to</span>
                <input
                  type="number"
                  step="0.01"
                  value={yMax}
                  onChange={handleRangeChange("yMax")}
                  className="w-1/2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto"
                />
              </div>
              {(errors.yMin || errors.yMax) && (
                <p className="text-red-600 text-sm mt-1">{errors.yMin || errors.yMax}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Point Style
            </label>
            <select
              value={pointStyle}
              onChange={(e) => setPointStyle(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="circle">Circle</option>
              <option value="cross">Cross</option>
              <option value="rect">Rectangle</option>
              <option value="triangle">Triangle</option>
              <option value="star">Star</option>
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={plot}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaChartLine className="mr-2" /> Plot
          </button>
          <button
            onClick={downloadGraph}
            disabled={!result}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6">
            <div ref={chartRef} className="bg-blue-50 p-4 rounded-lg">
              <Line data={result.chartData} options={options} />
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside bg-gray-50 p-4 rounded-lg">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports common math functions (sin, cos, tan, ln, sqrt, etc.)</li>
            <li>Customizable X and Y ranges</li>
            <li>Adjustable line color and point style</li>
            <li>Download graph as PNG</li>
            <li>Interactive tooltips and hover effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GraphPlotter;