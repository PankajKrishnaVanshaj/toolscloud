'use client'
import React, { useState, useEffect, useRef } from 'react'

const PatternGenerator = () => {
  const [patternType, setPatternType] = useState('grid') // grid, circles, waves
  const [size, setSize] = useState(20)
  const [primaryColor, setPrimaryColor] = useState('#4B5EAA')
  const [secondaryColor, setSecondaryColor] = useState('#DCE2F0')
  const canvasRef = useRef(null)

  useEffect(() => {
    generatePattern()
  }, [patternType, size, primaryColor, secondaryColor])

  const generatePattern = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = secondaryColor
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = primaryColor
    ctx.lineWidth = 2

    switch (patternType) {
      case 'grid':
        for (let x = 0; x <= width; x += size) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        for (let y = 0; y <= height; y += size) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        break

      case 'circles':
        for (let x = size / 2; x <= width; x += size) {
          for (let y = size / 2; y <= height; y += size) {
            ctx.beginPath()
            ctx.arc(x, y, size / 2 - 2, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
        break

      case 'waves':
        ctx.beginPath()
        for (let x = 0; x <= width; x += 5) {
          const y = height / 2 + Math.sin(x / size) * (height / 4)
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
        for (let x = 0; x <= width; x += 5) {
          const y = height / 2 + Math.cos(x / size) * (height / 4)
          ctx.beginPath()
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
        break

      default:
        break
    }
  }

  const downloadAsImage = () => {
    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `pattern-${Date.now()}.png`
    link.click()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = secondaryColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Pattern Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pattern Type
            </label>
            <select
              value={patternType}
              onChange={(e) => setPatternType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="grid">Grid</option>
              <option value="circles">Circles</option>
              <option value="waves">Waves</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size (10-100)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={size}
              onChange={(e) => setSize(Math.max(10, Math.min(100, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generatePattern}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Pattern
          </button>

          <button
            onClick={downloadAsImage}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download PNG
          </button>

          <button
            onClick={clearCanvas}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Clear
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Pattern Preview:
          </h2>
          <canvas
            ref={canvasRef}
            width={500}
            height={300}
            className="w-full border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  )
}

export default PatternGenerator