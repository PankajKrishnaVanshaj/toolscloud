"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const ParticleCollisionSimulator = () => {
  const [particles, setParticles] = useState([
    { x: 200, y: 300, vx: 2, vy: 0, mass: 1, radius: 20, color: "red" },
    { x: 400, y: 300, vx: -2, vy: 0, mass: 1, radius: 20, color: "blue" },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [gravity, setGravity] = useState(0);
  const [showVectors, setShowVectors] = useState(true);
  const [collisionType, setCollisionType] = useState("elastic");
  const canvasRef = useRef(null);
  const canvasWidth = 800; // Increased for more space
  const canvasHeight = 600;

  // Simulation update loop
  useEffect(() => {
    let animationFrameId;
    const update = () => {
      if (isRunning) {
        updateSimulation();
        drawParticles();
        animationFrameId = requestAnimationFrame(update);
      }
    };
    if (isRunning) animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, particles, timeScale, gravity, collisionType]);

  // Draw particles
  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    particles.forEach((p) => {
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();

      // Draw velocity vector
      if (showVectors) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 10, p.y + p.vy * 10);
        ctx.strokeStyle = "green";
        ctx.stroke();
      }
    });
  }, [particles, showVectors]);

  // Update simulation
  const updateSimulation = useCallback(() => {
    setParticles((prev) => {
      const newParticles = prev.map((p) => ({ ...p }));

      newParticles.forEach((p) => {
        // Apply gravity
        p.vy += gravity * timeScale;

        // Update positions
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;

        // Wall collisions
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = collisionType === "elastic" ? -p.vx : 0;
        }
        if (p.x + p.radius > canvasWidth) {
          p.x = canvasWidth - p.radius;
          p.vx = collisionType === "elastic" ? -p.vx : 0;
        }
        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = collisionType === "elastic" ? -p.vy : 0;
        }
        if (p.y + p.radius > canvasHeight) {
          p.y = canvasHeight - p.radius;
          p.vy = collisionType === "elastic" ? -p.vy : 0;
        }
      });

      // Particle-particle collisions
      for (let i = 0; i < newParticles.length; i++) {
        for (let j = i + 1; j < newParticles.length; j++) {
          const p1 = newParticles[i];
          const p2 = newParticles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < p1.radius + p2.radius) {
            if (collisionType === "elastic") {
              // Elastic collision
              const v1x = p1.vx;
              const v1y = p1.vy;
              const v2x = p2.vx;
              const v2y = p2.vy;
              const m1 = p1.mass;
              const m2 = p2.mass;

              p1.vx = ((m1 - m2) * v1x + 2 * m2 * v2x) / (m1 + m2);
              p1.vy = ((m1 - m2) * v1y + 2 * m2 * v2y) / (m1 + m2);
              p2.vx = ((m2 - m1) * v2x + 2 * m1 * v1x) / (m1 + m2);
              p2.vy = ((m2 - m1) * v2y + 2 * m1 * v1y) / (m1 + m2);
            } else {
              // Inelastic collision (stick together)
              const totalMass = p1.mass + p2.mass;
              p1.vx = (p1.vx * p1.mass + p2.vx * p2.mass) / totalMass;
              p1.vy = (p1.vy * p1.mass + p2.vy * p2.mass) / totalMass;
              p2.vx = p1.vx;
              p2.vy = p1.vy;
            }

            // Prevent overlap
            const overlap = (p1.radius + p2.radius - distance) / 2;
            const angle = Math.atan2(dy, dx);
            p1.x -= overlap * Math.cos(angle);
            p1.y -= overlap * Math.sin(angle);
            p2.x += overlap * Math.cos(angle);
            p2.y += overlap * Math.sin(angle);
          }
        }
      }

      return newParticles;
    });
  }, [timeScale, gravity, collisionType]);

  // Reset simulation
  const resetSimulation = () => {
    setParticles([
      { x: 200, y: 300, vx: 2, vy: 0, mass: 1, radius: 20, color: "red" },
      { x: 400, y: 300, vx: -2, vy: 0, mass: 1, radius: 20, color: "blue" },
    ]);
    setIsRunning(false);
    setGravity(0);
    setTimeScale(1);
  };

  // Add new particle
  const addParticle = () => {
    const colors = ["red", "blue", "green", "purple", "orange"];
    setParticles((prev) => [
      ...prev,
      {
        x: Math.random() * (canvasWidth - 40) + 20,
        y: Math.random() * (canvasHeight - 40) + 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        mass: 1,
        radius: 20,
        color: colors[Math.floor(Math.random() * colors.length)],
      },
    ]);
  };

  // Remove particle
  const removeParticle = (index) => {
    setParticles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle particle property changes
  const handleParticleChange = (index, field, value) => {
    setParticles((prev) => {
      const newParticles = [...prev];
      newParticles[index] = {
        ...newParticles[index],
        [field]: field === "color" ? value : parseFloat(value) || 0,
      };
      return newParticles;
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Particle Collision Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-300 rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Colors: Particles | Green: Velocity Vectors
            </p>
          </div>

          {/* Simulation Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Scale ({timeScale.toFixed(1)}x)
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gravity ({gravity.toFixed(2)})
              </label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collision Type
              </label>
              <select
                value={collisionType}
                onChange={(e) => setCollisionType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="elastic">Elastic</option>
                <option value="inelastic">Inelastic</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Vectors</span>
              </label>
            </div>
          </div>

          {/* Particle Controls */}
          <div className="space-y-4">
            {particles.map((p, i) => (
              <div
                key={i}
                className="border p-4 rounded-lg bg-gray-50 relative"
              >
                <h3 className="font-semibold mb-2 text-gray-800">
                  Particle {i + 1}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {["x", "y", "vx", "vy", "mass", "radius"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm text-gray-700 capitalize">
                        {field === "vx" || field === "vy" ? field.toUpperCase() : field}
                      </label>
                      <input
                        type="number"
                        step={field === "mass" || field === "vx" || field === "vy" ? "0.1" : "1"}
                        min={field === "mass" ? "0.1" : field === "radius" ? "5" : null}
                        value={p[field]}
                        onChange={(e) => handleParticleChange(i, field, e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm text-gray-700">Color</label>
                    <select
                      value={p.color}
                      onChange={(e) => handleParticleChange(i, "color", e.target.value)}
                      className="w-full px-2 py-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => removeParticle(i)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={addParticle}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Particle
            </button>
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
              onClick={resetSimulation}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Elastic and inelastic collision types</li>
              <li>Adjustable gravity</li>
              <li>Customizable particles (position, velocity, mass, radius, color)</li>
              <li>Dynamic addition/removal of particles</li>
              <li>Velocity vector visualization (toggleable)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleCollisionSimulator;