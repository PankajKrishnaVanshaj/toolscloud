"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const RDFDataGenerator = () => {
  const [rdfData, setRdfData] = useState("");
  const [count, setCount] = useState(5);
  const [baseUri, setBaseUri] = useState("http://example.org/");
  const [prefixes, setPrefixes] = useState([
    { prefix: "ex", uri: "http://example.org/" },
    { prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
    { prefix: "rdfs", uri: "http://www.w3.org/2000/01/rdf-schema#" },
  ]);
  const [properties, setProperties] = useState([
    { name: "name", type: "string", required: false },
    { name: "age", type: "integer", required: false },
    { name: "active", type: "boolean", required: false },
  ]);
  const [format, setFormat] = useState("turtle"); // New: RDF format option
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const MAX_ITEMS = 1000;
  const PROPERTY_TYPES = ["string", "integer", "boolean", "date", "uri", "float"];
  const RDF_FORMATS = ["turtle", "rdf/xml", "json-ld"];

  const generateRandomData = useCallback(
    (type, required) => {
      const timestamp = Date.now();
      let value;
      switch (type) {
        case "string":
          const subjects = ["person", "item", "entity", "resource"];
          value = `${subjects[Math.floor(Math.random() * subjects.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
          break;
        case "integer":
          value = Math.floor(Math.random() * 100);
          break;
        case "boolean":
          value = Math.random() > 0.5;
          break;
        case "date":
          value = new Date(timestamp - Math.random() * 31536000000).toISOString().split("T")[0];
          break;
        case "uri":
          value = `${baseUri}resource/${Math.random().toString(36).substring(2, 8)}`;
          break;
        case "float":
          value = (Math.random() * 100).toFixed(2);
          break;
        default:
          value = "";
      }
      return required && !value ? generateRandomData(type, required) : value;
    },
    [baseUri]
  );

  const generateRDF = useCallback(() => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setRdfData("");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      let rdfContent = "";
      if (format === "turtle") {
        // Turtle format
        rdfContent = prefixes.map((p) => `@prefix ${p.prefix}: <${p.uri}> .\n`).join("");
        rdfContent += "\n";

        const resources = Array.from({ length: Math.min(count, MAX_ITEMS) }, (_, index) => {
          const resourceUri = `<${baseUri}resource/${index + 1}>`;
          let triples = `${resourceUri} a ex:Resource ;\n`;
          triples += properties
            .map((prop, idx) => {
              const value = generateRandomData(prop.type, prop.required);
              let formattedValue;
              switch (prop.type) {
                case "string":
                  formattedValue = `"${value}"`;
                  break;
                case "integer":
                  formattedValue = `"${value}"^^xsd:integer`;
                  break;
                case "boolean":
                  formattedValue = `"${value}"^^xsd:boolean`;
                  break;
                case "date":
                  formattedValue = `"${value}"^^xsd:date`;
                  break;
                case "uri":
                  formattedValue = `<${value}>`;
                  break;
                case "float":
                  formattedValue = `"${value}"^^xsd:float`;
                  break;
                default:
                  formattedValue = `"${value}"`;
              }
              return `  ex:${prop.name} ${formattedValue}${idx === properties.length - 1 ? " ." : " ;"}`;
            })
            .join("\n");
          return triples;
        }).join("\n\n");

        rdfContent += resources;
      } else if (format === "rdf/xml") {
        // RDF/XML format (basic implementation)
        rdfContent = `<?xml version="1.0"?>\n<rdf:RDF\n`;
        prefixes.forEach((p) => {
          rdfContent += `  xmlns:${p.prefix}="${p.uri}"\n`;
        });
        rdfContent += `>\n`;

        Array.from({ length: Math.min(count, MAX_ITEMS) }, (_, index) => {
          const resourceUri = `${baseUri}resource/${index + 1}`;
          rdfContent += `  <rdf:Description rdf:about="${resourceUri}">\n`;
          rdfContent += `    <rdf:type rdf:resource="${prefixes.find((p) => p.prefix === "ex").uri}Resource"/>\n`;
          properties.forEach((prop) => {
            const value = generateRandomData(prop.type, prop.required);
            let formattedValue = `<ex:${prop.name}>${value}</ex:${prop.name}>`;
            if (prop.type === "uri") {
              formattedValue = `<ex:${prop.name} rdf:resource="${value}"/>`;
            } else if (["integer", "boolean", "date", "float"].includes(prop.type)) {
              formattedValue = `<ex:${prop.name} rdf:datatype="http://www.w3.org/2001/XMLSchema#${prop.type}">${value}</ex:${prop.name}>`;
            }
            rdfContent += `    ${formattedValue}\n`;
          });
          rdfContent += `  </rdf:Description>\n`;
        });

        rdfContent += `</rdf:RDF>`;
      } else if (format === "json-ld") {
        // JSON-LD format
        const context = {};
        prefixes.forEach((p) => (context[p.prefix] = p.uri));
        const data = Array.from({ length: Math.min(count, MAX_ITEMS) }, (_, index) => {
          const resource = {
            "@id": `${baseUri}resource/${index + 1}`,
            "@type": "ex:Resource",
          };
          properties.forEach((prop) => {
            const value = generateRandomData(prop.type, prop.required);
            resource[`ex:${prop.name}`] =
              prop.type === "uri"
                ? { "@id": value }
                : { "@value": value, "@type": `xsd:${prop.type}` };
          });
          return resource;
        });
        rdfContent = JSON.stringify({ "@context": context, "@graph": data }, null, 2);
      }

      setRdfData(rdfContent);
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [count, baseUri, prefixes, properties, format, generateRandomData]);

  const validateInputs = () => {
    if (properties.length === 0) return "Please add at least one property";
    if (!baseUri.trim()) return "Base URI cannot be empty";
    if (prefixes.length === 0) return "Please add at least one prefix";
    if (prefixes.some((p) => !p.prefix.trim() || !p.uri.trim()))
      return "All prefixes must have a name and URI";
    if (new Set(prefixes.map((p) => p.prefix)).size !== prefixes.length)
      return "Prefix names must be unique";
    if (properties.some((p) => !p.name.trim())) return "All property names must be filled";
    if (new Set(properties.map((p) => p.name)).size !== properties.length)
      return "Property names must be unique";
    return "";
  };

  const addProperty = () => {
    if (properties.length < 20) {
      setProperties([
        ...properties,
        { name: `property${properties.length + 1}`, type: "string", required: false },
      ]);
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

  const addPrefix = () => {
    if (prefixes.length < 10) {
      setPrefixes([
        ...prefixes,
        { prefix: `ns${prefixes.length + 1}`, uri: `http://example.org/ns${prefixes.length + 1}/` },
      ]);
    }
  };

  const updatePrefix = (index, key, value) => {
    setPrefixes(prefixes.map((prefix, i) => (i === index ? { ...prefix, [key]: value } : prefix)));
  };

  const removePrefix = (index) => {
    if (prefixes.length > 1) {
      setPrefixes(prefixes.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rdfData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadFile = () => {
    try {
      const extension = format === "turtle" ? "ttl" : format === "rdf/xml" ? "rdf" : "jsonld";
      const blob = new Blob([rdfData], { type: `text/${format === "json-ld" ? "json" : format};charset=utf-8` });
      saveAs(blob, `data.${extension}`);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const reset = () => {
    setRdfData("");
    setCount(5);
    setBaseUri("http://example.org/");
    setPrefixes([
      { prefix: "ex", uri: "http://example.org/" },
      { prefix: "rdf", uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
      { prefix: "rdfs", uri: "http://www.w3.org/2000/01/rdf-schema#" },
    ]);
    setProperties([
      { name: "name", type: "string", required: false },
      { name: "age", type: "integer", required: false },
      { name: "active", type: "boolean", required: false },
    ]);
    setFormat("turtle");
    setError("");
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">RDF Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Resources (1-{MAX_ITEMS})
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Base URI</label>
              <input
                type="text"
                value={baseUri}
                onChange={(e) => setBaseUri(e.target.value.trim() || "http://example.org/")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., http://example.org/"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RDF Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {RDF_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prefixes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prefixes ({prefixes.length}/10)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {prefixes.map((prefix, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={prefix.prefix}
                    onChange={(e) => updatePrefix(index, "prefix", e.target.value)}
                    placeholder="Prefix"
                    className="w-1/4 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={prefix.uri}
                    onChange={(e) => updatePrefix(index, "uri", e.target.value)}
                    placeholder="URI"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => removePrefix(index)}
                    disabled={prefixes.length <= 1 || isLoading}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addPrefix}
              disabled={prefixes.length >= 10 || isLoading}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center"
            >
              <FaPlus className="mr-1" /> Add Prefix
            </button>
          </div>

          {/* Properties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Properties ({properties.length}/20)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {properties.map((prop, index) => (
                <div key={index} className="flex gap-2 items-center">
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
                    className="w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={prop.required}
                      onChange={(e) => updateProperty(index, "required", e.target.checked)}
                      className="mr-2 accent-blue-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-600">Required</span>
                  </label>
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
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center"
            >
              <FaPlus className="mr-1" /> Add Property
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateRDF}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {isLoading ? "Generating..." : "Generate RDF"}
            </button>
            {rdfData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy RDF"}
                </button>
                <button
                  onClick={downloadFile}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
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

          {/* Generated RDF */}
          {rdfData && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated RDF Data ({count} resources):
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{rdfData}</pre>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Size: {rdfData.length} characters | Format: {format.toUpperCase()}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Generate RDF in Turtle, RDF/XML, and JSON-LD formats</li>
              <li>Customizable prefixes and properties</li>
              <li>Support for multiple data types including float</li>
              <li>Copy to clipboard and download options</li>
              <li>Real-time validation and error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RDFDataGenerator;