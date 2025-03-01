'use client'
import React, { useState, useEffect } from 'react'

const CaptchaGenerator = () => {
  const [captchaText, setCaptchaText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isVerified, setIsVerified] = useState(null)
  const [distortion, setDistortion] = useState('medium') // low, medium, high
  const [isCopied, setIsCopied] = useState(false)

  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const length = 6
    let newCaptcha = ''
    
    for (let i = 0; i < length; i++) {
      newCaptcha += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    setCaptchaText(newCaptcha)
    setUserInput('')
    setIsVerified(null)
    setIsCopied(false)
  }

  // Generate initial captcha on mount
  useEffect(() => {
    generateCaptcha()
  }, [])

  const verifyCaptcha = () => {
    setIsVerified(userInput.toLowerCase() === captchaText.toLowerCase())
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(captchaText)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  // Simple distortion styles
  const getDistortionStyle = () => {
    switch (distortion) {
      case 'low':
        return { transform: 'rotate(2deg)', letterSpacing: '2px' }
      case 'medium':
        return { transform: 'rotate(5deg) skewX(-10deg)', letterSpacing: '3px' }
      case 'high':
        return { transform: 'rotate(8deg) skewX(-15deg)', letterSpacing: '4px' }
      default:
        return {}
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Captcha Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Captcha Distortion
            </label>
            <select
              value={distortion}
              onChange={(e) => setDistortion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="relative">
            <div 
              className="bg-gray-200 p-4 rounded-md text-center font-mono text-xl text-gray-800 border border-gray-300"
              style={{
                ...getDistortionStyle(),
                backgroundImage: 'linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3), linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            >
              {captchaText}
            </div>
            <button
              onClick={generateCaptcha}
              className="absolute top-1 right-1 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors"
              title="Refresh Captcha"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H9m6 4a8.001 8.001 0 01-13.418 2H0v5m15-2h5.418" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Captcha Text
            </label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type the text you see"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={verifyCaptcha}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Verify
          </button>

          <button
            onClick={copyToClipboard}
            className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isCopied
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
            }`}
          >
            {isCopied ? 'Copied!' : 'Copy Captcha'}
          </button>

          <button
            onClick={generateCaptcha}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            New Captcha
          </button>
        </div>

        {isVerified !== null && (
          <div className="mt-4 p-3 rounded-md text-center text-white font-medium" 
            style={{ backgroundColor: isVerified ? '#10B981' : '#EF4444' }}>
            {isVerified ? 'Verification Successful!' : 'Verification Failed!'}
          </div>
        )}
      </div>
    </div>
  )
}

export default CaptchaGenerator