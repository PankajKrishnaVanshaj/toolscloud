'use client'
import React, { useState, useEffect, useRef } from 'react';

const KineticMolecularTheorySimulator = () => {
  const [particles, setParticles] = useState([]);
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [numParticles, setNumParticles] = useState(50);
  const [containerSize, setContainerSize] = useState(500); // pixels
  const [isRunning, setIsRunning] = useState(false);
  const canvasRef = useRef(null);

  // Constants
  const k = 1.380649e-23; // Boltzmann constant (J/K)
  const m = 6.6464731e-27; // Mass of N2 molecule (kg)
  const pixelToMeter = 1e-10; // Arbitrary scale: 1 pixel = 10^-10 m

  useEffect(() => {
    initializeParticles();
  }, [numParticles, temperature, containerSize]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(updateSimulation, 16); // ~60 FPS
      return () => clearInterval(interval);
    }
  }, [isRunning, particles]);

  useEffect(() => {
    drawSimulation();
  }, [particles]);

  const initializeParticles = () => {
    const newParticles = Array.from({ length: numParticles }, () => {
      // Maxwell-Boltzmann distribution approximation for speed
      const speed = Math.sqrt((2 * k * temperature) / m) * Math.random();
      const angle = Math.random() * 2 * Math.PI;
      return {
        x: Math.random() * containerSize,
        y: Math.random() * containerSize,
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
        radius: 3,
      };
    });
    setParticles(newParticles);
  };

  const updateSimulation = () => {
    setParticles(prev => {
      const newParticles = prev.map(p => ({ ...p }));

      newParticles.forEach(p => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wall collisions (elastic)
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

      // Particle-particle collisions (simplified elastic)
      for (let i = 0; i < newParticles.length; i++) {
        for (let j = i + 1; j < newParticles.length; j++) {
          const p1 = newParticles[i];
          const p2 = newParticles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < p1.radius + p2.radius) {
            const v1x = p1.vx;
            const v1y = p1.vy;
            const v2x = p2.vx;
            const v2y = p2.vy;

            p1.vx = v2x;
            p1.vy = v2y;
            p2.vx = v1x;
            p2.vy = v1y;

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
  };

  const drawSimulation = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, containerSize, containerSize);

    // Draw container
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, containerSize, containerSize);

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'blue';
      ctx.fill();
    });
  };

  const calculatePressure = () => {
    const avgKE = particles.reduce((sum, p) => sum + 0.5 * m * (p.vx * p.vx + p.vy * p.vy), 0) / numParticles;
    const volume = Math.pow(containerSize * pixelToMeter, 3); // Convert to m³ (assuming 3D)
    return (numParticles * avgKE) / volume; // P = (N * KE_avg) / V
  };

  const calculateAvgSpeed = () => {
    return particles.reduce((sum, p) => sum + Math.sqrt(p.vx * p.vx + p.vy * p.vy), 0) / numParticles;
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Kinetic Molecular Theory Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={containerSize}
              height={containerSize}
              className="border border-gray-300 rounded-md"
            />
          </div>

          {/* Controls */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (K)
              </label>
              <input
                type="number"
                min="1"
                value={temperature}
                onChange={(e) => setTemperature(Math.max(1, parseFloat(e.target.value) || 300))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setNumParticles(Math.min(200, Math.max(1, parseInt(e.target.value) || 50)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Container Size (pixels)
              </label>
              <input
                type="number"
                min="100"
                max="800"
                step="10"
                value={containerSize}
                onChange={(e) => setContainerSize(Math.min(800, Math.max(100, parseInt(e.target.value) || 500)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={initializeParticles}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Reset
            </button>
          </div>

          {/* Results */}
          {particles.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Gas Properties:</h2>
              <p>Pressure: {formatNumber(calculatePressure())} Pa</p>
              <p>Avg Speed: {formatNumber(calculateAvgSpeed())} m/s</p>
              <p>Avg Kinetic Energy: {formatNumber((3/2) * k * temperature)} J</p>
              <p>Temperature: {formatNumber(temperature)} K</p>
              <p>Number of Particles: {numParticles}</p>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates gas particles based on Kinetic Molecular Theory.</p>
                <p>Assumptions:</p>
                <ul className="list-disc list-inside">
                  <li>Ideal gas behavior</li>
                  <li>Elastic collisions</li>
                  <li>N2 molecules (m = 6.6464731 × 10⁻²⁷ kg)</li>
                  <li>1 pixel = 10⁻¹⁰ m scale</li>
                </ul>
                <p>Calculates pressure as P = (N * KE_avg) / V and uses Maxwell-Boltzmann speed distribution.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KineticMolecularTheorySimulator;