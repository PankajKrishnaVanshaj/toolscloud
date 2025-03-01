'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import { FaCopy, FaDownload, FaTimes, FaCheckCircle } from 'react-icons/fa';

const RandomISBNGenerator = () => {
  const [isbnType, setIsbnType] = useState('isbn13');
  const [batchSize, setBatchSize] = useState(1);
  const [isbns, setIsbns] = useState([]);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [prefix, setPrefix] = useState('random');
  const [separator, setSeparator] = useState('-');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [languageGroup, setLanguageGroup] = useState('random');
  const [isCustom, setIsCustom] = useState(false);
  const [customPrefix, setCustomPrefix] = useState('978');
  const [customRegistration, setCustomRegistration] = useState('');
  const [customRegistrant, setCustomRegistrant] = useState('');

  // Store raw ISBN parts separately to allow reformatting
  const [isbnPartsList, setIsbnPartsList] = useState([]);

  const generateISBN = useCallback(() => {
    const prefixes = prefix === 'random' ? ['978', '979'] : [prefix];
    const langGroups = {
      'random': ['0', '1', '2', '3', '4', '5', '6', '7', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
      'english': ['0', '1'],
      'french': ['2'],
      'german': ['3'],
      'japan': ['4'],
      'russia': ['5'],
    };
    const selectedLangGroup = languageGroup === 'random' ? langGroups.random : langGroups[languageGroup];

    const isbnParts = {};
    if (isbnType === 'isbn13') {
      isbnParts.prefix = isCustom ? (customPrefix || faker.helpers.arrayElement(prefixes)) : faker.helpers.arrayElement(prefixes);
      isbnParts.prefix = isbnParts.prefix.padEnd(3, '0').slice(0, 3);
      const is979 = isbnParts.prefix === '979';
      isbnParts.registration = isCustom && customRegistration 
        ? customRegistration.padEnd(is979 ? 2 : 1, '0').slice(0, is979 ? 2 : 1)
        : faker.helpers.arrayElement(selectedLangGroup);
      isbnParts.registrant = isCustom && customRegistrant 
        ? customRegistrant.padEnd(is979 ? 4 : 5, '0').slice(0, is979 ? 4 : 5)
        : faker.string.numeric({ length: is979 ? 4 : 5 });
      isbnParts.publication = faker.string.numeric({ length: is979 ? 3 : 2 });
      const base = isbnParts.prefix + isbnParts.registration + isbnParts.registrant + isbnParts.publication;
      if (base.length !== 12) throw new Error(`ISBN-13 base length invalid: ${base.length}`);
      isbnParts.checksum = calculateISBN13Checksum(base);
      const fullIsbn = base + isbnParts.checksum;
      if (fullIsbn.length !== 13) throw new Error(`ISBN-13 full length invalid: ${fullIsbn.length}`);
      return isbnParts;
    } else {
      isbnParts.registration = isCustom && customRegistration 
        ? customRegistration.padEnd(1, '0').slice(0, 1)
        : faker.helpers.arrayElement(selectedLangGroup);
      isbnParts.registrant = isCustom && customRegistrant 
        ? customRegistrant.padEnd(4, '0').slice(0, 4)
        : faker.string.numeric({ length: 4 });
      isbnParts.publication = faker.string.numeric({ length: 3 });
      const base = isbnParts.registration + isbnParts.registrant + isbnParts.publication;
      if (base.length !== 9) throw new Error(`ISBN-10 base length invalid: ${base.length}`);
      isbnParts.checksum = calculateISBN10Checksum(base);
      const fullIsbn = base + isbnParts.checksum;
      if (fullIsbn.length !== 10) throw new Error(`ISBN-10 full length invalid: ${fullIsbn.length}`);
      return isbnParts;
    }
  }, [isbnType, prefix, languageGroup, isCustom, customPrefix, customRegistration, customRegistrant]);

  const calculateISBN13Checksum = (base) => {
    const digits = base.split('').map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + (i % 2 === 0 ? digit : digit * 3), 0);
    return ((10 - (sum % 10)) % 10).toString();
  };

  const calculateISBN10Checksum = (base) => {
    const digits = base.split('').map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + digit * (10 - i), 0);
    const checksum = (11 - (sum % 11)) % 11;
    return checksum === 10 ? 'X' : checksum.toString();
  };

  const formatISBN = (parts, type) => {
    const sep = separator === 'none' ? '' : separator;
    if (type === 'isbn13') {
      return [
        parts.prefix,
        parts.registration,
        parts.registrant,
        parts.publication,
        parts.checksum
      ].join(sep);
    } else {
      return [
        parts.registration,
        parts.registrant,
        parts.publication,
        parts.checksum
      ].join(sep);
    }
  };

  // Effect to update ISBNs when separator changes
  useEffect(() => {
    if (isbnPartsList.length > 0) {
      const updatedIsbns = isbnPartsList.map(parts => {
        const isbn = formatISBN(parts, isbnType);
        return includeTimestamp ? `${isbn} [${parts.timestamp}]` : isbn;
      });
      setIsbns(updatedIsbns);
    }
  }, [separator, isbnPartsList, isbnType, includeTimestamp]);

  const generateBatch = async () => {
    setIsGenerating(true);
    try {
      const newIsbnsSet = new Set();
      const newPartsSet = new Set();
      const maxAttempts = batchSize * 10;
      let attempts = 0;

      while (newIsbnsSet.size < batchSize && attempts < maxAttempts) {
        const parts = generateISBN();
        const isbn = formatISBN(parts, isbnType);
        const uniqueKey = isbn; // Use formatted ISBN for uniqueness check
        if (!uniqueOnly || !newIsbnsSet.has(uniqueKey)) {
          newIsbnsSet.add(uniqueKey);
          parts.timestamp = new Date().toISOString(); // Store timestamp with parts
          newPartsSet.add(parts);
        }
        attempts++;
      }

      const newIsbnParts = Array.from(newPartsSet);
      const newIsbns = newIsbnParts.map(parts => {
        const isbn = formatISBN(parts, isbnType);
        return includeTimestamp ? `${isbn} [${parts.timestamp}]` : isbn;
      });

      if (newIsbns.length < batchSize) {
        setError(`Could only generate ${newIsbns.length} unique ISBNs after ${attempts} attempts`);
      } else {
        setError('');
      }

      setIsbnPartsList(newIsbnParts);
      setIsbns(newIsbns);
      setHistory((prev) => [
        { 
          isbns: newIsbns, 
          type: isbnType, 
          timestamp: new Date(), 
          unique: uniqueOnly,
          prefix,
          separator,
          includeTimestamp,
          languageGroup,
          isCustom,
          customPrefix,
          customRegistration,
          customRegistrant
        },
        ...prev.slice(0, 9),
      ]);
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
    setIsbnPartsList([]);
    setError('');
    setCustomPrefix('978');
    setCustomRegistration('');
    setCustomRegistrant('');
  };

  const loadFromHistory = (entry) => {
    setIsbns(entry.isbns);
    // Reconstruct parts from history ISBNs (simplified approach)
    const reconstructedParts = entry.isbns.map(isbn => {
      const parts = {};
      const digitsOnly = isbn.split(' ')[0].replace(new RegExp(`[${separator === 'none' ? '' : separator}]`, 'g'), '');
      if (entry.type === 'isbn13') {
        const is979 = digitsOnly.startsWith('979');
        parts.prefix = digitsOnly.slice(0, 3);
        parts.registration = digitsOnly.slice(3, is979 ? 5 : 4);
        parts.registrant = digitsOnly.slice(is979 ? 5 : 4, is979 ? 9 : 9);
        parts.publication = digitsOnly.slice(is979 ? 9 : 9, 12);
        parts.checksum = digitsOnly.slice(12);
      } else {
        parts.registration = digitsOnly.slice(0, 1);
        parts.registrant = digitsOnly.slice(1, 5);
        parts.publication = digitsOnly.slice(5, 9);
        parts.checksum = digitsOnly.slice(9);
      }
      parts.timestamp = isbn.includes('[') ? isbn.split(' [')[1].slice(0, -1) : new Date().toISOString();
      return parts;
    });
    setIsbnPartsList(reconstructedParts);
    setIsbnType(entry.type);
    setUniqueOnly(entry.unique);
    setPrefix(entry.prefix);
    setSeparator(entry.separator);
    setIncludeTimestamp(entry.includeTimestamp);
    setLanguageGroup(entry.languageGroup);
    setIsCustom(entry.isCustom);
    setCustomPrefix(entry.customPrefix);
    setCustomRegistration(entry.customRegistration);
    setCustomRegistrant(entry.customRegistrant);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
          Random ISBN Generator
        </h2>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-xl shadow-md">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Prefix</label>
            {isCustom ? (
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value.slice(0, 3))}
                placeholder="e.g., 978"
                maxLength={3}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                disabled={isbnType === 'isbn10'}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="random">Random (978/979)</option>
                <option value="978">978</option>
                <option value="979">979</option>
              </select>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Separator</label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="-">Hyphen (-)</option>
              <option value=" ">Space</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Language/Region Group</label>
            <select
              value={languageGroup}
              onChange={(e) => setLanguageGroup(e.target.value)}
              disabled={isCustom && customRegistration}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="random">Random</option>
              <option value="english">English (0-1)</option>
              <option value="french">French (2)</option>
              <option value="german">German (3)</option>
              <option value="japan">Japan (4)</option>
              <option value="russia">Russia (5)</option>
            </select>
          </div>
          <div className="space-y-2 flex items-end">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={uniqueOnly}
                  onChange={(e) => setUniqueOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Unique ISBNs
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Include Timestamp
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isCustom}
                  onChange={(e) => setIsCustom(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Custom Mode
              </label>
            </div>
          </div>
          {isCustom && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Custom Registration</label>
                <input
                  type="text"
                  value={customRegistration}
                  onChange={(e) => setCustomRegistration(e.target.value.slice(0, isbnType === 'isbn13' && customPrefix === '979' ? 2 : 1))}
                  placeholder={isbnType === 'isbn13' && customPrefix === '979' ? 'e.g., 12' : 'e.g., 1'}
                  maxLength={isbnType === 'isbn13' && customPrefix === '979' ? 2 : 1}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Custom Registrant</label>
                <input
                  type="text"
                  value={customRegistrant}
                  onChange={(e) => setCustomRegistrant(e.target.value.slice(0, isbnType === 'isbn13' && customPrefix === '979' ? 4 : 5))}
                  placeholder={isbnType === 'isbn13' && customPrefix === '979' ? 'e.g., 1234' : 'e.g., 12345'}
                  maxLength={isbnType === 'isbn13' && customPrefix === '979' ? 4 : 5}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
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
                        {entry.includeTimestamp && ' - Timestamp'}
                        {entry.isCustom && ' - Custom'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {entry.timestamp.toLocaleString()} | Prefix: {entry.isCustom ? entry.customPrefix : entry.prefix} 
                        {entry.isCustom && ` | Reg: ${entry.customRegistration || 'Random'}`} 
                        {entry.isCustom && ` | Regt: ${entry.customRegistrant || 'Random'}`} 
                        {!entry.isCustom && ` | Lang: ${entry.languageGroup}`}
                      </p>
                    </div>
                    <p className="text-sm font-mono text-gray-700">{entry.isbns[0].split(' ')[0]}</p>
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