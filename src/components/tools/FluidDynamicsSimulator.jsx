"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading simulation snapshot

const FluidDynamicsSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [viscosity, setViscosity] = useState(0.02);
  const [inflowVelocity, setInflowVelocity] = useState(0.1);
  const [displayMode, setDisplayMode] = useState("speed"); // "speed", "density", "vorticity"
  const [obstacleSize, setObstacleSize] = useState(1);
  const canvasRef = useRef(null);

  // Simulation parameters
  const width = 100; // Grid width
  const height = 50; // Grid height
  const scale = 6; // Pixels per grid cell
  const canvasWidth = width * scale;
  const canvasHeight = height * scale;

  // Lattice Boltzmann variables
  const [f, setF] = useState(() => initializeFluid());
  const [obstacles, setObstacles] = useState(() => new Set());

  // D2Q9 lattice velocities and weights
  const e = [
    [0, 0], [1, 0], [0, 1], [-1, 0], [0, -1],
    [1, 1], [-1, 1], [-1, -1], [1, -1],
  ];
  const w = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];

  function initializeFluid() {
    return Array(height)
      .fill()
      .map(() => Array(width).fill().map(() => Array(9).fill(1 / 9)));
  }

  // Simulation step
  const stepSimulation = useCallback(() => {
    setF((prevF) => {
      const newF = prevF.map((row) => row.map((cell) => [...cell]));
      const rho = Array(height).fill().map(() => Array(width).fill(0));
      const ux = Array(height).fill().map(() => Array(width).fill(0));
      const uy = Array(height).fill().map(() => Array(width).fill(0));

      // Compute macroscopic variables
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let density = 0;
          let velX = 0;
          let velY = 0;
          for (let i = 0; i < 9; i++) {
            density += newF[y][x][i];
            velX += newF[y][x][i] * e[i][0];
            velY += newF[y][x][i] * e[i][1];
          }
          rho[y][x] = density;
          ux[y][x] = velX / density;
          uy[y][x] = velY / density;
        }
      }

      // Collision step
      const tau = 3 * viscosity + 0.5;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const u2 = ux[y][x] * ux[y][x] + uy[y][x] * uy[y][x];
          for (let i = 0; i < 9; i++) {
            const eu = e[i][0] * ux[y][x] + e[i][1] * uy[y][x];
            const feq = w[i] * rho[y][x] * (1 + 3 * eu + 4.5 * eu * eu - 1.5 * u2);
            newF[y][x][i] += (feq - newF[y][x][i]) / tau;
          }
        }
      }

      // Streaming step
      const tempF = newF.map((row) => row.map((cell) => [...cell]));
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          for (let i = 0; i < 9; i++) {
            const newX = (x + e[i][0] + width) % width;
            const newY = (y + e[i][1] + height) % height;
            newF[newY][newX][i] = tempF[y][x][i];
          }
        }
      }

      // Boundary conditions
      for (let y = 0; y < height; y++) {
        const rhoIn = 1.0;
        const uIn = inflowVelocity;
        for (let i = 0; i < 9; i++) {
          const eu = e[i][0] * uIn;
          newF[y][0][i] = w[i] * rhoIn * (1 + 3 * eu + 4.5 * eu * eu - 1.5 * uIn * uIn);
        }
        for (let i = 0; i < 9; i++) {
          newF[y][width - 1][i] = newF[y][width - 2][i];
        }
      }

      // Obstacles (bounce-back)
      obstacles.forEach(([ox, oy]) => {
        for (let i = 0; i < 9; i++) {
          const newX = (ox + e[i][0] + width) % width;
          const newY = (oy + e[i][1] + height) % height;
          const opp = [0, 3, 4, 1, 2, 7, 8, 5, 6][i];
          newF[oy][ox][i] = tempF[newY][newX][opp];
        }
      });

      return newF;
    });
  }, [viscosity, inflowVelocity, obstacles]);

  // Run simulation
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(stepSimulation, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning, stepSimulation]);

  // Draw fluid
  const drawFluid = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rho = 0;
        let ux = 0;
        let uy = 0;
        for (let i = 0; i < 9; i++) {
          rho += f[y][x][i];
          ux += f[y][x][i] * e[i][0];
          uy += f[y][x][i] * e[i][1];
        }
        const density = rho;
        const velX = ux / density;
        const velY = uy / density;
        const speed = Math.sqrt(velX * velX + velY * velY);
        const vorticity = y > 0 && y < height - 1 && x < width - 1
          ? (ux[y + 1][x] - ux[y - 1][x]) - (uy[y][x + 1] - uy[y][x - 1])
          : 0;

        // Visualization based on display mode
        let r, g, b;
        if (displayMode === "speed") {
          r = Math.min(255, speed * 2000);
          b = Math.min(255, (1 - speed) * 2000);
          g = 0;
        } else if (displayMode === "density") {
          const d = Math.min(255, (density - 0.8) * 1000);
          r = g = b = d;
        } else if (displayMode === "vorticity") {
          r = vorticity > 0 ? Math.min(255, vorticity * 500) : 0;
          b = vorticity < 0 ? Math.min(255, -vorticity * 500) : 0;
          g = 0;
        }
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * scale, y * scale, scale, scale);

        // Obstacles
        if (obstacles.has(`${x},${y}`)) {
          ctx.fillStyle = "black";
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
  }, [f, displayMode, obstacles]);

  useEffect(() => {
    drawFluid();
  }, [drawFluid]);

  // Handle obstacle placement
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);
    setObstacles((prev) => {
      const newObstacles = new Set(prev);
      for (let dy = -obstacleSize + 1; dy < obstacleSize; dy++) {
        for (let dx = -obstacleSize + 1; dx < obstacleSize; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const key = `${nx},${ny}`;
            if (newObstacles.has(key)) {
              newObstacles.delete(key);
            } else {
              newObstacles.add(key);
            }
          }
        }
      }
      return newObstacles;
    });
  };

  // Download snapshot
  const downloadSnapshot = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `fluid-simulation-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Fluid Dynamics Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleCanvasClick}
              className="w-full border border-gray-300 rounded-lg cursor-pointer shadow-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              {displayMode === "speed" && "Red: High speed | Blue: Low speed"}
              {displayMode === "density" && "Grayscale: Density (darker = higher)"}
              {displayMode === "vorticity" && "Red: Positive vorticity | Blue: Negative vorticity"}
              {" | Black: Obstacles (click to add/remove)"}
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Viscosity ({viscosity.toFixed(2)})
              </label>
              <input
                type="range"
                min="0.01"
                max="0.1"
                step="0.01"
                value={viscosity}
                onChange={(e) => setViscosity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inflow Velocity ({inflowVelocity.toFixed(2)})
              </label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={inflowVelocity}
                onChange={(e) => setInflowVelocity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="speed">Speed</option>
                <option value="density">Density</option>
                <option value="vorticity">Vorticity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obstacle Size ({obstacleSize}x{obstacleSize})
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={obstacleSize}
                onChange={(e) => setObstacleSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isRunning ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => {
                setF(initializeFluid());
                setObstacles(new Set());
                setIsRunning(false);
              }}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadSnapshot}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Lattice Boltzmann Method (D2Q9) simulation</li>
              <li>Multiple display modes: Speed, Density, Vorticity</li>
              <li>Adjustable viscosity and inflow velocity</li>
              <li>Interactive obstacles with variable size</li>
              <li>Download simulation snapshot as PNG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FluidDynamicsSimulator;