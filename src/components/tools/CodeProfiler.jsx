"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaPlay, FaStop, FaDownload, FaSync } from "react-icons/fa";

const CodeProfiler = () => {
  const [codeInput, setCodeInput] = useState("");
  const [profileResult, setProfileResult] = useState(null);
  const [error, setError] = useState(null);
  const [isProfiling, setIsProfiling] = useState(false);
  const [runs, setRuns] = useState(1);
  const [profileOptions, setProfileOptions] = useState({
    trackExecutionTime: true,
    trackCallCounts: true,
    captureLogs: true,
    memoryUsage: false,
  });
  const workerRef = useRef(null);

  const initializeWorker = useCallback(() => {
    if (!workerRef.current) {
      const workerCode = `
        self.onmessage = function(e) {
          const { code, runs, options } = e.data;
          const results = [];
          const sandbox = {
            console: { 
              log: (...args) => {
                if (options.captureLogs) {
                  sandbox.logs = sandbox.logs || [];
                  sandbox.logs.push(args.join(' '));
                }
              }
            },
            performance: { now: () => performance.now() },
            callCounts: new Map()
          };

          const wrapFunction = (fnName, fn) => {
            return function(...args) {
              if (options.trackCallCounts) {
                sandbox.callCounts.set(fnName, (sandbox.callCounts.get(fnName) || 0) + 1);
              }
              return fn.apply(this, args);
            };
          };

          try {
            for (let i = 0; i < runs; i++) {
              const startTime = performance.now();
              const startMemory = options.memoryUsage && self.performance.memory ? self.performance.memory.usedJSHeapSize : null;

              const fnCode = 
                code.replace(
                  /function\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*{([^}]*)}/g,
                  (match, fnName, params, body) => {
                    return 'const ' + fnName + ' = wrapFunction("' + fnName + '", function(' + params + ') {' + body + '}); ';
                  }
                ) + code;

              new Function('performance', 'callCounts', 'logs', fnCode)(sandbox.performance, sandbox.callCounts, sandbox.console.logs);

              const endTime = performance.now();
              const endMemory = options.memoryUsage && self.performance.memory ? self.performance.memory.usedJSHeapSize : null;

              results.push({
                executionTime: endTime - startTime,
                callCounts: Object.fromEntries(sandbox.callCounts),
                logs: sandbox.logs || [],
                memoryUsed: endMemory && startMemory ? (endMemory - startMemory) / 1024 / 1024 : null
              });
            }
            self.postMessage({ success: true, results });
          } catch (err) {
            self.postMessage({ success: false, error: err.message });
          }
        };
      `;
      const blob = new Blob([workerCode], { type: "application/javascript" });
      workerRef.current = new Worker(URL.createObjectURL(blob));
    }
  }, []);

  const profileCode = useCallback(() => {
    setError(null);
    setProfileResult(null);
    setIsProfiling(true);

    if (!codeInput.trim()) {
      setError("Please enter some code to profile");
      setIsProfiling(false);
      return;
    }

    initializeWorker();
    workerRef.current.onmessage = (e) => {
      setIsProfiling(false);
      if (e.data.success) {
        const aggregatedResult = e.data.results.reduce(
          (acc, result) => ({
            executionTime: acc.executionTime + result.executionTime,
            callCounts: Object.entries(result.callCounts).reduce((counts, [fn, count]) => {
              counts[fn] = (counts[fn] || 0) + count;
              return counts;
            }, acc.callCounts),
            logs: [...acc.logs, ...(result.logs || [])],
            memoryUsed: result.memoryUsed ? acc.memoryUsed + result.memoryUsed : null,
          }),
          { executionTime: 0, callCounts: {}, logs: [], memoryUsed: 0 }
        );
        setProfileResult({
          executionTime: (aggregatedResult.executionTime / runs).toFixed(2),
          callCounts: aggregatedResult.callCounts,
          logs: aggregatedResult.logs,
          avgMemoryUsed: aggregatedResult.memoryUsed ? (aggregatedResult.memoryUsed / runs).toFixed(2) : null,
          runsCompleted: runs,
        });
      } else {
        setError(`Error profiling code: ${e.data.error}`);
      }
    };
    workerRef.current.postMessage({ code: codeInput, runs, options: profileOptions });
  }, [codeInput, runs, profileOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    profileCode();
  };

  const handleDownload = () => {
    const resultString = JSON.stringify(profileResult, null, 2);
    const blob = new Blob([resultString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `profile-result-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Code Profiler</h2>

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">JavaScript Code</label>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`function add(a, b) {\n  console.log("Adding numbers");\n  return a + b;\n}\n\nfor (let i = 0; i < 5; i++) {\n  add(i, i + 1);\n}`}
            />
          </div>

          {/* Profiling Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Profiling Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(profileOptions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setProfileOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Runs</label>
              <input
                type="number"
                value={runs}
                onChange={(e) => setRuns(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full sm:w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isProfiling}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProfiling ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <FaPlay className="mr-2" />
              )}
              {isProfiling ? "Profiling..." : "Profile Code"}
            </button>
            <button
              onClick={() => setCodeInput("")}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={!profileResult}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Profile Result */}
        {profileResult && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Performance Metrics</h3>
              {profileOptions.trackExecutionTime && (
                <p className="text-sm text-gray-600">
                  Average Execution Time: <span className="font-mono">{profileResult.executionTime} ms</span>
                </p>
              )}
              <p className="text-sm text-gray-600">
                Runs Completed: <span className="font-mono">{profileResult.runsCompleted}</span>
              </p>
              {profileOptions.memoryUsage && profileResult.avgMemoryUsed && (
                <p className="text-sm text-gray-600">
                  Average Memory Used: <span className="font-mono">{profileResult.avgMemoryUsed} MB</span>
                </p>
              )}
            </div>

            {profileOptions.trackCallCounts && Object.keys(profileResult.callCounts).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Function Call Counts</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  {Object.entries(profileResult.callCounts).map(([fnName, count]) => (
                    <li key={fnName}>
                      <span className="font-mono">{fnName}</span>: Called {count} time{count !== 1 ? "s" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profileOptions.captureLogs && profileResult.logs.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Console Logs</h3>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap max-h-64 overflow-auto">
                  {profileResult.logs.join("\n")}
                </pre>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Notes</h3>
              <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                <li>Execution time is averaged over {runs} run{runs !== 1 ? "s" : ""}</li>
                <li>Memory usage requires browser support (Chrome/Edge)</li>
                <li>Complex nested functions may not be fully tracked</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeProfiler;