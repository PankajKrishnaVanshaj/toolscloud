"use client";

import React, { useState } from 'react';

const CodeProfiler = () => {
  const [codeInput, setCodeInput] = useState('');
  const [profileResult, setProfileResult] = useState(null);
  const [error, setError] = useState(null);

  const profileCode = (code) => {
    setError(null);
    setProfileResult(null);

    if (!code.trim()) {
      setError('Please enter some code to profile');
      return;
    }

    try {
      // Create a sandboxed environment
      const sandbox = {
        console: {
          log: (...args) => {
            sandbox.logs = sandbox.logs || [];
            sandbox.logs.push(args.join(' '));
          }
        },
        performance: {
          now: () => performance.now()
        },
        callCounts: new Map()
      };

      // Wrap code in a profiling function
      const wrappedCode = `
        return (function() {
          const startTime = performance.now();
          const originalFunctions = {};
          let executionCount = 0;

          // Function call counter
          const wrapFunction = (fnName, fn) => {
            return function(...args) {
              callCounts.set(fnName, (callCounts.get(fnName) || 0) + 1);
              return fn.apply(this, args);
            };
          };

          // Parse and wrap user-defined functions
          ${code.replace(
            /function\s+(\w+)\s*\(([^)]*)\)\s*{([^}]*)}/g,
            (match, fnName, params, body) => {
              return `
                const ${fnName} = wrapFunction('${fnName}', function(${params}) {
                  ${body}
                });
                originalFunctions['${fnName}'] = ${fnName};
              `;
            }
          )}

          // Execute the code
          (function() {
            ${code}
          })();

          const endTime = performance.now();
          executionCount++;

          return {
            executionTime: endTime - startTime,
            callCounts: Object.fromEntries(callCounts),
            logs: logs || [],
            executionCount
          };
        })();
      `;

      // Use Function constructor instead of eval for slightly better scoping
      const profiler = new Function('performance', 'callCounts', 'logs', wrappedCode);
      const result = profiler(sandbox.performance, sandbox.callCounts, sandbox.console.logs);

      setProfileResult({
        executionTime: result.executionTime.toFixed(2),
        callCounts: result.callCounts,
        logs: result.logs,
        executionCount: result.executionCount
      });
    } catch (err) {
      setError('Error profiling code: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    profileCode(codeInput);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Profiler</h2>

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JavaScript Code
            </label>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`function add(a, b) {
  console.log("Adding numbers");
  return a + b;
}

for (let i = 0; i < 5; i++) {
  add(i, i + 1);
}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Profile Code
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Profile Result */}
        {profileResult && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Performance Metrics</h3>
              <p className="text-sm text-gray-600">
                Execution Time: <span className="font-mono">{profileResult.executionTime} ms</span>
              </p>
              <p className="text-sm text-gray-600">
                Number of Executions: <span className="font-mono">{profileResult.executionCount}</span>
              </p>
            </div>

            {Object.keys(profileResult.callCounts).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700 mb-2">Function Call Counts</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5">
                  {Object.entries(profileResult.callCounts).map(([fnName, count]) => (
                    <li key={fnName}>
                      <span className="font-mono">{fnName}</span>: Called {count} time{count !== 1 ? 's' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profileResult.logs.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700 mb-2">Console Logs</h3>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {profileResult.logs.join('\n')}
                </pre>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">
                - Execution time is approximate and may vary based on browser and system load.
              </p>
              <p className="text-sm text-gray-600">
                - Only basic function calls are tracked; nested or complex calls may not be fully counted.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeProfiler;