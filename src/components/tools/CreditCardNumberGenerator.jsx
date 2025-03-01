'use client'
import React, { useState } from 'react'

const CreditCardNumberGenerator = () => {
  const [cardNumbers, setCardNumbers] = useState([])
  const [count, setCount] = useState(10)
  const [cardType, setCardType] = useState('visa') // visa, mastercard, amex, discover
  const [isCopied, setIsCopied] = useState(false)

  // Card type prefixes and lengths
  const cardTypes = {
    visa: { prefixes: ['4'], length: 16 },
    mastercard: { prefixes: ['51', '52', '53', '54', '55'], length: 16 },
    amex: { prefixes: ['34', '37'], length: 15 },
    discover: { prefixes: ['6011', '644', '645', '646', '647', '648', '649', '65'], length: 16 }
  }

  // Luhn algorithm to generate valid checksum
  const generateLuhnChecksum = (number) => {
    let sum = 0
    let isEven = false

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }

    return (sum * 9) % 10
  }

  const generateCardNumber = () => {
    const { prefixes, length } = cardTypes[cardType]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    
    // Generate remaining digits
    const remainingLength = length - prefix.length
    const randomDigits = Array.from({ length: remainingLength - 1 }, () => 
      Math.floor(Math.random() * 10)
    ).join('')
    
    const partialNumber = prefix + randomDigits
    const checksum = generateLuhnChecksum(partialNumber)
    const fullNumber = partialNumber + checksum

    // Format with spaces every 4 digits
    return fullNumber.match(/.{1,4}/g).join(' ')
  }

  const generateCardNumbers = () => {
    const newCardNumbers = Array.from({ length: Math.min(count, 1000) }, generateCardNumber)
    setCardNumbers(newCardNumbers)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = cardNumbers.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = cardNumbers.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `credit-cards-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearCardNumbers = () => {
    setCardNumbers([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Credit Card Number Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Cards (1-1000)
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
              Card Type
            </label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">MasterCard</option>
              <option value="amex">American Express</option>
              <option value="discover">Discover</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateCardNumbers}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Cards
          </button>

          {cardNumbers.length > 0 && (
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
                onClick={clearCardNumbers}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {cardNumbers.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Credit Card Numbers ({cardNumbers.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {cardNumbers.map((number, index) => (
                  <li key={index} className="py-1">{number}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> These are randomly generated numbers for testing purposes only and are not real credit card numbers. They pass the Luhn algorithm check but should not be used for actual transactions.</p>
        </div>
      </div>
    </div>
  )
}

export default CreditCardNumberGenerator