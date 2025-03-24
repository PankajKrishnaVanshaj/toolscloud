"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const PlanetaryOrbitSimulator = () => {
  const [planets, setPlanets] = useState([
    {
      mass: 1.989e30, // Sun mass (kg)
      x: 300, y: 300, // Center of canvas
      vx: 0, vy: 0, // Stationary
      radius: 30,
      color: "#FFD700", // Gold for Sun
      fixed: true,
      name: "Sun",
    },
    {
      mass: 5.972e24, // Earth mass (kg)
      x: 450, y: 300, // Initial position
      vx: 0, vy: 29780, // Earth orbital speed (m/s)
      radius: 10,
      color: "#1E90FF", // DodgerBlue for Earth
      fixed: false,
      name: "Earth",
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeScale, setTimeScale] = useState(1000); // Time acceleration factor
  const [trailEnabled, setTrailEnabled] = useState(true);
  const [vectorEnabled, setVectorEnabled] = useState(true);
  const canvasRef = useRef(null);
  const trailRef = useRef({});

  const canvasWidth = 600;
  const canvasHeight = 600;
  const G = 6.67430e-11; // Gravitational constant (m³ kg⁻¹ s⁻²)
  const scale = 1e9; // 1 pixel = 1 billion meters

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(updateSimulation, 16); // ~60 FPS
      return () => clearInterval(interval);
    }
  }, [isRunning, planets, timeScale]);

  useEffect(() => {
    drawSimulation();
  }, [planets, trailEnabled, vectorEnabled]);

  const updateSimulation = useCallback(() => {
    setPlanets((prev) => {
      const newPlanets = prev.map((p) => ({ ...p }));
      const dt = 1 * timeScale;

      for (let i = 0; i < newPlanets.length; i++) {
        if (newPlanets[i].fixed) continue;

        let ax = 0,
          ay = 0;
        for (let j = 0; j < newPlanets.length; j++) {
          if (i === j) continue;

          const p1 = newPlanets[i];
          const p2 = newPlanets[j];
          const dx = (p2.x - p1.x) * scale;
          const dy = (p2.y - p1.y) * scale;
          const r = Math.sqrt(dx * dx + dy * dy);

          if (r < (p1.radius + p2.radius)) continue;

          const force = (G * p1.mass * p2.mass) / (r * r);
          const theta = Math.atan2(dy, dx);
          ax += (force * Math.cos(theta)) / p1.mass;
          ay += (force * Math.sin(theta)) / p1.mass;
        }

        newPlanets[i].vx += ax * dt;
        newPlanets[i].vy += ay * dt;
        newPlanets[i].x += (newPlanets[i].vx * dt) / scale;
        newPlanets[i].y += (newPlanets[i].vy * dt) / scale;

        // Bounce off edges
        if (newPlanets[i].x < p1.radius || newPlanets[i].x > canvasWidth - p1.radius) {
          newPlanets[i].vx *= -0.9; // Dampened bounce
          newPlanets[i].x = Math.max(p1.radius, Math.min(canvasWidth - p1.radius, newPlanets[i].x));
        }
        if (newPlanets[i].y < p1.radius || newPlanets[i].y > canvasHeight - p1.radius) {
          newPlanets[i].vy *= -0.9;
          newPlanets[i].y = Math.max(p1.radius, Math.min(canvasHeight - p1.radius, newPlanets[i].y));
        }

        // Update trail
        if (trailEnabled && !newPlanets[i].fixed) {
          trailRef.current[i] = trailRef.current[i] || [];
          trailRef.current[i].push({ x: newPlanets[i].x, y: newPlanets[i].y });
          if (trailRef.current[i].length > 200) trailRef.current[i].shift();
        }
      }
      return newPlanets;
    });
  }, [timeScale, trailEnabled]);

  const drawSimulation = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw trails
    if (trailEnabled) {
      Object.entries(trailRef.current).forEach(([index, trail]) => {
        if (!planets[index].fixed) {
          ctx.beginPath();
          ctx.strokeStyle = `${planets[index].color}80`; // 50% opacity
          ctx.lineWidth = 1;
          trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
      });
    }

    // Draw planets and vectors
    planets.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      if (vectorEnabled && !p.fixed) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx / 1000, p.y + p.vy / 1000);
        ctx.strokeStyle = "limegreen";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const resetSimulation = () => {
    setPlanets([
      { mass: 1.989e30, x: 300, y: 300, vx: 0, vy: 0, radius: 30, color: "#FFD700", fixed: true, name: "Sun" },
      { mass: 5.972e24, x: 450, y: 300, vx: 0, vy: 29780, radius: 10, color: "#1E90FF", fixed: false, name: "Earth" },
    ]);
    setIsRunning(false);
    setTimeScale(1000);
    trailRef.current = {};
  };

  const addPlanet = () => {
    setPlanets((prev) => [
      ...prev,
      {
        mass: 4.867e24, // Venus mass (kg)
        x: 200,
        y: 300,
        vx: 0,
        vy: -35000, // Approx Venus orbital speed
        radius: 12,
        color: "#FFA500", // Orange for Venus
        fixed: false,
        name: `Planet ${prev.length}`,
      },
    ]);
  };

  const removePlanet = (index) => {
    if (planets.length > 1 && !planets[index].fixed) {
      setPlanets((prev) => prev.filter((_, i) => i !== index));
      delete trailRef.current[index];
    }
  };

  const handlePlanetChange = (index, field, value) => {
    setPlanets((prev) => {
      const newPlanets = [...prev];
      newPlanets[index] = {
        ...newPlanets[index],
        [field]:
          field === "mass" || field === "radius"
            ? Math.max(1, parseFloat(value) || 1)
            : parseFloat(value) || 0,
      };
      return newPlanets;
    });
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Planetary Orbit Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full max-w-[600px] border border-gray-300 rounded-lg shadow-md"
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Scale: 1 px = 1 billion meters | Green: Velocity | Colored Trails: Orbits
          </p>

          {/* Planet Controls */}
          <div className="space-y-4">
            {planets.map((p, i) => (
              <div key={i} className="border p-4 rounded-lg bg-gray-50 relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">{p.name}</h3>
                  {!p.fixed && (
                    <button
                      onClick={() => removePlanet(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700">Mass (kg)</label>
                    <input
                      type="number"
                      value={p.mass}
                      onChange={(e) => handlePlanetChange(i, "mass", e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Radius (px)</label>
                    <input
                      type="number"
                      min="5"
                      value={p.radius}
                      onChange={(e) => handlePlanetChange(i, "radius", e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {!p.fixed && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-700">X Pos (px)</label>
                        <input
                          type="number"
                          value={p.x}
                          onChange={(e) => handlePlanetChange(i, "x", e.target.value)}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">Y Pos (px)</label>
                        <input
                          type="number"
                          value={p.y}
                          onChange={(e) => handlePlanetChange(i, "y", e.target.value)}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">X Vel (m/s)</label>
                        <input
                          type="number"
                          step="100"
                          value={p.vx}
                          onChange={(e) => handlePlanetChange(i, "vx", e.target.value)}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">Y Vel (m/s)</label>
                        <input
                          type="number"
                          step="100"
                          value={p.vy}
                          onChange={(e) => handlePlanetChange(i, "vy", e.target.value)}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={addPlanet}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Planet
            </button>
          </div>

          {/* Simulation Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Scale ({formatNumber(timeScale)} s/frame)
              </label>
              <input
                type="range"
                min="100"
                max="20000"
                step="100"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={trailEnabled}
                  onChange={(e) => setTrailEnabled(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Trails</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={vectorEnabled}
                  onChange={(e) => setVectorEnabled(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Velocity Vectors</span>
              </div>
            </div>
            <div className="flex gap-4 sm:col-span-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                {isRunning ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                {isRunning ? "Pause" : "Start"}
              </button>
              <button
                onClick={resetSimulation}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Multi-body gravitational simulation (F = GMm/r²)</li>
              <li>Add/remove planets with customizable properties</li>
              <li>Adjustable time scale (100-20,000 s/frame)</li>
              <li>Toggleable orbit trails and velocity vectors</li>
              <li>Edge bouncing with dampening</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryOrbitSimulator;