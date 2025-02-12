"use client";
import { useState } from "react";
import {
  FiCopy,
  FiCheck,
  FiTrash2,
  FiDownload,
  FiSearch,
} from "react-icons/fi";

const UUIDGenerator = () => {
  const [uuids, setUuids] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [count, setCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [uuidLength, setUuidLength] = useState(36);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateUUID = () => {
    const newUuids = Array.from(
      { length: count },
      () => `${prefix}${crypto.randomUUID().slice(0, uuidLength)}${suffix}`
    );
    setUuids((prev) => [...newUuids, ...prev]);
  };

  const copyToClipboard = (uuid, index) => {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const deleteUUID = (index) => {
    setUuids((prev) => prev.filter((_, i) => i !== index));
  };

  const copyAllUUIDs = () => {
    if (!filteredUUIDs.length) return;
    navigator.clipboard.writeText(filteredUUIDs.join(",\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const clearUUIDs = () => setUuids([]);

  const downloadUUIDs = () => {
    if (!filteredUUIDs.length) return;
    const blob = new Blob([filteredUUIDs.join(",\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "uuids.txt";
    link.click();
  };

  const filteredUUIDs = uuids.filter((uuid) =>
    uuid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) =>
              setCount(Math.min(100, Math.max(1, Number(e.target.value))))
            }
            className="w-16 border rounded-md p-1 text-center"
          />
          <input
            type="text"
            placeholder="Prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="border rounded-md p-1 w-24"
          />
          <input
            type="text"
            placeholder="Suffix"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            className="border rounded-md p-1 w-24"
          />
          <input
            type="number"
            min="1"
            max="100"
            value={uuidLength}
            onChange={(e) =>
              setUuidLength(Math.min(100, Math.max(1, Number(e.target.value))))
            }
            className="w-16 border rounded-md p-1 text-center"
          />
          <button
            onClick={generateUUID}
            className="px-4 py-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text rounded-lg border border-secondary hover:scale-105 transition"
          >
            Generate
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search UUIDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-md p-1 pl-10 w-56"
            />
          </div>
          <button
            onClick={copyAllUUIDs}
            className="px-4 py-1.5 border border-secondary text-primary rounded-lg hover:scale-105 transition"
          >
            {copiedAll ? <FiCheck size={18} /> : <FiCopy size={18} />}
          </button>
          <button
            onClick={downloadUUIDs}
            className="px-5 py-1.5 border border-primary text-secondary rounded-lg hover:scale-105 transition"
          >
            <FiDownload size={18} />
          </button>
          <button
            onClick={clearUUIDs}
            className="px-4 py-1.5 border border-secondary text-primary rounded-lg hover:scale-105 transition"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* UUID List */}
      <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
        {filteredUUIDs.length > 0 ? (
          filteredUUIDs.map((uuid, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-100 rounded-md"
            >
              <span className="text-sm font-medium break-all">{uuid}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => copyToClipboard(uuid, index)}
                  className="text-secondary"
                >
                  {copiedIndex === index ? (
                    <FiCheck size={18} />
                  ) : (
                    <FiCopy size={18} />
                  )}
                </button>
                <button
                  onClick={() => deleteUUID(index)}
                  className="text-primary"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No UUIDs found.</p>
        )}
      </div>
    </div>
  );
};

export default UUIDGenerator;
