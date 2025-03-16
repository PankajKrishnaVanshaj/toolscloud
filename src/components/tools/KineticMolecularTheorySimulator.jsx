"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading simulation snapshot

const KineticMolecularTheorySimulator = () => {
  const [particles, setParticles] = useState([]);
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [numParticles, setNumParticles] = useState(50);
  const [containerSize, setContainerSize] = useState(500); // pixels
  const [isRunning, setIsRunning] = useState(false);
  const [collisionMode, setCollisionMode] = useState("elastic"); // Elastic or simplified
  const [particleColor, setParticleColor] = useState("blue");
  const [showTrails, setShowTrails] = useState(false);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Constants
  const k = 1.380649e-23; // Boltzmann constant (J/K)
  const m = 6.6464731e-27; // Mass of N2 molecule (kg)
  const pixelToMeter = 1e-10; // 1 pixel = 10^-10 m

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const newParticles = Array.from({ length: numParticles }, () => {
      const speed = Math.sqrt((2 * k * temperature) / m) * Math.random();
      const angle = Math.random() * 2 * Math.PI;
      return {
        x: Math.random() * containerSize,
        y: Math.random() * containerSize,
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
        radius: 3,
        prevX: null,
        prevY: null,
      };
    });
    setParticles(newParticles);
  }, [numParticles, temperature, containerSize]);

  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  // Animation loop
  const updateSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas or fade for trails
    if (!showTrails) {
      ctx.clearRect(0, 0, containerSize, containerSize);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, containerSize, containerSize);
    }

    // Draw container
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, containerSize, containerSize);

    setParticles((prev) => {
      const newParticles = prev.map((p) => ({ ...p }));

      newParticles.forEach((p) => {
        p.prevX = p.x;
        p.prevY = p.y;
        p.x += p.vx;
        p.y += p.vy;

        // Wall collisions
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = -p.vx;
        }
        if (p.x + p.radius > containerSize) {
          p.x = containerSize - p.radius;
          p.vx = -p.vx;
        }
        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = -p.vy;
        }
        if (p.y + p.radius > containerSize) {
          p.y = containerSize - p.radius;
          p.vy = -p.vy;
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
            if (collisionMode === "elastic") {
              const v1x = p1.vx;
              const v1y = p1.vy;
              p1.vx = p2.vx;
              p1.vy = p2.vy;
              p2.vx = v1x;
              p2.vy = v1y;
            } else {
              // Simplified: Reverse velocities
              p1.vx = -p1.vx;
              p1.vy = -p1.vy;
              p2.vx = -p2.vx;
              p2.vy = -p2.vy;
            }

            const overlap = (p1.radius + p2.radius - distance) / 2;
            const angle = Math.atan2(dy, dx);
            p1.x -= overlap * Math.cos(angle);
            p1.y -= overlap * Math.sin(angle);
            p2.x += overlap * Math.cos(angle);
            p2.y += overlap * Math.sin(angle);
          }
        }
      }

      // Draw particles and trails
      newParticles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        if (showTrails && p.prevX !== null && p.prevY !== null) {
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `${particleColor}80`; // 50% opacity
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      return newParticles;
    });

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateSimulation);
    }
  }, [isRunning, containerSize, particleColor, showTrails, collisionMode]);

  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateSimulation);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isRunning, updateSimulation]);

  // Calculations
  const calculatePressure = () => {
    const avgKE =
      particles.reduce((sum, p) => sum + 0.5 * m * (p.vx * p.vx + p.vy * p.vy), 0) /
      numParticles;
    const volume = Math.pow(containerSize * pixelToMeter, 3);
    return (numParticles * avgKE) / volume;
  };

  const calculateAvgSpeed = () => {
    return (
      particles.reduce((sum, p) => sum + Math.sqrt(p.vx * p.vx + p.vy * p.vy), 0) /
      numParticles
    );
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  // Download snapshot
  const downloadSnapshot = () => {
    const canvas = canvasRef.current;
    html2canvas(canvas).then((canvas) => {
      const link = document.createElement("a");
      link.download = `kmt-simulation-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Kinetic Molecular Theory Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={containerSize}
              height={containerSize}
              className="border-2 border-gray-300 rounded-lg shadow-md"
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (K)
              </label>
              <input
                type="number"
                min="1"
                value={temperature}
                onChange={(e) =>
                  setTemperature(Math.max(1, parseFloat(e.target.value) || 300))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Particles
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={numParticles}
                onChange={(e) =>
                  setNumParticles(Math.min(200, Math.max(1, parseInt(e.target.value) || 50)))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Container Size (px)
              </label>
              <input
                type="number"
                min="200"
                max="800"
                step="10"
                value={containerSize}
                onChange={(e) =>
                  setContainerSize(Math.min(800, Math.max(200, parseInt(e.target.value) || 500)))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Particle Color
              </label>
              <select
                value={particleColor}
                onChange={(e) => setParticleColor(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
              </select>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collision Mode
              </label>
              <select
                value={collisionMode}
                onChange={(e) => setCollisionMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="elastic">Elastic</option>
                <option value="simplified">Simplified</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Particle Trails</span>
              </label>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isRunning ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              onClick={initializeParticles}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
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

          {/* Results */}
          {particles.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Gas Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <p>Pressure: {formatNumber(calculatePressure())} Pa</p>
                <p>Avg Speed: {formatNumber(calculateAvgSpeed())} m/s</p>
                <p>Avg Kinetic Energy: {formatNumber((3 / 2) * k * temperature)} J</p>
                <p>Temperature: {formatNumber(temperature)} K</p>
                <p>Number of Particles: {numParticles}</p>
                <p>Volume: {formatNumber(Math.pow(containerSize * pixelToMeter, 3))} m³</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">About</h3>
            <p className="text-sm text-blue-600">
              Simulates gas particles based on Kinetic Molecular Theory with ideal gas
              assumptions. Uses Maxwell-Boltzmann speed distribution and calculates
              pressure as P = (N * KE_avg) / V.
            </p>
            <ul className="list-disc list-inside text-sm text-blue-600 mt-2">
              <li>N₂ molecules (m = 6.6464731 × 10⁻²⁷ kg)</li>
              <li>1 pixel = 10⁻¹⁰ m scale</li>
              <li>Elastic or simplified collisions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KineticMolecularTheorySimulator;