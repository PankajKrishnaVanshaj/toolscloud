"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaTrash, FaPlus } from "react-icons/fa";

const KMLDataGenerator = () => {
  const [kmlData, setKMLData] = useState("");
  const [count, setCount] = useState(5);
  const [name, setName] = useState("GeneratedPoints");
  const [fields, setFields] = useState([
    { name: "description", type: "string", required: false },
    { name: "category", type: "string", required: false },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [style, setStyle] = useState({
    iconUrl: "http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png",
    iconScale: 1.0,
    color: "FFFF00",
  });
  const [coordinateRange, setCoordinateRange] = useState({
    latMin: -90,
    latMax: 90,
    lonMin: -180,
    lonMax: 180,
    altMin: 0,
    altMax: 1000,
  });

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = ["string", "number", "boolean"];

  // Generate random data
  const generateRandomData = useCallback((type, required) => {
    let value;
    switch (type) {
      case "string":
        const prefixes = ["Point", "Location", "Marker", "Place"];
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        break;
      case "number":
        value = Math.floor(Math.random() * 1000);
        break;
      case "boolean":
        value = Math.random() > 0.5;
        break;
      default:
        value = "";
    }
    return required && !value ? generateRandomData(type, required) : value;
  }, []);

  // Generate random coordinates within range
  const generateRandomCoordinates = () => {
    const { latMin, latMax, lonMin, lonMax, altMin, altMax } = coordinateRange;
    const latitude = (Math.random() * (latMax - latMin) + latMin).toFixed(6);
    const longitude = (Math.random() * (lonMax - lonMin) + lonMin).toFixed(6);
    const altitude = Math.floor(Math.random() * (altMax - altMin) + altMin);
    return { latitude, longitude, altitude };
  };

  // Generate KML content
  const generateKML = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setKMLData("");
      return;
    }

    setError("");
    try {
      let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <description>Generated KML Points</description>
    <Style id="defaultStyle">
      <IconStyle>
        <scale>${style.iconScale}</scale>
        <Icon>
          <href>${style.iconUrl}</href>
        </Icon>
        <color>${style.color}</color>
      </IconStyle>
    </Style>
`;

      const points = Array.from({ length: Math.min(count, MAX_ITEMS) }, (_, index) => {
        const coords = generateRandomCoordinates();
        const properties = fields.reduce(
          (obj, field) => ({
            ...obj,
            [field.name]: generateRandomData(field.type, field.required),
          }),
          {}
        );
        return { index, coords, properties };
      });

      points.forEach((point) => {
        kmlContent += `    <Placemark>
      <name>Point ${point.index + 1}</name>
      <styleUrl>#defaultStyle</styleUrl>
      <ExtendedData>
`;
        Object.entries(point.properties).forEach(([key, value]) => {
          kmlContent += `        <Data name="${key}">
          <value>${value}</value>
        </Data>
`;
        });
        kmlContent += `      </ExtendedData>
      <Point>
        <coordinates>${point.coords.longitude},${point.coords.latitude},${point.coords.altitude}</coordinates>
      </Point>
    </Placemark>
`;
      });

      kmlContent += `  </Document>
</kml>`;

      setKMLData(kmlContent);
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [count, name, fields, style, coordinateRange, generateRandomData]);

  const validateFields = () => {
    if (!name.trim()) return "Name cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return "Field names must be unique";
    if (coordinateRange.latMin >= coordinateRange.latMax || coordinateRange.lonMin >= coordinateRange.lonMax || coordinateRange.altMin >= coordinateRange.altMax)
      return "Min values must be less than Max values for coordinates";
    return "";
  };

  const addField = () => {
    if (fields.length < 10) {
      setFields([
        ...fields,
        { name: `field${fields.length + 1}`, type: "string", required: false },
      ]);
    }
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(kmlData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadFile = () => {
    try {
      const blob = new Blob([kmlData], { type: "application/vnd.google-earth.kml+xml" });
      saveAs(blob, `${name.toLowerCase()}.kml`);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const reset = () => {
    setKMLData("");
    setCount(5);
    setName("GeneratedPoints");
    setFields([
      { name: "description", type: "string", required: false },
      { name: "category", type: "string", required: false },
    ]);
    setStyle({
      iconUrl: "http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png",
      iconScale: 1.0,
      color: "FFFF00",
    });
    setCoordinateRange({
      latMin: -90,
      latMax: 90,
      lonMin: -180,
      lonMax: 180,
      altMin: 0,
      altMax: 1000,
    });
    setError("");
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">KML Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Settings */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Points (1-{MAX_ITEMS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.trim() || "GeneratedPoints")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., GeneratedPoints"
              />
            </div>
          </div>

          {/* Coordinate Range */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Coordinate Range</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Latitude", minKey: "latMin", maxKey: "latMax", min: -90, max: 90 },
                { label: "Longitude", minKey: "lonMin", maxKey: "lonMax", min: -180, max: 180 },
                { label: "Altitude", minKey: "altMin", maxKey: "altMax", min: 0, max: 10000 },
              ].map(({ label, minKey, maxKey, min, max }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={coordinateRange[minKey]}
                      onChange={(e) =>
                        setCoordinateRange((prev) => ({
                          ...prev,
                          [minKey]: Math.max(min, Math.min(max, Number(e.target.value))),
                        }))
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={coordinateRange[maxKey]}
                      onChange={(e) =>
                        setCoordinateRange((prev) => ({
                          ...prev,
                          [maxKey]: Math.max(min, Math.min(max, Number(e.target.value))),
                        }))
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Max"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Style Settings */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Marker Style</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                <input
                  type="text"
                  value={style.iconUrl}
                  onChange={(e) => setStyle((prev) => ({ ...prev, iconUrl: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Icon URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon Scale ({style.iconScale.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={style.iconScale}
                  onChange={(e) => setStyle((prev) => ({ ...prev, iconScale: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={`#${style.color}`}
                  onChange={(e) => setStyle((prev) => ({ ...prev, color: e.target.value.slice(1) }))}
                  className="w-full h-10 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Fields ({fields.length}/10)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, "required", e.target.checked)}
                      className="mr-1 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">Required</span>
                  </label>
                  <button
                    onClick={() => removeField(index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              disabled={fields.length >= 10}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus className="mr-1" /> Add Field {fields.length >= 10 && "(Max 10)"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generateKML}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate KML
          </button>
          {kmlData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy KML"}
              </button>
              <button
                onClick={downloadFile}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download KML
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaTrash className="mr-2" /> Reset
              </button>
            </>
          )}
        </div>

        {/* Generated KML */}
        {kmlData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated KML ({count} points)
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{kmlData}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              File size: {(kmlData.length / 1024).toFixed(2)} KB
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate up to {MAX_ITEMS} random KML points</li>
            <li>Customizable coordinate ranges</li>
            <li>Marker style customization (icon, scale, color)</li>
            <li>Dynamic custom fields (up to 10)</li>
            <li>Copy to clipboard and download as KML</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KMLDataGenerator;