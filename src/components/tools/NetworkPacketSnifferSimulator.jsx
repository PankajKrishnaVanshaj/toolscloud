// components/NetworkPacketSnifferSimulator.js
'use client';

import React, { useState, useEffect } from 'react';

const NetworkPacketSnifferSimulator = () => {
  const [packets, setPackets] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedPacket, setSelectedPacket] = useState(null);

  // Mock packet generator
  const generateMockPacket = () => {
    const protocols = ['TCP', 'UDP', 'HTTP', 'DNS', 'ICMP'];
    const ips = ['192.168.1.', '10.0.0.', '172.16.0.', '8.8.8.'];
    const ports = [80, 443, 53, 22, 3389, 8080];

    const randomIP = () => `${ips[Math.floor(Math.random() * ips.length)]}${Math.floor(Math.random() * 255)}`;
    const randomPort = () => ports[Math.floor(Math.random() * ports.length)];
    const randomProtocol = () => protocols[Math.floor(Math.random() * protocols.length)];
    const randomData = () => Math.random().toString(36).substring(2, 15);

    return {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      sourceIP: randomIP(),
      sourcePort: randomPort(),
      destinationIP: randomIP(),
      destinationPort: randomPort(),
      protocol: randomProtocol(),
      length: Math.floor(Math.random() * 1500) + 64, // Typical packet sizes
      payload: randomData()
    };
  };

  // Simulate packet capture
  useEffect(() => {
    let interval;
    if (isCapturing) {
      interval = setInterval(() => {
        setPackets((prev) => [...prev, generateMockPacket()].slice(-100)); // Keep last 100 packets
      }, 500); // Generate packet every 500ms
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  // Filter packets
  const filteredPackets = packets.filter(packet => 
    packet.sourceIP.includes(filter) ||
    packet.destinationIP.includes(filter) ||
    packet.protocol.toLowerCase().includes(filter.toLowerCase()) ||
    packet.payload.toLowerCase().includes(filter.toLowerCase())
  );

  // Toggle capture
  const toggleCapture = () => {
    setIsCapturing(!isCapturing);
  };

  // Clear packets
  const clearPackets = () => {
    setPackets([]);
    setSelectedPacket(null);
  };

  // Copy packet details
  const copyToClipboard = () => {
    if (selectedPacket) {
      const text = JSON.stringify(selectedPacket, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Network Packet Sniffer Simulator</h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2">
            <button
              onClick={toggleCapture}
              className={`px-4 py-2 rounded text-white ${
                isCapturing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isCapturing ? 'Stop Capture' : 'Start Capture'}
            </button>
            <button
              onClick={clearPackets}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-64 p-2 border rounded focus:ring focus:ring-blue-200"
            placeholder="Filter by IP, protocol, or payload"
          />
        </div>

        {/* Packet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Source</th>
                <th className="p-2 text-left">Destination</th>
                <th className="p-2 text-left">Protocol</th>
                <th className="p-2 text-left">Length</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackets.map((packet) => (
                <tr
                  key={packet.id}
                  onClick={() => setSelectedPacket(packet)}
                  className={`border-b cursor-pointer hover:bg-gray-100 ${
                    selectedPacket?.id === packet.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <td className="p-2">{new Date(packet.timestamp).toLocaleTimeString()}</td>
                  <td className="p-2">{`${packet.sourceIP}:${packet.sourcePort}`}</td>
                  <td className="p-2">{`${packet.destinationIP}:${packet.destinationPort}`}</td>
                  <td className="p-2">{packet.protocol}</td>
                  <td className="p-2">{packet.length} bytes</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPackets.length === 0 && (
            <p className="text-center py-4 text-gray-500">
              {isCapturing ? 'Capturing packets...' : 'No packets captured yet'}
            </p>
          )}
        </div>

        {/* Packet Details */}
        {selectedPacket && (
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Packet Details</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border font-mono text-sm">
              <p><span className="font-medium">Timestamp:</span> {selectedPacket.timestamp}</p>
              <p><span className="font-medium">Source:</span> {selectedPacket.sourceIP}:{selectedPacket.sourcePort}</p>
              <p><span className="font-medium">Destination:</span> {selectedPacket.destinationIP}:{selectedPacket.destinationPort}</p>
              <p><span className="font-medium">Protocol:</span> {selectedPacket.protocol}</p>
              <p><span className="font-medium">Length:</span> {selectedPacket.length} bytes</p>
              <p><span className="font-medium">Payload:</span> {selectedPacket.payload}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPacketSnifferSimulator;