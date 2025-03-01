'use client'
import React, { useState } from 'react'

const RandomColorPaletteGenerator = () => {
  const [paletteSize, setPaletteSize] = useState(5)
  const [palette, setPalette] = useState([])
  const [isCopied, setIsCopied] = useState(null) // null or index of copied color

  const generatePalette = () => {
    const newPalette = Array.from({ length: Math.min(paletteSize, 10) }, () => {
      const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      return `#${hex.toUpperCase()}`
    })
    setPalette(newPalette)
    setIsCopied(null)
  }

  const copyToClipboard = (index) => {
    navigator.clipboard.writeText(palette[index])
      .then(() => {
        setIsCopied(index)
        setTimeout(() => setIsCopied(null), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const copyAllToClipboard = () => {
    navigator.clipboard.writeText(palette.join(', '))
      .then(() => {
        setIsCopied(-1) // Special value for all colors
        setTimeout(() => setIsCopied(null), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = palette.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `palette-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsCSS = () => {
    const css = `:root {\n${palette.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`
    const blob = new Blob([css], { type: 'text/css;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `palette-${Date.now()}.css`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearPalette = () => {
    setPalette([])
    setIsCopied(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random Color Palette Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Palette Size (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={paletteSize}
              onChange={(e) => setPaletteSize(Math.max(1, Math.min(10, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generatePalette}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Palette
          </button>

          {palette.length > 0 && (
            <>
              <button
                onClick={copyAllToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied === -1
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied === -1 ? 'Copied All!' : 'Copy All'}
              </button>

              <button
                onClick={downloadAsText}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download TXT
              </button>

              <button
                onClick={exportAsCSS}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Export CSS
              </button>

              <button
                onClick={clearPalette}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {palette.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Palette ({palette.length} colors):
            </h2>
            <div className="space-y-4">
              {palette.map((color, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-16 h-16 rounded-md border border-gray-300 flex-shrink-0" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono text-sm text-gray-800 flex-1">
                    {color}
                  </span>
                  <button
                    onClick={() => copyToClipboard(index)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      isCopied === index
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {isCopied === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomColorPaletteGenerator