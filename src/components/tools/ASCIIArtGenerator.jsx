'use client'
import React, { useState } from 'react'

const ASCIIArtGenerator = () => {
  const [inputText, setInputText] = useState('')
  const [asciiArt, setAsciiArt] = useState('')
  const [fontStyle, setFontStyle] = useState('standard')
  const [isCopied, setIsCopied] = useState(false)

  // Simple ASCII font styles (limited set for demonstration)
  const asciiFonts = {
    standard: {
      A: ' A ', B: ' B ', C: ' C ', D: ' D ', E: ' E ',
      F: ' F ', G: ' G ', H: ' H ', I: ' I ', J: ' J ',
      K: ' K ', L: ' L ', M: ' M ', N: ' N ', O: ' O ',
      P: ' P ', Q: ' Q ', R: ' R ', S: ' S ', T: ' T ',
      U: ' U ', V: ' V ', W: ' W ', X: ' X ', Y: ' Y ',
      Z: ' Z ', ' ': '   '
    },
    block: {
      A: '███', B: '███', C: '██ ', D: '███', E: '███',
      F: '███', G: '██ ', H: '█ █', I: ' █ ', J: '  █',
      K: '█ █', L: '█  ', M: '█ █', N: '█ █', O: '███',
      P: '███', Q: '███', R: '███', S: '██ ', T: '███',
      U: '█ █', V: '█ █', W: '█ █', X: '█ █', Y: '█ █',
      Z: '██ ', ' ': '   '
    },
    banner: {
      A: '   A   ', B: '  BB  ', C: ' CCC  ', D: '  DD  ', E: '  EEE ',
      F: '  FFF ', G: ' GGG  ', H: ' H  H ', I: '  III ', J: '    J ',
      K: ' K  K ', L: ' L    ', M: ' M  M ', N: ' N  N ', O: ' OOO  ',
      P: ' PPP  ', Q: ' QQQ  ', R: ' RRR  ', S: '  SSS ', T: ' TTTTT',
      U: ' U  U ', V: ' V  V ', W: ' W  W ', X: ' X  X ', Y: ' Y  Y ',
      Z: ' ZZZZ ', ' ': '       '
    }
  }

  const generateASCIIArt = () => {
    if (!inputText.trim()) {
      setAsciiArt('Please enter some text!')
      return
    }

    const selectedFont = asciiFonts[fontStyle]
    const lines = ['', '', '']
    
    // For simplicity, we'll create a basic multi-line ASCII art
    const upperText = inputText.toUpperCase().slice(0, 20) // Limit to 20 chars
    
    for (let char of upperText) {
      if (selectedFont[char]) {
        if (fontStyle === 'standard') {
          lines[0] += selectedFont[char]
        } else if (fontStyle === 'block') {
          lines[0] += ' ' + selectedFont[char] + ' '
          lines[1] += ' ' + (char === ' ' ? '   ' : '█ █') + ' '
          lines[2] += ' ' + (char === ' ' ? '   ' : '███') + ' '
        } else if (fontStyle === 'banner') {
          lines[0] += selectedFont[char]
          lines[1] += char === ' ' ? '       ' : '  ***  '
          lines[2] += char === ' ' ? '       ' : '  ***  '
        }
      } else {
        lines[0] += char === ' ' ? selectedFont[' '] : ' ? '
        lines[1] += char === ' ' ? selectedFont[' '] : ' ? '
        lines[2] += char === ' ' ? selectedFont[' '] : ' ? '
      }
    }

    setAsciiArt(lines.filter(line => line.trim()).join('\n'))
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiArt)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const clearArt = () => {
    setInputText('')
    setAsciiArt('')
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          ASCII Art Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Text (max 20 characters)
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 20))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to convert"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Style
            </label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="block">Block</option>
              <option value="banner">Banner</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateASCIIArt}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate ASCII Art
          </button>

          {asciiArt && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>

              <button
                onClick={clearArt}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {asciiArt && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated ASCII Art:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre">
                {asciiArt}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ASCIIArtGenerator