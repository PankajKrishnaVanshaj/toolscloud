'use client'
import React, { useState, useEffect, useRef } from 'react';

const FluidDynamicsSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [viscosity, setViscosity] = useState(0.02);
  const [inflowVelocity, setInflowVelocity] = useState(0.1);
  const canvasRef = useRef(null);

  // Simulation parameters
  const width = 100; // Grid width
  const height = 50; // Grid height
  const scale = 6; // Pixels per grid cell
  const canvasWidth = width * scale;
  const canvasHeight = height * scale;

  // Lattice Boltzmann variables
  const [f, setF] = useState(() => initializeFluid()); // Distribution functions
  const [obstacles, setObstacles] = useState(() => new Set());

  // D2Q9 lattice velocities
  const e = [
    [0, 0], [1, 0], [0, 1], [-1, 0], [0, -1],
    [1, 1], [-1, 1], [-1, -1], [1, -1]
  ];
  const w = [4/9, 1/9, 1/9, 1/9, 1/9, 1/36, 1/36, 1/36, 1/36]; // Weights

  function initializeFluid() {
    const grid = Array(height).fill().map(() =>
      Array(width).fill().map(() => Array(9).fill(1/9))
    );
    return grid;
  }

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        stepSimulation();
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRunning, viscosity, inflowVelocity, obstacles]);

  useEffect(() => {
    drawFluid();
  }, [f]);

  const stepSimulation = () => {
    setF(prevF => {
      const newF = prevF.map(row => row.map(cell => [...cell]));
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
      const tau = 3 * viscosity + 0.5; // Relaxation time
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
      const tempF = newF.map(row => row.map(cell => [...cell]));
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
        // Inflow (left boundary)
        const rhoIn = 1.0;
        const uIn = inflowVelocity;
        for (let i = 0; i < 9; i++) {
          const eu = e[i][0] * uIn;
          newF[y][0][i] = w[i] * rhoIn * (1 + 3 * eu + 4.5 * eu * eu - 1.5 * uIn * uIn);
        }

        // Outflow (right boundary) - simple copy
        for (let i = 0; i < 9; i++) {
          newF[y][width - 1][i] = newF[y][width - 2][i];
        }
      }

      // Obstacles (bounce-back)
      obstacles.forEach(([ox, oy]) => {
        for (let i = 0; i < 9; i++) {
          const newX = (ox + e[i][0] + width) % width;
          const newY = (oy + e[i][1] + height) % height;
          const opp = [0, 3, 4, 1, 2, 7, 8, 5, 6][i]; // Opposite direction
          newF[oy][ox][i] = tempF[newY][newX][opp];
        }
      });

      return newF;
    });
  };

  const drawFluid = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Compute density and velocity for visualization
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
        const speed = Math.sqrt(ux * ux + uy * uy) / density;

        // Color based on speed
        const r = Math.min(255, speed * 2000);
        const b = Math.min(255, (1 - speed) * 2000);
        ctx.fillStyle = `rgb(${r}, 0, ${b})`;
        ctx.fillRect(x * scale, y * scale, scale, scale);

        // Obstacles
        if (obstacles.has(`${x},${y}`)) {
          ctx.fillStyle = 'black';
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);
    const key = `${x},${y}`;
    setObstacles(prev => {
      const newObstacles = new Set(prev);
      if (newObstacles.has(key)) {
        newObstacles.delete(key);
      } else {
        newObstacles.add(key);
      }
      return newObstacles;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
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
              className="w-full border border-gray-300 rounded-md cursor-pointer"
            />
            <p className="text-sm text-gray-600 mt-2">
              Red: High speed | Blue: Low speed | Black: Obstacles (click to add/remove)
            </p>
          </div>

          {/* Controls */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Viscosity
              </label>
              <input
                type="range"
                min="0.01"
                max="0.1"
                step="0.01"
                value={viscosity}
                onChange={(e) => setViscosity(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600">{viscosity.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inflow Velocity
              </label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={inflowVelocity}
                onChange={(e) => setInflowVelocity(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600">{inflowVelocity.toFixed(2)}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setF(initializeFluid());
                  setObstacles(new Set());
                  setIsRunning(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates 2D fluid flow using the Lattice Boltzmann Method (D2Q9).</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>Fluid density and velocity visualization</li>
                  <li>Interactive obstacles</li>
                  <li>Adjustable viscosity and inflow</li>
                  <li>Simplified boundary conditions</li>
                </ul>
                <p>Click canvas to add/remove obstacles. Flow is from left to right.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FluidDynamicsSimulator;