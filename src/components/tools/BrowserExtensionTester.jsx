"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaTrash, FaPlay, FaPause } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const BrowserExtensionTester = () => {
  const [testResult, setTestResult] = useState("");
  const [injectedContent, setInjectedContent] = useState("");
  const [storageData, setStorageData] = useState({});
  const [tabInfo, setTabInfo] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [customScript, setCustomScript] = useState("");
  const contentAreaRef = useRef(null);

  // Simulated browser extension APIs
  const mockChromeAPI = {
    tabs: {
      query: (options, callback) => {
        callback([{ id: 1, title: "Current Tab", url: window.location.href }]);
      },
      executeScript: (tabId, details, callback) => {
        setInjectedContent(details.code);
        try {
          // Simulate script execution on the content area
          const func = new Function(details.code);
          func.call(contentAreaRef.current);
          callback(["Script executed successfully"]);
        } catch (error) {
          callback([`Script error: ${error.message}`]);
        }
      },
      captureVisibleTab: (windowId, options, callback) => {
        callback("data:image/png;base64,mock-screenshot");
      },
    },
    storage: {
      local: {
        set: (data, callback) => {
          setStorageData((prev) => ({ ...prev, ...data }));
          callback();
        },
        get: (keys, callback) => {
          callback(storageData);
        },
        remove: (keys, callback) => {
          setStorageData((prev) => {
            const newData = { ...prev };
            keys.forEach((key) => delete newData[key]);
            return newData;
          });
          callback();
        },
      },
    },
    runtime: {
      sendMessage: (message, callback) => {
        callback(`Received: ${message}`);
      },
    },
    alarms: {
      create: (name, options) => {
        setTimeout(() => {
          setTestResult(`Alarm "${name}" triggered`);
        }, options.delayInMinutes * 60000 || options.periodInMinutes * 60000);
      },
    },
  };

  // Test functions
  const testTabInfo = useCallback(() => {
    mockChromeAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setTabInfo(tabs[0]);
      setTestResult("Tab info retrieved");
    });
  }, []);

  const testContentScript = useCallback(() => {
    const script = `document.body.style.backgroundColor = '#f0f0f0'; document.body.innerHTML += '<p>Injected!</p>';`;
    mockChromeAPI.tabs.executeScript(1, { code: script }, (results) => {
      setTestResult(`Content script executed: ${results[0]}`);
    });
  }, []);

  const testStorage = useCallback(() => {
    mockChromeAPI.storage.local.set({ testKey: `testValue_${Date.now()}` }, () => {
      mockChromeAPI.storage.local.get(["testKey"], (result) => {
        setTestResult(`Storage set and retrieved: ${result.testKey}`);
      });
    });
  }, []);

  const testMessage = useCallback(() => {
    mockChromeAPI.runtime.sendMessage("Test message", (response) => {
      setTestResult(response);
    });
  }, []);

  const testAlarm = useCallback(() => {
    mockChromeAPI.alarms.create("testAlarm", { delayInMinutes: 0.1 }); // 6 seconds
    setTestResult("Alarm scheduled (check back in 6 seconds)");
  }, []);

  const testScreenshot = useCallback(() => {
    mockChromeAPI.tabs.captureVisibleTab(null, {}, (dataUrl) => {
      setTestResult("Screenshot captured (simulated)");
      setInjectedContent(`console.log('Screenshot: ${dataUrl}')`);
    });
  }, []);

  const runCustomScript = useCallback(() => {
    if (!customScript) {
      setTestResult("Please enter a custom script");
      return;
    }
    mockChromeAPI.tabs.executeScript(1, { code: customScript }, (results) => {
      setTestResult(`Custom script executed: ${results[0]}`);
    });
  }, [customScript]);

  const runAllTests = useCallback(async () => {
    setIsRunningTests(true);
    setTestResult("Running all tests...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    testTabInfo();
    await new Promise((resolve) => setTimeout(resolve, 500));
    testContentScript();
    await new Promise((resolve) => setTimeout(resolve, 500));
    testStorage();
    await new Promise((resolve) => setTimeout(resolve, 500));
    testMessage();
    await new Promise((resolve) => setTimeout(resolve, 500));
    testAlarm();
    await new Promise((resolve) => setTimeout(resolve, 500));
    testScreenshot();
    setTestResult("All tests completed");
    setIsRunningTests(false);
  }, [testTabInfo, testContentScript, testStorage, testMessage, testAlarm, testScreenshot]);

  const clearStorage = () => {
    mockChromeAPI.storage.local.remove(Object.keys(storageData), () => {
      setTestResult("Storage cleared");
    });
  };

  const downloadResults = () => {
    if (contentAreaRef.current) {
      html2canvas(contentAreaRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `extension-test-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const reset = () => {
    setTestResult("");
    setInjectedContent("");
    setStorageData({});
    setTabInfo(null);
    setCustomScript("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Browser Extension Tester
        </h1>

        <div className="space-y-6">
          {/* Test Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { fn: testTabInfo, label: "Test Tab Info" },
              { fn: testContentScript, label: "Test Content Script" },
              { fn: testStorage, label: "Test Storage" },
              { fn: testMessage, label: "Test Messaging" },
              { fn: testAlarm, label: "Test Alarm" },
              { fn: testScreenshot, label: "Test Screenshot" },
            ].map(({ fn, label }) => (
              <button
                key={label}
                onClick={fn}
                disabled={isRunningTests}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom Script */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Script
            </label>
            <textarea
              value={customScript}
              onChange={(e) => setCustomScript(e.target.value)}
              placeholder="Enter JavaScript code to inject (e.g., document.body.style.color = 'red')"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            <button
              onClick={runCustomScript}
              disabled={isRunningTests}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Run Custom Script
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isRunningTests ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
              {isRunningTests ? "Running..." : "Run All Tests"}
            </button>
            <button
              onClick={downloadResults}
              disabled={isRunningTests || !testResult}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
            <button
              onClick={reset}
              disabled={isRunningTests}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Test Results</h2>
            {testResult && <p className="text-gray-700">{testResult}</p>}
            {tabInfo && (
              <div className="mt-2">
                <p>
                  <span className="font-medium">Tab Title:</span> 
                  {tabInfo.title}
                </p>
                <p>
                  <span className="font-medium">Tab URL:</span> {tabInfo.url}
                </p>
              </div>
            )}
            {Object.keys(storageData).length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Storage Contents:</p>
                <pre className="text-sm bg-gray-100 p-2 rounded">
                  {JSON.stringify(storageData, null, 2)}
                </pre>
                <button
                  onClick={clearStorage}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  <FaTrash className="inline mr-1" /> Clear Storage
                </button>
              </div>
            )}
            {injectedContent && (
              <div className="mt-2">
                <p className="font-medium">Injected Script:</p>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  {injectedContent}
                </code>
              </div>
            )}
          </div>

          {/* Simulated Page Content */}
          <div
            ref={contentAreaRef}
            className="p-4 border rounded-lg bg-white shadow-inner"
          >
            <p className="text-gray-600">
              This is a simulated page content area. Content scripts will affect this section.
            </p>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Test tab info, content scripts, storage, messaging, alarms, and screenshots</li>
              <li>Custom script injection</li>
              <li>Run all tests sequentially</li>
              <li>Download test results as PNG</li>
              <li>Simulated page content area</li>
            </ul>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4">
            Note: This is a simulation of browser extension functionality within a web app.
            Actual extensions use real chrome/browser APIs and run in a browser extension context.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrowserExtensionTester;