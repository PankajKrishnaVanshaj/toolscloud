'use client'
import React, { useState } from 'react'

const IPAddressGenerator = () => {
  const [ipAddresses, setIpAddresses] = useState([])
  const [count, setCount] = useState(10)
  const [ipVersion, setIpVersion] = useState('ipv4') // ipv4, ipv6
  const [isCopied, setIsCopied] = useState(false)

  const generateIPv4 = () => {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.')
  }

  const generateIPv6 = () => {
    return Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')
    ).join(':')
  }

  const generateIPAddresses = () => {
    const newIpAddresses = Array.from({ length: Math.min(count, 1000) }, () => {
      return ipVersion === 'ipv4' ? generateIPv4() : generateIPv6()
    })
    setIpAddresses(newIpAddresses)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = ipAddresses.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = ipAddresses.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ip-addresses-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearIPs = () => {
    setIpAddresses([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          IP Address Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of IP Addresses (1-1000)
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
              IP Version
            </label>
            <select
              value={ipVersion}
              onChange={(e) => setIpVersion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ipv4">IPv4 (e.g., 192.168.1.1)</option>
              <option value="ipv6">IPv6 (e.g., 2001:0db8:...)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateIPAddresses}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate IPs
          </button>

          {ipAddresses.length > 0 && (
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
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as TXT
              </button>

              <button
                onClick={clearIPs}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {ipAddresses.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated IP Addresses ({ipAddresses.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {ipAddresses.map((ip, index) => (
                  <li key={index} className="py-1">{ip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IPAddressGenerator