// components/BrowserExtensionTester.js
'use client';

import React, { useState } from 'react';

const BrowserExtensionTester = () => {
  const [testResult, setTestResult] = useState('');
  const [injectedContent, setInjectedContent] = useState('');
  const [storageData, setStorageData] = useState({});
  const [tabInfo, setTabInfo] = useState(null);

  // Simulated browser extension APIs
  const mockChromeAPI = {
    tabs: {
      query: (options, callback) => {
        callback([{ id: 1, title: 'Current Tab', url: window.location.href }]);
      },
      executeScript: (tabId, details, callback) => {
        setInjectedContent(details.code);
        callback(['Script executed']);
      }
    },
    storage: {
      local: {
        set: (data, callback) => {
          setStorageData(prev => ({ ...prev, ...data }));
          callback();
        },
        get: (keys, callback) => {
          callback(storageData);
        },
        remove: (keys, callback) => {
          setStorageData(prev => {
            const newData = { ...prev };
            keys.forEach(key => delete newData[key]);
            return newData;
          });
          callback();
        }
      }
    },
    runtime: {
      sendMessage: (message, callback) => {
        callback(`Received: ${message}`);
      }
    }
  };

  // Test functions
  const testTabInfo = () => {
    mockChromeAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setTabInfo(tabs[0]);
      setTestResult('Tab info retrieved');
    });
  };

  const testContentScript = () => {
    const script = `document.body.style.backgroundColor = '#f0f0f0';`;
    mockChromeAPI.tabs.executeScript(1, { code: script }, (results) => {
      setTestResult(`Content script executed: ${results[0]}`);
    });
  };

  const testStorage = () => {
    mockChromeAPI.storage.local.set({ testKey: 'testValue' }, () => {
      mockChromeAPI.storage.local.get(['testKey'], (result) => {
        setTestResult(`Storage set and retrieved: ${result.testKey}`);
      });
    });
  };

  const testMessage = () => {
    mockChromeAPI.runtime.sendMessage('Test message', (response) => {
      setTestResult(response);
    });
  };

  const clearStorage = () => {
    mockChromeAPI.storage.local.remove(Object.keys(storageData), () => {
      setTestResult('Storage cleared');
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Browser Extension Tester</h1>

      <div className="space-y-6">
        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={testTabInfo}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Tab Info
          </button>
          <button
            onClick={testContentScript}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Content Script
          </button>
          <button
            onClick={testStorage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Storage
          </button>
          <button
            onClick={testMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Messaging
          </button>
        </div>

        {/* Results */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Test Results</h2>
          {testResult && <p className="text-gray-700">{testResult}</p>}
          
          {tabInfo && (
            <div className="mt-2">
              <p><span className="font-medium">Tab Title:</span> {tabInfo.title}</p>
              <p><span className="font-medium">Tab URL:</span> {tabInfo.url}</p>
            </div>
          )}
          
          {Object.keys(storageData).length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Storage Contents:</p>
              <pre className="text-sm">{JSON.stringify(storageData, null, 2)}</pre>
              <button
                onClick={clearStorage}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Clear Storage
              </button>
            </div>
          )}
          
          {injectedContent && (
            <div className="mt-2">
              <p className="font-medium">Injected Script:</p>
              <code className="text-sm bg-gray-200 p-1 rounded">{injectedContent}</code>
            </div>
          )}
        </div>

        {/* Simulated Page Content */}
        <div
          className="p-4 border rounded-md"
          style={injectedContent.includes('backgroundColor') ? { backgroundColor: '#f0f0f0' } : {}}
        >
          <p className="text-gray-600">
            This is a simulated page content area. Content scripts will affect this section.
          </p>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This is a simulation of browser extension functionality within a web app.
          Actual extensions would use real chrome/browser APIs and run in a browser extension context.
        </p>
      </div>
    </div>
  );
};

export default BrowserExtensionTester;