'use client'
import React, { useState, useEffect, useRef } from 'react';

const PlanetaryOrbitSimulator = () => {
  const [planets, setPlanets] = useState([
    {
      mass: 1.989e30, // Sun mass (kg)
      x: 300, y: 300, // Center of canvas
      vx: 0, vy: 0, // Stationary
      radius: 30,
      color: 'yellow',
      fixed: true,
    },
    {
      mass: 5.972e24, // Earth mass (kg)
      x: 450, y: 300, // Initial position
      vx: 0, vy: 29780, // Initial velocity (m/s, ~Earth orbital speed)
      radius: 10,
      color: 'blue',
      fixed: false,
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeScale, setTimeScale] = useState(1000); // Time acceleration factor
  const canvasRef = useRef(null);
  const trailRef = useRef([]);

  const canvasWidth = 600;
  const canvasHeight = 600;
  const G = 6.67430e-11; // Gravitational constant (m³ kg⁻¹ s⁻²)
  const scale = 1e9; // 1 pixel = 1 billion meters for visualization

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        updateSimulation();
      }, 16); // ~60 FPS
      return () => clearInterval(interval);
    }
  }, [isRunning, planets]);

  useEffect(() => {
    drawSimulation();
  }, [planets]);

  const updateSimulation = () => {
    setPlanets(prev => {
      const newPlanets = prev.map(p => ({ ...p }));
      const dt = 1 * timeScale; // Time step in seconds

      // Calculate gravitational forces
      for (let i = 0; i < newPlanets.length; i++) {
        if (newPlanets[i].fixed) continue;

        let ax = 0, ay = 0;
        for (let j = 0; j < newPlanets.length; j++) {
          if (i === j) continue;

          const p1 = newPlanets[i];
          const p2 = newPlanets[j];
          const dx = (p2.x - p1.x) * scale;
          const dy = (p2.y - p1.y) * scale;
          const r = Math.sqrt(dx * dx + dy * dy);
          
          if (r < (p1.radius + p2.radius) * scale) continue; // Avoid division by zero

          const force = (G * p1.mass * p2.mass) / (r * r);
          const theta = Math.atan2(dy, dx);
          ax += (force * Math.cos(theta)) / p1.mass;
          ay += (force * Math.sin(theta)) / p1.mass;
        }

        // Update velocity and position
        newPlanets[i].vx += ax * dt;
        newPlanets[i].vy += ay * dt;
        newPlanets[i].x += (newPlanets[i].vx * dt) / scale;
        newPlanets[i].y += (newPlanets[i].vy * dt) / scale;

        // Keep within bounds (optional)
        newPlanets[i].x = Math.max(0, Math.min(canvasWidth, newPlanets[i].x));
        newPlanets[i].y = Math.max(0, Math.min(canvasHeight, newPlanets[i].y));

        // Add to trail
        if (i === 1) { // Track only the orbiting planet
          trailRef.current.push({ x: newPlanets[i].x, y: newPlanets[i].y });
          if (trailRef.current.length > 200) trailRef.current.shift();
        }
      }

      return newPlanets;
    });
  };

  const drawSimulation = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw trail
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.lineWidth = 1;
    trailRef.current.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    // Draw planets
    planets.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();

      // Draw velocity vector
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx / 1000, p.y + p.vy / 1000); // Scaled for visibility
      ctx.strokeStyle = 'green';
      ctx.stroke();
    });
  };

  const resetSimulation = () => {
    setPlanets([
      { mass: 1.989e30, x: 300, y: 300, vx: 0, vy: 0, radius: 30, color: 'yellow', fixed: true },
      { mass: 5.972e24, x: 450, y: 300, vx: 0, vy: 29780, radius: 10, color: 'blue', fixed: false },
    ]);
    setIsRunning(false);
    trailRef.current = [];
  };

  const handlePlanetChange = (index, field, value) => {
    setPlanets(prev => {
      const newPlanets = [...prev];
      newPlanets[index] = {
        ...newPlanets[index],
        [field]: field === 'mass' ? parseFloat(value) || 1 : parseFloat(value) || 0,
      };
      return newPlanets;
    });
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Planetary Orbit Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Yellow: Star | Blue: Planet | Green: Velocity | Blue Trail: Orbit
            </p>
          </div>

          {/* Planet Controls */}
          <div className="grid gap-4">
            {planets.map((p, i) => (
              <div key={i} className="border p-4 rounded-md">
                <h3 className="font-semibold mb-2">{i === 0 ? 'Star' : 'Planet'}</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {!p.fixed && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-700">X Position (px)</label>
                        <input
                          type="number"
                          value={p.x}
                          onChange={(e) => handlePlanetChange(i, 'x', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">Y Position (px)</label>
                        <input
                          type="number"
                          value={p.y}
                          onChange={(e) => handlePlanetChange(i, 'y', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">X Velocity (m/s)</label>
                        <input
                          type="number"
                          step="100"
                          value={p.vx}
                          onChange={(e) => handlePlanetChange(i, 'vx', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">Y Velocity (m/s)</label>
                        <input
                          type="number"
                          step="100"
                          value={p.vy}
                          onChange={(e) => handlePlanetChange(i, 'vy', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm text-gray-700">Mass (kg)</label>
                    <input
                      type="number"
                      value={p.mass}
                      onChange={(e) => handlePlanetChange(i, 'mass', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Radius (px)</label>
                    <input
                      type="number"
                      min="5"
                      value={p.radius}
                      onChange={(e) => handlePlanetChange(i, 'radius', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simulation Controls */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Scale (s per frame)
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600">{formatNumber(timeScale)} s</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetSimulation}
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
                <p>Simulates gravitational orbits using Newtonian mechanics.</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>2D gravitational force: F = GMm/r²</li>
                  <li>Orbit trail visualization</li>
                  <li>Adjustable mass, position, velocity</li>
                  <li>Time scaling for visualization</li>
                </ul>
                <p>Scale: 1 px = 1 billion meters</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryOrbitSimulator;