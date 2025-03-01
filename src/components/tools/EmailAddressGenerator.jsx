'use client'
import React, { useState } from 'react'

const EmailAddressGenerator = () => {
  const [emails, setEmails] = useState([])
  const [count, setCount] = useState(10)
  const [domain, setDomain] = useState('gmail.com')
  const [customDomain, setCustomDomain] = useState('')
  const [format, setFormat] = useState('random') // random, firstname.lastname, initial.lastname
  const [isCopied, setIsCopied] = useState(false)

  // Sample name data
  const firstNames = ['john', 'jane', 'alex', 'emma', 'chris', 'sophia', 'mike', 'lisa']
  const lastNames = ['smith', 'doe', 'johnson', 'brown', 'wilson', 'taylor', 'davis', 'clark']

  const generateEmail = () => {
    const getRandomString = (length) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
      return Array.from({ length }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('')
    }

    const first = firstNames[Math.floor(Math.random() * firstNames.length)]
    const last = lastNames[Math.floor(Math.random() * lastNames.length)]
    const selectedDomain = domain === 'custom' && customDomain ? customDomain : domain

    switch (format) {
      case 'random':
        return `${getRandomString(8)}@${selectedDomain}`
      case 'firstname.lastname':
        return `${first}.${last}@${selectedDomain}`
      case 'initial.lastname':
        return `${first[0]}.${last}@${selectedDomain}`
      default:
        return `${first}.${last}@${selectedDomain}`
    }
  }

  const generateEmails = () => {
    const newEmails = Array.from({ length: Math.min(count, 1000) }, generateEmail)
    setEmails(newEmails)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = emails.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = emails.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `emails-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearEmails = () => {
    setEmails([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Email Address Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Emails (1-1000)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gmail.com">gmail.com</option>
              <option value="yahoo.com">yahoo.com</option>
              <option value="hotmail.com">hotmail.com</option>
              <option value="outlook.com">outlook.com</option>
              <option value="custom">Custom Domain</option>
            </select>
          </div>

          {domain === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Domain
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="random">Random (e.g., xk7p9m2n@...)</option>
              <option value="firstname.lastname">First.Last (e.g., john.doe@...)</option>
              <option value="initial.lastname">Initial.Last (e.g., j.doe@...)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateEmails}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Emails
          </button>

          {emails.length > 0 && (
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
                onClick={downloadAsText}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as TXT
              </button>

              <button
                onClick={clearEmails}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {emails.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Email Addresses ({emails.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {emails.map((email, index) => (
                  <li key={index} className="py-1">{email}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailAddressGenerator