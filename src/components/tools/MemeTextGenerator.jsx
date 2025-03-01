'use client'
import React, { useState } from 'react'

const MemeTextGenerator = () => {
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(40)
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [outlineColor, setOutlineColor] = useState('#000000')
  const [isCopied, setIsCopied] = useState(false)

  const generateMemeTextStyle = (position) => ({
    fontFamily: 'Impact, sans-serif',
    fontSize: `${fontSize}px`,
    color: textColor,
    textTransform: 'uppercase',
    textAlign: 'center',
    WebkitTextStroke: `2px ${outlineColor}`,
    position: 'absolute',
    width: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    ...(position === 'top' ? { top: '10px' } : { bottom: '10px' })
  })

  const copyToClipboard = () => {
    const text = `${topText}\n${bottomText}`
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const resetForm = () => {
    setTopText('')
    setBottomText('')
    setFontSize(40)
    setTextColor('#FFFFFF')
    setOutlineColor('#000000')
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Meme Text Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top Text
            </label>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter top text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bottom Text
            </label>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter bottom text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size (20-80px)
            </label>
            <input
              type="number"
              min="20"
              max="80"
              value={fontSize}
              onChange={(e) => setFontSize(Math.max(20, Math.min(80, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outline Color
              </label>
              <input
                type="color"
                value={outlineColor}
                onChange={(e) => setOutlineColor(e.target.value)}
                className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={copyToClipboard}
            className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isCopied
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
            }`}
          >
            {isCopied ? 'Copied!' : 'Copy Text'}
          </button>

          <button
            onClick={resetForm}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Preview:
          </h2>
          <div className="relative w-full h-64 bg-gray-300 rounded-md overflow-hidden">
            {/* Placeholder background */}
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600" />
            
            {/* Meme text */}
            {topText && (
              <div style={generateMemeTextStyle('top')}>
                {topText}
              </div>
            )}
            {bottomText && (
              <div style={generateMemeTextStyle('bottom')}>
                {bottomText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemeTextGenerator