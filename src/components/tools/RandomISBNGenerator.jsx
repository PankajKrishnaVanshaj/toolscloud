'use client';
import React, { useState, useCallback } from 'react';
import { faker } from '@faker-js/faker';
import { FaCopy, FaDownload, FaTimes, FaCheckCircle } from 'react-icons/fa'; // React Icons

const RandomISBNGenerator = () => {
  const [isbnType, setIsbnType] = useState('isbn13');
  const [batchSize, setBatchSize] = useState(5);
  const [isbns, setIsbns] = useState([]);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uniqueOnly, setUniqueOnly] = useState(true); // New feature: ensure unique ISBNs

  const generateISBN = useCallback(() => {
    if (isbnType === 'isbn13') {
      const prefix = faker.helpers.arrayElement(['978', '979']);
      const registration = faker.string.numeric({ length: 2 }); // Registration group
      const registrant = faker.string.numeric({ length: 5 }); // Registrant
      const publication = faker.string.numeric({ length: 2 }); // Publication
      const base = prefix + registration + registrant + publication;
      const checksum = calculateISBN13Checksum(base);
      return formatISBN(`${base}${checksum}`, isbnType);
    } else {
      const registration = faker.string.numeric({ length: 2 });
      const registrant = faker.string.numeric({ length: 4 });
      const publication = faker.string.numeric({ length: 2 });
      const base = registration + registrant + publication;
      const checksum = calculateISBN10Checksum(base);
      return formatISBN(`${base}${checksum}`, isbnType);
    }
  }, [isbnType]);

  const calculateISBN13Checksum = (base) => {
    const digits = base.split('').map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + (i % 2 === 0 ? digit : digit * 3), 0);
    return (10 - (sum % 10)) % 10;
  };

  const calculateISBN10Checksum = (base) => {
    const digits = base.split('').map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + digit * (10 - i), 0);
    const checksum = (11 - (sum % 11)) % 11;
    return checksum === 10 ? 'X' : checksum;
  };

  const formatISBN = (isbn, type) => {
    if (type === 'isbn13') {
      return `${isbn.slice(0, 3)}-${isbn.slice(3, 5)}-${isbn.slice(5, 10)}-${isbn.slice(10, 12)}-${isbn[12]}`;
    }
    return `${isbn.slice(0, 2)}-${isbn.slice(2, 6)}-${isbn.slice(6, 8)}-${isbn[8]}`;
  };

  const generateBatch = async () => {
    setIsGenerating(true);
    try {
      const newIsbnsSet = new Set();
      const maxAttempts = batchSize * 2; // Prevent infinite loops
      let attempts = 0;

      while (newIsbnsSet.size < batchSize && attempts < maxAttempts) {
        const isbn = generateISBN();
        if (!uniqueOnly || !newIsbnsSet.has(isbn)) {
          newIsbnsSet.add(isbn);
        }
        attempts++;
      }

      const newIsbns = Array.from(newIsbnsSet);
      if (newIsbns.length < batchSize) {
        setError(`Could only generate ${newIsbns.length} unique ISBNs`);
      }

      setIsbns(newIsbns);
      setHistory((prev) => [
        { isbns: newIsbns, type: isbnType, timestamp: new Date(), unique: uniqueOnly },
        ...prev.slice(0, 9),
      ]);
      if (!error) setError('');
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isbns.join('\n'));
    setError('Copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  const handleDownload = (format = 'txt') => {
    const content = format === 'csv' 
      ? ['ISBN', ...isbns].join('\n') 
      : isbns.join('\n');
    const blob = new Blob([content], { type: `text/${format}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `isbns_${isbnType}_${Date.now()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setIsbns([]);
    setError('');
  };

  const loadFromHistory = (entry) => {
    setIsbns(entry.isbns);
    setIsbnType(entry.type);
    setUniqueOnly(entry.unique);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
          Random ISBN Generator
        </h2>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-xl shadow-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ISBN Type</label>
            <select
              value={isbnType}
              onChange={(e) => setIsbnType(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="isbn13">ISBN-13 (13 digits)</option>
              <option value="isbn10">ISBN-10 (10 digits)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Batch Size (1-100)</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2 flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={uniqueOnly}
                onChange={(e) => setUniqueOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Unique ISBNs Only
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { text: 'Generate', onClick: generateBatch, color: 'bg-blue-600', disabled: isGenerating },
            { text: 'Copy', onClick: handleCopy, color: 'bg-green-600', disabled: !isbns.length, icon: FaCopy },
            { text: 'TXT', onClick: () => handleDownload('txt'), color: 'bg-indigo-600', disabled: !isbns.length, icon: FaDownload },
            { text: 'CSV', onClick: () => handleDownload('csv'), color: 'bg-teal-600', disabled: !isbns.length, icon: FaDownload },
            { text: 'Reset', onClick: handleReset, color: 'bg-red-600', icon: FaTimes },
          ].map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium ${btn.color} ${
                btn.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:brightness-110 transition-all shadow-md'
              }`}
            >
              {btn.icon && <btn.icon className="w-5 h-5" />}
              {btn.text}
              {btn.text === 'Generate' && isGenerating && (
                <span className="ml-2 animate-spin">⌛</span>
              )}
            </button>
          ))}
        </div>

        {/* Output */}
        {isbns.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Generated ISBNs ({isbns.length})
            </h3>
            <div className="font-mono text-sm max-h-72 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
              {isbns.map((isbn, index) => (
                <div
                  key={index}
                  className="py-1.5 px-2 hover:bg-gray-100 rounded transition-colors"
                >
                  {isbn}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div
            className={`mb-8 p-4 rounded-lg flex items-center gap-2 ${
              error.includes('Copied')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <FaCheckCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Generation History</h3>
            <div className="space-y-4 max-h-72 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={index}
                  onClick={() => loadFromHistory(entry)}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {entry.type.toUpperCase()} Batch ({entry.isbns.length})
                        {entry.unique && ' - Unique'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {entry.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-mono text-gray-700">{entry.isbns[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomISBNGenerator;