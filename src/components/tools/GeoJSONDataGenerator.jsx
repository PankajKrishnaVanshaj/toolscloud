"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const GeoJSONDataGenerator = () => {
  const [geojsonData, setGeoJsonData] = useState("");
  const [count, setCount] = useState(5);
  const [geometryType, setGeometryType] = useState("Point");
  const [properties, setProperties] = useState([
    { name: "id", type: "number" },
    { name: "name", type: "string" },
  ]);
  const [coordinateRange, setCoordinateRange] = useState({ minLat: -90, maxLat: 90, minLon: -180, maxLon: 180 });
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const MAX_ITEMS = 1000;
  const GEOMETRY_TYPES = ["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"];
  const PROPERTY_TYPES = ["number", "string", "boolean"];

  // Generate random coordinates within range
  const generateCoordinates = useCallback((type) => {
    const { minLat, maxLat, minLon, maxLon } = coordinateRange;
    const lat = () => (Math.random() * (maxLat - minLat) + minLat).toFixed(6);
    const lon = () => (Math.random() * (maxLon - minLon) + minLon).toFixed(6);

    switch (type) {
      case "Point":
        return [parseFloat(lon()), parseFloat(lat())];
      case "LineString":
        return Array.from({ length: 3 }, () => [parseFloat(lon()), parseFloat(lat())]);
      case "Polygon":
        const center = [parseFloat(lon()), parseFloat(lat())];
        const radius = Math.random() * 0.1;
        const points = Array.from({ length: 5 }, (_, i) => {
          const angle = (i / 5) * 2 * Math.PI;
          return [
            parseFloat((center[0] + radius * Math.cos(angle)).toFixed(6)),
            parseFloat((center[1] + radius * Math.sin(angle)).toFixed(6)),
          ];
        });
        return [points.concat([points[0]])];
      case "MultiPoint":
        return Array.from({ length: 4 }, () => [parseFloat(lon()), parseFloat(lat())]);
      case "MultiLineString":
        return Array.from({ length: 2 }, () =>
          Array.from({ length: 3 }, () => [parseFloat(lon()), parseFloat(lat())])
        );
      case "MultiPolygon":
        return Array.from({ length: 2 }, () => {
          const center = [parseFloat(lon()), parseFloat(lat())];
          const radius = Math.random() * 0.1;
          const points = Array.from({ length: 5 }, (_, i) => {
            const angle = (i / 5) * 2 * Math.PI;
            return [
              parseFloat((center[0] + radius * Math.cos(angle)).toFixed(6)),
              parseFloat((center[1] + radius * Math.sin(angle)).toFixed(6)),
            ];
          });
          return [points.concat([points[0]])];
        });
      default:
        return [0, 0];
    }
  }, [coordinateRange]);

  // Generate random property values
  const generatePropertyValue = useCallback((type) => {
    const timestamp = Date.now();
    switch (type) {
      case "number":
        return Math.floor(Math.random() * 10000);
      case "string":
        const prefixes = ["place", "location", "site", "area"];
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
      case "boolean":
        return Math.random() > 0.5;
      default:
        return null;
    }
  }, []);

  // Generate GeoJSON
  const generateGeoJSON = useCallback(async () => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setGeoJsonData("");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const features = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => ({
        type: "Feature",
        geometry: {
          type: geometryType,
          coordinates: generateCoordinates(geometryType),
        },
        properties: properties.reduce(
          (obj, prop) => ({
            ...obj,
            [prop.name]: generatePropertyValue(prop.type),
          }),
          {}
        ),
      }));

      const geojson = {
        type: "FeatureCollection",
        features: features,
      };

      const jsonString = JSON.stringify(geojson, null, 2);
      setGeoJsonData(jsonString);
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [count, geometryType, properties, generateCoordinates, generatePropertyValue]);

  // Validation
  const validateFields = () => {
    if (properties.length === 0) return "Please add at least one property";
    if (properties.some((prop) => !prop.name.trim())) return "All property names must be filled";
    if (new Set(properties.map((p) => p.name)).size !== properties.length)
      return "Property names must be unique";
    if (
      coordinateRange.minLat < -90 || coordinateRange.maxLat > 90 ||
      coordinateRange.minLon < -180 || coordinateRange.maxLon > 180 ||
      coordinateRange.minLat >= coordinateRange.maxLat ||
      coordinateRange.minLon >= coordinateRange.maxLon
    ) return "Invalid coordinate range";
    return "";
  };

  // Property management
  const addProperty = () => {
    if (properties.length < 20) {
      setProperties([...properties, { name: `prop${properties.length + 1}`, type: "number" }]);
    }
  };

  const updateProperty = (index, key, value) => {
    setProperties(properties.map((prop, i) => (i === index ? { ...prop, [key]: value } : prop)));
  };

  const removeProperty = (index) => {
    if (properties.length > 1) {
      setProperties(properties.filter((_, i) => i !== index));
    }
  };

  // Clipboard and download
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(geojsonData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadGeoJSON = () => {
    try {
      const blob = new Blob([geojsonData], { type: "application/json;charset=utf-8" });
      saveAs(blob, `geojson-${Date.now()}.geojson`);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  // Reset
  const reset = () => {
    setGeoJsonData("");
    setCount(5);
    setGeometryType("Point");
    setProperties([{ name: "id", type: "number" }, { name: "name", type: "string" }]);
    setCoordinateRange({ minLat: -90, maxLat: 90, minLon: -180, maxLon: 180 });
    setIsCopied(false);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">GeoJSON Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Features (1-{MAX_ITEMS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geometry Type</label>
              <select
                value={geometryType}
                onChange={(e) => setGeometryType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {GEOMETRY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coordinate Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="-90"
                  max="90"
                  value={coordinateRange.minLat}
                  onChange={(e) => setCoordinateRange({ ...coordinateRange, minLat: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Min (-90)"
                  disabled={isLoading}
                />
                <input
                  type="number"
                  min="-90"
                  max="90"
                  value={coordinateRange.maxLat}
                  onChange={(e) => setCoordinateRange({ ...coordinateRange, maxLat: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Max (90)"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={coordinateRange.minLon}
                  onChange={(e) => setCoordinateRange({ ...coordinateRange, minLon: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Min (-180)"
                  disabled={isLoading}
                />
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={coordinateRange.maxLon}
                  onChange={(e) => setCoordinateRange({ ...coordinateRange, maxLon: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Max (180)"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Properties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Properties ({properties.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {properties.map((prop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={prop.name}
                    onChange={(e) => updateProperty(index, "name", e.target.value)}
                    placeholder="Property Name"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <select
                    value={prop.type}
                    onChange={(e) => updateProperty(index, "type", e.target.value)}
                    className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeProperty(index)}
                    disabled={properties.length <= 1 || isLoading}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addProperty}
              disabled={properties.length >= 20 || isLoading}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
            >
              <FaPlus className="mr-1" /> Add Property {properties.length >= 20 && "(Max 20)"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generateGeoJSON}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : null}
            {isLoading ? "Generating..." : "Generate GeoJSON"}
          </button>
          {geojsonData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy GeoJSON"}
              </button>
              <button
                onClick={downloadGeoJSON}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download GeoJSON
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </>
          )}
        </div>

        {/* Generated Output */}
        {geojsonData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated GeoJSON ({count} features)
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {geojsonData}
              </pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Size: {(new TextEncoder().encode(geojsonData).length / 1024).toFixed(2)} KB
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon</li>
            <li>Customizable coordinate ranges</li>
            <li>Dynamic property management (up to 20 properties)</li>
            <li>Copy to clipboard and download as .geojson</li>
             <li>Real-time validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeoJSONDataGenerator;