"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaExpand, FaCompress } from "react-icons/fa";

const DependencyGraphVisualizer = () => {
  const [inputData, setInputData] = useState("");
  const [error, setError] = useState(null);
  const [graphOptions, setGraphOptions] = useState({
    showDevDeps: true,
    showProdDeps: true,
    layout: "circular",
    nodeSize: 20,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef(null);

  const parseDependencies = useCallback((data) => {
    setError(null);
    try {
      const parsed = JSON.parse(data);
      const nodes = [];
      const edges = [];
      const nodeMap = new Map();

      const rootName = parsed.name || "Project";
      nodes.push({ id: rootName, x: 0, y: 0 });
      nodeMap.set(rootName, 0);

      const deps = {
        ...(graphOptions.showProdDeps ? parsed.dependencies || {} : {}),
        ...(graphOptions.showDevDeps ? parsed.devDependencies || {} : {}),
      };

      Object.entries(deps).forEach(([dep, version], index) => {
        if (!nodeMap.has(dep)) {
          nodes.push({ id: dep, version, x: 0, y: 0 });
          nodeMap.set(dep, nodes.length - 1);
        }
        edges.push({ from: rootName, to: dep });
      });

      const canvasWidth = canvasRef.current?.width || 800;
      const canvasHeight = canvasRef.current?.height || 600;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const radius = Math.min(canvasWidth, canvasHeight) / 3;

      nodes.forEach((node, index) => {
        if (graphOptions.layout === "circular") {
          if (index === 0) {
            node.x = centerX;
            node.y = centerY;
          } else {
            const angle = (index - 1) * (2 * Math.PI / (nodes.length - 1));
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
          }
        } else if (graphOptions.layout === "tree") {
          node.x = index === 0 ? centerX : centerX + (index - 1 - (nodes.length - 2) / 2) * 100;
          node.y = index === 0 ? centerY - 100 : centerY + 50;
        }
      });

      return { nodes, edges };
    } catch (err) {
      setError("Invalid JSON: " + err.message);
      return null;
    }
  }, [graphOptions]);

  const drawGraph = useCallback((nodes, edges) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node, index) => {
      const size = graphOptions.nodeSize;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? "#3b82f6" : "#d1d5db";
      ctx.fill();
      ctx.strokeStyle = "#374151";
      ctx.stroke();

      ctx.fillStyle = "#1f2937";
      ctx.font = `${size / 2}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const wrappedText = wrapText(`${node.id}${node.version ? `\n${node.version}` : ""}`, size * 1.5);
      wrappedText.forEach((line, i) => {
        ctx.fillText(line, node.x, node.y + (i - (wrappedText.length - 1) / 2) * (size / 1.5));
      });
    });
  }, [graphOptions.nodeSize]);

  const wrapText = (text, maxWidth) => {
    const lines = text.split("\n");
    return lines.flatMap(line => {
      if (line.length <= maxWidth / 10) return [line];
      const words = line.split(/[-_]/);
      const result = [];
      let currentLine = "";
      words.forEach(word => {
        if ((currentLine + word).length > maxWidth / 10) {
          result.push(currentLine.trim());
          currentLine = word + "-";
        } else {
          currentLine += word + "-";
        }
      });
      if (currentLine) result.push(currentLine.slice(0, -1));
      return result;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const graphData = parseDependencies(inputData);
    if (graphData) drawGraph(graphData.nodes, graphData.edges);
  };

  const handleReset = () => {
    setInputData("");
    setError(null);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `dependency-graph-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = isFullscreen ? window.innerWidth * 0.9 : 800;
        canvas.height = isFullscreen ? window.innerHeight * 0.7 : 600;
        const graphData = parseDependencies(inputData);
        if (graphData) drawGraph(graphData.nodes, graphData.edges);
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [inputData, isFullscreen, parseDependencies, drawGraph]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Dependency Graph Visualizer</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package.json Content
            </label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Graph Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Graph Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={graphOptions.showProdDeps}
                  onChange={(e) => setGraphOptions(prev => ({ ...prev, showProdDeps: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Show Production Dependencies</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={graphOptions.showDevDeps}
                  onChange={(e) => setGraphOptions(prev => ({ ...prev, showDevDeps: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Show Dev Dependencies</span>
              </label>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Layout</label>
                <select
                  value={graphOptions.layout}
                  onChange={(e) => setGraphOptions(prev => ({ ...prev, layout: e.target.value }))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="circular">Circular</option>
                  <option value="tree">Tree</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Node Size</label>
                <input
                  type="range"
                  min="15"
                  max="30"
                  value={graphOptions.nodeSize}
                  onChange={(e) => setGraphOptions(prev => ({ ...prev, nodeSize: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Visualize
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={!inputData}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download PNG
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              {isFullscreen ? <FaCompress className="mr-2" /> : <FaExpand className="mr-2" />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Graph Visualization */}
        {(inputData || error) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Dependency Graph</h3>
            <div className="overflow-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[600px] sm:max-h-[800px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DependencyGraphVisualizer;