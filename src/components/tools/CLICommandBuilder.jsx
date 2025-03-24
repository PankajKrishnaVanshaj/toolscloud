"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaDownload, FaHistory } from "react-icons/fa";

const CLICommandBuilder = () => {
  const [tool, setTool] = useState("git");
  const [command, setCommand] = useState("");
  const [options, setOptions] = useState({});
  const [generatedCommand, setGeneratedCommand] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const tools = {
    git: {
      commands: {
        clone: {
          description: "Clone a repository",
          options: {
            repo: { type: "text", label: "Repository URL", required: true },
            "--depth": { type: "number", label: "Clone depth", default: "", min: 1 },
            "--branch": { type: "text", label: "Branch name", default: "" },
            "--recurse-submodules": { type: "checkbox", label: "Recurse submodules", default: false },
          },
        },
        commit: {
          description: "Record changes to the repository",
          options: {
            "-m": { type: "text", label: "Commit message", required: true },
            "--amend": { type: "checkbox", label: "Amend previous commit", default: false },
            "--no-verify": { type: "checkbox", label: "Bypass hooks", default: false },
          },
        },
        push: {
          description: "Update remote refs",
          options: {
            repo: { type: "text", label: "Remote name", default: "origin" },
            branch: { type: "text", label: "Branch name", default: "" },
            "--force": { type: "checkbox", label: "Force push", default: false },
          },
        },
      },
    },
    npm: {
      commands: {
        install: {
          description: "Install dependencies",
          options: {
            package: { type: "text", label: "Package name", default: "" },
            "--save": { type: "checkbox", label: "Save to dependencies", default: false },
            "--save-dev": { type: "checkbox", label: "Save to devDependencies", default: false },
            "--global": { type: "checkbox", label: "Install globally", default: false },
          },
        },
        run: {
          description: "Run a script",
          options: {
            script: { type: "text", label: "Script name", required: true },
            "--silent": { type: "checkbox", label: "Silent mode", default: false },
          },
        },
      },
    },
    docker: {
      commands: {
        run: {
          description: "Run a container",
          options: {
            image: { type: "text", label: "Image name", required: true },
            "-d": { type: "checkbox", label: "Run in detached mode", default: false },
            "-p": { type: "text", label: "Port mapping (host:container)", default: "" },
            "--name": { type: "text", label: "Container name", default: "" },
            "-v": { type: "text", label: "Volume mapping (host:container)", default: "" },
          },
        },
        build: {
          description: "Build an image",
          options: {
            "-t": { type: "text", label: "Tag name", required: true },
            path: { type: "text", label: "Build context", default: "." },
            "--no-cache": { type: "checkbox", label: "No cache", default: false },
          },
        },
      },
    },
  };

  const handleOptionChange = (optionKey, value) => {
    setOptions((prev) => ({ ...prev, [optionKey]: value }));
    setError("");
  };

  const validateOptions = useCallback(() => {
    if (!command) return "Please select a command";
    const cmdConfig = tools[tool].commands[command];
    for (const [optKey, optConfig] of Object.entries(cmdConfig.options)) {
      const value = options[optKey] ?? optConfig.default;
      if (optConfig.required && (!value || value.toString().trim() === "")) {
        return `${optConfig.label} is required`;
      }
      if (optConfig.type === "number" && value && (isNaN(value) || (optConfig.min && value < optConfig.min))) {
        return `${optConfig.label} must be a valid number${optConfig.min ? ` >= ${optConfig.min}` : ""}`;
      }
    }
    return "";
  }, [tool, command, options]);

  const generateCommand = useCallback(() => {
    const validationError = validateOptions();
    if (validationError) {
      setError(validationError);
      setGeneratedCommand("");
      return;
    }

    const cmdConfig = tools[tool].commands[command];
    let cmd = `${tool} ${command}`;

    Object.entries(cmdConfig.options).forEach(([optKey, optConfig]) => {
      const value = options[optKey] ?? optConfig.default;
      if (optConfig.type === "checkbox" && value) {
        cmd += ` ${optKey}`;
      } else if ((optConfig.type === "text" || optConfig.type === "number") && value && value.toString().trim()) {
        cmd += optKey.startsWith("-") ? ` ${optKey} "${value}"` : ` "${value}"`;
      }
    });

    setGeneratedCommand(cmd.trim());
    setHistory((prev) => [...prev, cmd.trim()].slice(-5));
    setCopied(false);
    setError("");
  }, [tool, command, options, validateOptions]);

  const handleCopy = () => {
    if (generatedCommand) {
      navigator.clipboard.writeText(generatedCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedCommand) {
      const blob = new Blob([generatedCommand], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tool}-command-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const resetForm = () => {
    setCommand("");
    setOptions({});
    setGeneratedCommand("");
    setError("");
    setCopied(false);
  };

  const restoreFromHistory = (cmd) => {
    setGeneratedCommand(cmd);
    // Optionally parse command back to options (complex, depends on use case)
  };

  useEffect(() => {
    resetOptions();
  }, [command]);

  const resetOptions = () => {
    const defaultOptions = {};
    if (command && tools[tool].commands[command]) {
      Object.entries(tools[tool].commands[command].options).forEach(([key, opt]) => {
        defaultOptions[key] = opt.default !== undefined ? opt.default : "";
      });
    }
    setOptions(defaultOptions);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CLI Command Builder</h2>

        {/* Tool and Command Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tool</label>
            <select
              value={tool}
              onChange={(e) => {
                setTool(e.target.value);
                resetForm();
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(tools).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Command</label>
            <select
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a command</option>
              {Object.entries(tools[tool].commands).map(([cmd, config]) => (
                <option key={cmd} value={cmd}>{`${cmd} - ${config.description}`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Command Options */}
        {command && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Options</h3>
            <div className="space-y-4">
              {Object.entries(tools[tool].commands[command].options).map(([optKey, optConfig]) => (
                <div key={optKey} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {optConfig.type === "checkbox" ? (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options[optKey] || false}
                        onChange={(e) => handleOptionChange(optKey, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{`${optConfig.label} (${optKey})`}</span>
                    </label>
                  ) : (
                    <>
                      <label className="text-sm text-gray-700 w-full sm:w-40">{`${optConfig.label}${optConfig.required ? " *" : ""}`}</label>
                      <input
                        type={optConfig.type}
                        value={options[optKey] || ""}
                        onChange={(e) => handleOptionChange(optKey, e.target.value)}
                        min={optConfig.min}
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={optConfig.required ? "Required" : "Optional"}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={generateCommand}
              className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!command}
            >
              Generate Command
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Generated Command */}
        {generatedCommand && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Generated Command</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`py-1 px-3 text-sm rounded transition-colors flex items-center ${
                    copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-1" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-1" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {generatedCommand}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Recent Commands (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((cmd, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="truncate max-w-[70%]">{cmd}</span>
                  <button
                    onClick={() => restoreFromHistory(cmd)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={resetForm}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <FaSync className="mr-2" /> Reset All
        </button>

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for Git, npm, and Docker commands</li>
            <li>Dynamic option generation based on command</li>
            <li>Command validation and error handling</li>
            <li>Copy and download functionality</li>
            <li>Command history tracking</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CLICommandBuilder;