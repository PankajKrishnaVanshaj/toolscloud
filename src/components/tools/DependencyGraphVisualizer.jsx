"use client";

import React, { useState, useRef, useEffect } from 'react';

const DependencyGraphVisualizer = () => {
  const [inputData, setInputData] = useState('');
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const parseDependencies = (data) => {
    setError(null);

    try {
      const parsed = JSON.parse(data);
      const nodes = [];
      const edges = [];
      const nodeMap = new Map();

      // Add root node (the project itself)
      const rootName = parsed.name || 'Project';
      nodes.push({ id: rootName, x: 0, y: 0 });
      nodeMap.set(rootName, 0);

      // Process dependencies
      const deps = { ...parsed.dependencies, ...parsed.devDependencies };
      Object.keys(deps).forEach((dep, index) => {
        if (!nodeMap.has(dep)) {
          nodes.push({ id: dep, x: 0, y: 0 });
          nodeMap.set(dep, nodes.length - 1);
        }
        edges.push({ from: rootName, to: dep });
      });

      // Simple circular layout
      const radius = 150;
      const centerX = 300;
      const centerY = 300;
      nodes.forEach((node, index) => {
        if (index === 0) { // Root node
          node.x = centerX;
          node.y = centerY;
        } else {
          const angle = (index - 1) * (2 * Math.PI / (nodes.length - 1));
          node.x = centerX + radius * Math.cos(angle);
          node.y = centerY + radius * Math.sin(angle);
        }
      });

      return { nodes, edges };
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
      return null;
    }
  };

  const drawGraph = (nodes, edges) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = node.id === nodes[0].id ? '#3b82f6' : '#e5e7eb';
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const wrappedText = wrapText(node.id, 15);
      wrappedText.forEach((line, i) => {
        ctx.fillText(line, node.x, node.y + (i - (wrappedText.length - 1) / 2) * 14);
      });
    });
  };

  const wrapText = (text, maxLength) => {
    if (text.length <= maxLength) return [text];
    const words = text.split('-');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxLength) {
        lines.push(currentLine.trim());
        currentLine = word + '-';
      } else {
        currentLine += word + '-';
      }
    });

    if (currentLine) lines.push(currentLine.slice(0, -1));
    return lines;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const graphData = parseDependencies(inputData);
    if (graphData) {
      drawGraph(graphData.nodes, graphData.edges);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const graphData = parseDependencies(inputData);
      if (graphData) {
        drawGraph(graphData.nodes, graphData.edges);
      }
    }
  }, [inputData]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Dependency Graph Visualizer</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package.json Content
            </label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`{
  "name": "my-project",
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.2"
  }
}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Visualize Dependencies
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Graph Visualization */}
        {(inputData || error) && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Dependency Graph</h3>
            <div className="overflow-auto">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DependencyGraphVisualizer;