// components/MouseClickCounter.js
'use client';

import React, { useState, useEffect } from 'react';

const MouseClickCounter = () => {
  const [clicks, setClicks] = useState({
    left: 0,
    right: 0,
    middle: 0,
    total: 0
  });
  const [isCounting, setIsCounting] = useState(false);

  const handleClick = (e) => {
    if (!isCounting) return;

    e.preventDefault();
    
    switch (e.button) {
      case 0: // Left click
        setClicks(prev => ({
          ...prev,
          left: prev.left + 1,
          total: prev.total + 1
        }));
        break;
      case 1: // Middle click
        setClicks(prev => ({
          ...prev,
          middle: prev.middle + 1,
          total: prev.total + 1
        }));
        break;
      case 2: // Right click
        setClicks(prev => ({
          ...prev,
          right: prev.right + 1,
          total: prev.total + 1
        }));
        break;
      default:
        break;
    }
  };

  const resetCounter = () => {
    setClicks({
      left: 0,
      right: 0,
      middle: 0,
      total: 0
    });
  };

  const toggleCounting = () => {
    setIsCounting(prev => !prev);
  };

  useEffect(() => {
    const clickArea = document.getElementById('click-area');
    if (clickArea) {
      clickArea.addEventListener('contextmenu', (e) => e.preventDefault());
      clickArea.addEventListener('click', handleClick);
      clickArea.addEventListener('auxclick', handleClick);
      return () => {
        clickArea.removeEventListener('click', handleClick);
        clickArea.removeEventListener('auxclick', handleClick);
      };
    }
  }, [isCounting]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Mouse Click Counter</h1>

      <div className="space-y-6">
        {/* Click Area */}
        <div
          id="click-area"
          className={`w-full h-64 rounded-md flex items-center justify-center text-xl font-semibold cursor-pointer transition-colors ${
            isCounting ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-200'
          }`}
        >
          {isCounting ? 'Click Here!' : 'Press Start to Begin'}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleCounting}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              isCounting 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCounting ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={resetCounter}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Results */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Click Statistics</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>Total Clicks: <span className="font-bold">{clicks.total}</span></p>
            <p>Left Clicks: <span className="font-bold">{clicks.left}</span></p>
            <p>Right Clicks: <span className="font-bold">{clicks.right}</span></p>
            <p>Middle Clicks: <span className="font-bold">{clicks.middle}</span></p>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs text-gray-500 text-center">
          Click within the area when counting is active. Use left, right, or middle mouse buttons.
        </p>
      </div>
    </div>
  );
};

export default MouseClickCounter;