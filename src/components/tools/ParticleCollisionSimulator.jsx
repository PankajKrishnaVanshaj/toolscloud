
'use client'; 

import React, { useState, useEffect, useRef } from 'react';

const ParticleCollisionSimulator = () => {
  const [particles, setParticles] = useState([
    { x: 200, y: 300, vx: 2, vy: 0, mass: 1, radius: 20 },
    { x: 400, y: 300, vx: -2, vy: 0, mass: 1, radius: 20 },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const canvasRef = useRef(null);

  const canvasWidth = 600;
  const canvasHeight = 600;

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        updateSimulation();
      }, 16 / timeScale); // ~60 FPS adjusted by time scale
      return () => clearInterval(interval);
    }
  }, [isRunning, timeScale, particles]);

  useEffect(() => {
    drawParticles();
  }, [particles]);

  const updateSimulation = () => {
    setParticles(prev => {
      const newParticles = prev.map(p => ({ ...p }));

      // Update positions
      newParticles.forEach(p => {
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;

        // Wall collisions (elastic)
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = -p.vx;
        }
        if (p.x + p.radius > canvasWidth) {
          p.x = canvasWidth - p.radius;
          p.vx = -p.vx;
        }
        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = -p.vy;
        }
        if (p.y + p.radius > canvasHeight) {
          p.y = canvasHeight - p.radius;
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
            // Elastic collision
            const v1x = p1.vx;
            const v1y = p1.vy;
            const v2x = p2.vx;
            const v2y = p2.vy;
            const m1 = p1.mass;
            const m2 = p2.mass;

            // New velocities after elastic collision
            p1.vx = ((m1 - m2) * v1x + 2 * m2 * v2x) / (m1 + m2);
            p1.vy = ((m1 - m2) * v1y + 2 * m2 * v2y) / (m1 + m2);
            p2.vx = ((m2 - m1) * v2x + 2 * m1 * v1x) / (m1 + m2);
            p2.vy = ((m2 - m1) * v2y + 2 * m1 * v1y) / (m1 + m2);

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
  };

  const drawParticles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw particles
    particles.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? 'red' : 'blue';
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();

      // Draw velocity vector
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 10, p.y + p.vy * 10);
      ctx.strokeStyle = 'green';
      ctx.stroke();
    });
  };

  const resetSimulation = () => {
    setParticles([
      { x: 200, y: 300, vx: 2, vy: 0, mass: 1, radius: 20 },
      { x: 400, y: 300, vx: -2, vy: 0, mass: 1, radius: 20 },
    ]);
    setIsRunning(false);
  };

  const handleParticleChange = (index, field, value) => {
    setParticles(prev => {
      const newParticles = [...prev];
      newParticles[index] = {
        ...newParticles[index],
        [field]: parseFloat(value) || 0,
      };
      return newParticles;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Particle Collision Simulator
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
              Red/Blue: Particles | Green: Velocity Vectors
            </p>
          </div>

          {/* Controls */}
          <div className="grid gap-4">
            {particles.map((p, i) => (
              <div key={i} className="border p-4 rounded-md">
                <h3 className="font-semibold mb-2">Particle {i + 1}</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-gray-700">X Position</label>
                    <input
                      type="number"
                      value={p.x}
                      onChange={(e) => handleParticleChange(i, 'x', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Y Position</label>
                    <input
                      type="number"
                      value={p.y}
                      onChange={(e) => handleParticleChange(i, 'y', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">X Velocity</label>
                    <input
                      type="number"
                      step="0.1"
                      value={p.vx}
                      onChange={(e) => handleParticleChange(i, 'vx', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Y Velocity</label>
                    <input
                      type="number"
                      step="0.1"
                      value={p.vy}
                      onChange={(e) => handleParticleChange(i, 'vy', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Mass</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={p.mass}
                      onChange={(e) => handleParticleChange(i, 'mass', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Radius</label>
                    <input
                      type="number"
                      min="5"
                      value={p.radius}
                      onChange={(e) => handleParticleChange(i, 'radius', e.target.value)}
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
                Time Scale
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600">{timeScale.toFixed(1)}x</p>
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
                <p>Simulates elastic 2D collisions between particles.</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>Elastic collisions with momentum and energy conservation</li>
                  <li>Wall bounces</li>
                  <li>Adjustable initial conditions</li>
                  <li>Velocity vectors visualization</li>
                </ul>
                <p>Uses simplified 2D physics with arbitrary units.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleCollisionSimulator;