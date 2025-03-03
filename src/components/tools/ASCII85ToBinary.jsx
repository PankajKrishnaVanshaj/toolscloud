'use client';

import React, { useState } from 'react';

const ASCII85ToBinary = () => {
  const [ascii85Input, setAscii85Input] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [error, setError] = useState('');
  const [showBinaryAs, setShowBinaryAs] = useState('bits'); // Options: bits, hex, bytes

  // ASCII85 decoding function
  const decodeASCII85 = (input) => {
    const cleanInput = input.replace(/<~|~>/g, '').trim(); // Remove optional <~ ~> delimiters
    if (!cleanInput.match(/^[!-u]*$/)) {
      throw new Error('Invalid ASCII85 input: Only characters ! to u are allowed');
    }

    let binary = '';
    let tuple = 0;
    let count = 0;

    for (let i = 0; i < cleanInput.length; i++) {
      const charCode = cleanInput.charCodeAt(i) - 33; // ASCII85 uses ! (33) to u (117)
      tuple = tuple * 85 + charCode;
      count++;

      if (count === 5 || i === cleanInput.length - 1) {
        if (count < 5) {
          // Pad remaining characters
          while (count < 5) {
            tuple = tuple * 85 + 84; // 'u' is the max value, used for padding
            count++;
          }
        }

        // Convert tuple to 4 bytes
        const bytes = [
          (tuple >> 24) & 0xFF,
          (tuple >> 16) & 0xFF,
          (tuple >> 8) & 0xFF,
          tuple & 0xFF,
        ];

        // Adjust for padding
        const byteCount = Math.min(4, Math.ceil((i + 1) / 5) * 4 - (5 - count));
        for (let j = 0; j < byteCount; j++) {
          binary += bytes[j].toString(2).padStart(8, '0');
        }

        tuple = 0;
        count = 0;
      }
    }

    return binary;
  };

  // ASCII85 encoding function
  const encodeASCII85 = (binary) => {
    const bytes = [];
    for (let i = 0; i < binary.length; i += 8) {
      bytes.push(parseInt(binary.slice(i, i + 8), 2));
    }

    let result = '';
    for (let i = 0; i < bytes.length; i += 4) {
      let tuple = 0;
      const chunk = bytes.slice(i, i + 4);
      for (let j = 0; j < 4; j++) {
        tuple = (tuple << 8) + (chunk[j] || 0);
      }

      if (tuple === 0 && chunk.length === 4) {
        result += 'z';
      } else {
        let encoded = '';
        for (let k = 0; k < 5; k++) {
          encoded = String.fromCharCode((tuple % 85) + 33) + encoded;
          tuple = Math.floor(tuple / 85);
        }
        result += encoded.slice(0, chunk.length + 1);
      }
    }

    return `<~${result}~>`;
  };

  const handleDecode = () => {
    setError('');
    setBinaryOutput('');
    setDecodedText('');

    try {
      const binary = decodeASCII85(ascii85Input);
      setBinaryOutput(binary);

      // Convert binary to text
      let text = '';
      for (let i = 0; i < binary.length; i += 8) {
        const byte = parseInt(binary.slice(i, i + 8), 2);
        text += String.fromCharCode(byte);
      }
      setDecodedText(text);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEncode = () => {
    setError('');
    try {
      const binary = binaryOutput || decodeASCII85(ascii85Input);
      const encoded = encodeASCII85(binary);
      setAscii85Input(encoded);
    } catch (err) {
      setError('Error encoding to ASCII85: ' + err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAscii85Input(event.target.result);
        handleDecode();
      };
      reader.readAsText(file);
    }
  };

  const downloadBinary = () => {
    if (!binaryOutput) return;
    const bytes = [];
    for (let i = 0; i < binaryOutput.length; i += 8) {
      bytes.push(parseInt(binaryOutput.slice(i, i + 8), 2));
    }
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'binary_output.bin';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBinaryOutput = () => {
    if (!binaryOutput) return '';
    switch (showBinaryAs) {
      case 'bits':
        return binaryOutput.match(/.{1,8}/g)?.join(' ') || binaryOutput;
      case 'hex':
        let hex = '';
        for (let i = 0; i < binaryOutput.length; i += 8) {
          const byte = parseInt(binaryOutput.slice(i, i + 8), 2);
          hex += byte.toString(16).padStart(2, '0') + ' ';
        }
        return hex.trim();
      case 'bytes':
        let bytes = '';
        for (let i = 0; i < binaryOutput.length; i += 8) {
          const byte = parseInt(binaryOutput.slice(i, i + 8), 2);
          bytes += byte + ' ';
        }
        return bytes.trim();
      default:
        return binaryOutput;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ASCII85 to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII85 Input
              </label>
              <textarea
                value={ascii85Input}
                onChange={(e) => setAscii85Input(e.target.value)}
                placeholder="e.g., <~9jqo^BlbD-BleB1DJ+*+~>"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDecode}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Decode to Binary
              </button>
              <button
                onClick={handleEncode}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Encode to ASCII85
              </button>
              <input
                type="file"
                onChange={handleFileUpload}
                className="px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Output Format Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Binary As
            </label>
            <select
              value={showBinaryAs}
              onChange={(e) => setShowBinaryAs(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bits">Binary Bits (e.g., 0100 1010)</option>
              <option value="hex">Hexadecimal (e.g., 4A)</option>
              <option value="bytes">Decimal Bytes (e.g., 74)</option>
            </select>
          </div>

          {/* Results Section */}
          {binaryOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">Binary Output:</p>
                  <p className="font-mono break-all">{formatBinaryOutput()}</p>
                </div>
                <div>
                  <p className="font-medium">Decoded Text:</p>
                  <p>{decodedText}</p>
                </div>
                <button
                  onClick={downloadBinary}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Download Binary File
                </button>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Decode ASCII85 to binary and text</li>
              <li>Encode binary back to ASCII85</li>
              <li>Supports file upload for ASCII85 input</li>
              <li>Download binary as .bin file</li>
              <li>View binary as bits, hex, or bytes</li>
              <li>Example: {`<~9jqo^~>`} decodes to "Hello"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ASCII85ToBinary;