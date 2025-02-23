'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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
  const [expression, setExpression] = useState(''); // e.g., "2x + 3"
  const [xMin, setXMin] = useState('-10');
  const [xMax, setXMax] = useState('10');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Parse and evaluate the function
  const evaluateFunction = (exp, x) => {
    try {
      // Replace common math expressions
      let parsedExp = exp
        .replace(/x/g, `${x}`)
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/ln/g, 'Math.log')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      return eval(parsedExp); // Note: eval() is used here for simplicity; consider a safer parser in production
    } catch (e) {
      throw new Error('Invalid function expression');
    }
  };

  // Generate graph data
  const generateGraphData = useCallback(() => {
    const steps = ['Generating graph data:'];
    const min = parseFloat(xMin);
    const max = parseFloat(xMax);

    if (isNaN(min) || isNaN(max) || min >= max) {
      return { error: 'X range must be valid numbers with min < max' };
    }
    if (!expression) {
      return { error: 'Function expression is required' };
    }

    const stepSize = (max - min) / 100; // 100 points for smooth graph
    const labels = [];
    const dataPoints = [];

    for (let x = min; x <= max; x += stepSize) {
      labels.push(x.toFixed(2));
      try {
        const y = evaluateFunction(expression, x);
        if (isNaN(y) || y === Infinity || y === -Infinity) {
          dataPoints.push(null); // Handle discontinuities
        } else {
          dataPoints.push(y);
        }
        if (steps.length < 6) { // Limit steps to 5 examples
          steps.push(`x = ${x.toFixed(2)}, y = ${y !== null ? y.toFixed(2) : 'undefined'}`);
        }
      } catch (e) {
        return { error: 'Invalid function expression' };
      }
    }
    if (dataPoints.length > 5) steps.push('...and more points');

    const chartData = {
      labels,
      datasets: [{
        label: expression,
        data: dataPoints,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      }],
    };

    return { chartData, steps };
  }, [expression, xMin, xMax]);

  // Handle input changes
  const handleExpressionChange = (e) => {
    const value = e.target.value;
    setExpression(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, expression: value ? '' : 'Function is required' }));
  };

  const handleRangeChange = (field) => (e) => {
    const value = e.target.value;
    if (field === 'min') {
      setXMin(value);
      setErrors((prev) => ({
        ...prev,
        xMin: value && !isNaN(parseFloat(value)) ? '' : 'Must be a number',
      }));
    } else {
      setXMax(value);
      setErrors((prev) => ({
        ...prev,
        xMax: value && !isNaN(parseFloat(value)) ? '' : 'Must be a number',
      }));
    }
    setResult(null);
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const min = parseFloat(xMin);
    const max = parseFloat(xMax);
    return (
      expression &&
      !isNaN(min) &&
      !isNaN(max) &&
      min < max &&
      Object.values(errors).every(err => !err)
    );
  }, [expression, xMin, xMax, errors]);

  // Plot graph
  const plot = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide a valid function and range',
      }));
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
    setExpression('');
    setXMin('-10');
    setXMax('10');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Function Graph' },
    },
    scales: {
      x: { title: { display: true, text: 'X' } },
      y: { title: { display: true, text: 'Y' } },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Graph Plotter
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Function:</label>
            <div className="flex-1">
              <input
                type="text"
                value={expression}
                onChange={handleExpressionChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2x + 3, x^2, sin(x)"
                aria-label="Function expression"
              />
              {errors.expression && <p className="text-red-600 text-sm mt-1">{errors.expression}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">X Range:</label>
            <div className="flex-1 flex gap-2">
              <input
                type="number"
                step="0.01"
                value={xMin}
                onChange={handleRangeChange('min')}
                className="w-1/2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="-10"
                aria-label="X minimum"
              />
              <span>to</span>
              <input
                type="number"
                step="0.01"
                value={xMax}
                onChange={handleRangeChange('max')}
                className="w-1/2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
                aria-label="X maximum"
              />
            </div>
          </div>
          {(errors.xMin || errors.xMax) && (
            <p className="text-red-600 text-sm">{errors.xMin || errors.xMax}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={plot}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Plot
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
          >
            Reset
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
            <div className="bg-blue-50 p-4 rounded-lg">
              <Line data={result.chartData} options={options} />
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? 'Hide Steps' : 'Show Steps'}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphPlotter;