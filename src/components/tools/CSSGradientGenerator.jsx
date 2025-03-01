'use client'
import React, { useState } from 'react'

const CSSGradientGenerator = () => {
  const [gradientType, setGradientType] = useState('linear') // linear, radial
  const [colorCount, setColorCount] = useState(2)
  const [direction, setDirection] = useState('to right') // For linear gradients
  const [shape, setShape] = useState('circle') // For radial gradients
  const [colors, setColors] = useState(['#FF6B6B', '#4ECDC4'])
  const [gradientCSS, setGradientCSS] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  }

  const generateGradient = () => {
    const newColors = Array.from({ length: Math.min(colorCount, 5) }, generateRandomColor)
    setColors(newColors)

    let css = ''
    if (gradientType === 'linear') {
      css = `linear-gradient(${direction}, ${newColors.join(', ')})`
    } else {
      css = `radial-gradient(${shape}, ${newColors.join(', ')})`
    }

    setGradientCSS(css)
    setIsCopied(false)
  }

  const updateColor = (index, value) => {
    const newColors = [...colors]
    newColors[index] = value
    setColors(newColors)

    let css = ''
    if (gradientType === 'linear') {
      css = `linear-gradient(${direction}, ${newColors.join(', ')})`
    } else {
      css = `radial-gradient(${shape}, ${newColors.join(', ')})`
    }
    setGradientCSS(css)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gradientCSS)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          CSS Gradient Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gradient Type
            </label>
            <select
              value={gradientType}
              onChange={(e) => setGradientType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Colors (2-5)
            </label>
            <input
              type="number"
              min="2"
              max="5"
              value={colorCount}
              onChange={(e) => setColorCount(Math.max(2, Math.min(5, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {gradientType === 'linear' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="to right">To Right</option>
                <option value="to left">To Left</option>
                <option value="to bottom">To Bottom</option>
                <option value="to top">To Top</option>
                <option value="to bottom right">To Bottom Right</option>
                <option value="to bottom left">To Bottom Left</option>
                <option value="to top right">To Top Right</option>
                <option value="to top left">To Top Left</option>
              </select>
            </div>
          )}

          {gradientType === 'radial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shape
              </label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="circle">Circle</option>
                <option value="ellipse">Ellipse</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colors
            </label>
            <div className="grid grid-cols-2 gap-4">
              {colors.map((color, index) => (
                <input
                  key={index}
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(index, e.target.value)}
                  className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateGradient}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Gradient
          </button>

          {gradientCSS && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy CSS'}
              </button>
            </>
          )}
        </div>

        {gradientCSS && (
          <div className="mt-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Gradient Preview:
              </h2>
              <div
                className="w-full h-32 rounded-md border border-gray-300"
                style={{ background: gradientCSS }}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                CSS Code:
              </h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {`background: ${gradientCSS};`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CSSGradientGenerator