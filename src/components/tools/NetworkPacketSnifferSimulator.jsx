"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaPlay, FaStop, FaTrash, FaCopy, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For exporting as image

const NetworkPacketSnifferSimulator = () => {
  const [packets, setPackets] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [captureRate, setCaptureRate] = useState(500); // ms between packets
  const [protocolFilter, setProtocolFilter] = useState("all");
  const tableRef = useRef(null);

  // Mock packet generator
  const generateMockPacket = useCallback(() => {
    const protocols = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "ICMP", "FTP"];
    const ips = ["192.168.1.", "10.0.0.", "172.16.0.", "8.8.8.", "203.0.113."];
    const ports = [80, 443, 53, 21, 22, 3389, 8080, 445];
    const packetTypes = ["SYN", "ACK", "FIN", "RST", "DATA"];

    const randomIP = () => `${ips[Math.floor(Math.random() * ips.length)]}${Math.floor(Math.random() * 255)}`;
    const randomPort = () => ports[Math.floor(Math.random() * ports.length)];
    const randomProtocol = () => protocols[Math.floor(Math.random() * protocols.length)];
    const randomType = () => packetTypes[Math.floor(Math.random() * packetTypes.length)];
    const randomData = () => Math.random().toString(36).substring(2, 15);

    return {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      sourceIP: randomIP(),
      sourcePort: randomPort(),
      destinationIP: randomIP(),
      destinationPort: randomPort(),
      protocol: randomProtocol(),
      type: randomType(),
      length: Math.floor(Math.random() * 1500) + 64,
      payload: randomData(),
      ttl: Math.floor(Math.random() * 255) + 1, // Time to live
    };
  }, []);

  // Simulate packet capture
  useEffect(() => {
    let interval;
    if (isCapturing) {
      interval = setInterval(() => {
        const newPacket = generateMockPacket();
        if (protocolFilter === "all" || newPacket.protocol === protocolFilter) {
          setPackets((prev) => [...prev, newPacket].slice(-200)); // Keep last 200 packets
        }
      }, captureRate);
    }
    return () => clearInterval(interval);
  }, [isCapturing, captureRate, protocolFilter, generateMockPacket]);

  // Filter packets
  const filteredPackets = packets.filter((packet) =>
    (packet.sourceIP.includes(filter) ||
      packet.destinationIP.includes(filter) ||
      packet.protocol.toLowerCase().includes(filter.toLowerCase()) ||
      packet.payload.toLowerCase().includes(filter.toLowerCase()) ||
      packet.type.toLowerCase().includes(filter.toLowerCase())) &&
    (protocolFilter === "all" || packet.protocol === protocolFilter)
  );

  // Toggle capture
  const toggleCapture = () => setIsCapturing((prev) => !prev);

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

  // Export table as image
  const exportAsImage = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `packet-capture-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Network Packet Sniffer Simulator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={toggleCapture}
              className={`flex-1 py-2 px-4 rounded text-white transition-colors flex items-center justify-center ${
                isCapturing
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isCapturing ? <FaStop className="mr-2" /> : <FaPlay className="mr-2" />}
              {isCapturing ? "Stop" : "Start"}
            </button>
            <button
              onClick={clearPackets}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaTrash className="mr-2" /> Clear
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capture Rate (ms)
            </label>
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={captureRate}
              onChange={(e) => setCaptureRate(Math.max(100, Math.min(5000, e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protocol Filter
            </label>
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              {["TCP", "UDP", "HTTP", "HTTPS", "DNS", "ICMP", "FTP"].map((proto) => (
                <option key={proto} value={proto}>
                  {proto}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by IP, protocol, type, payload"
            />
          </div>
        </div>

        {/* Packet Table */}
        <div className="overflow-x-auto max-h-[50vh] border rounded-lg" ref={tableRef}>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Source</th>
                <th className="p-2 text-left">Destination</th>
                <th className="p-2 text-left">Protocol</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Length</th>
                <th className="p-2 text-left">TTL</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackets.map((packet) => (
                <tr
                  key={packet.id}
                  onClick={() => setSelectedPacket(packet)}
                  className={`border-b cursor-pointer hover:bg-gray-100 ${
                    selectedPacket?.id === packet.id ? "bg-blue-100" : ""
                  }`}
                >
                  <td className="p-2">{new Date(packet.timestamp).toLocaleTimeString()}</td>
                  <td className="p-2">{`${packet.sourceIP}:${packet.sourcePort}`}</td>
                  <td className="p-2">{`${packet.destinationIP}:${packet.destinationPort}`}</td>
                  <td className="p-2">{packet.protocol}</td>
                  <td className="p-2">{packet.type}</td>
                  <td className="p-2">{packet.length} bytes</td>
                  <td className="p-2">{packet.ttl}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPackets.length === 0 && (
            <p className="text-center py-4 text-gray-500">
              {isCapturing ? "Capturing packets..." : "No packets captured yet"}
            </p>
          )}
        </div>

        {/* Packet Details */}
        {selectedPacket && (
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Packet Details</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCopy className="mr-1" /> Copy
                </button>
                <button
                  onClick={exportAsImage}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-1" /> Export Table
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded border font-mono text-sm">
              <p>
                <span className="font-medium">Timestamp:</span> {selectedPacket.timestamp}
              </p>
              <p>
                <span className="font-medium">Source:</span> {selectedPacket.sourceIP}:
                {selectedPacket.sourcePort}
              </p>
              <p>
                <span className="font-medium">Destination:</span> {selectedPacket.destinationIP}:
                {selectedPacket.destinationPort}
              </p>
              <p>
                <span className="font-medium">Protocol:</span> {selectedPacket.protocol}
              </p>
              <p>
                <span className="font-medium">Type:</span> {selectedPacket.type}
              </p>
              <p>
                <span className="font-medium">Length:</span> {selectedPacket.length} bytes
              </p>
              <p>
                <span className="font-medium">TTL:</span> {selectedPacket.ttl}
              </p>
              <p>
                <span className="font-medium">Payload:</span> {selectedPacket.payload}
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time packet capture simulation</li>
            <li>Customizable capture rate (100-5000ms)</li>
            <li>Protocol filtering</li>
            <li>Advanced search by IP, protocol, type, payload</li>
            <li>Packet details with copy to clipboard</li>
            <li>Export table as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NetworkPacketSnifferSimulator;