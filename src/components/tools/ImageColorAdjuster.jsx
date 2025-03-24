"use client";

import React, { useState, useRef, useCallback } from "react";
import { FaUpload, FaDownload, FaSync, FaUndo, FaRedo } from "react-icons/fa";

const ImageColorAdjuster = () => {
  const [image, setImage] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const applyFilters = useCallback(() => {
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px) hue-rotate(${hue}deg) sepia(${sepia}%) invert(${invert}%)`;
  }, [brightness, contrast, saturation, grayscale, blur, hue, sepia, invert]);

  const saveToHistory = useCallback(() => {
    const currentState = { brightness, contrast, saturation, grayscale, blur, hue, sepia, invert };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex(prev => prev + 1);
  }, [brightness, contrast, saturation, grayscale, blur, hue, sepia, invert, historyIndex]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      handleReset(); // Reset filters when new image is loaded
    }
  };

  const handleAdjustChange = (setter) => (e) => {
    saveToHistory();
    setter(e.target.value);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setBlur(0);
    setHue(0);
    setSepia(0);
    setInvert(0);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setBrightness(prevState.brightness);
      setContrast(prevState.contrast);
      setSaturation(prevState.saturation);
      setGrayscale(prevState.grayscale);
      setBlur(prevState.blur);
      setHue(prevState.hue);
      setSepia(prevState.sepia);
      setInvert(prevState.invert);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setBrightness(nextState.brightness);
      setContrast(nextState.contrast);
      setSaturation(nextState.saturation);
      setGrayscale(nextState.grayscale);
      setBlur(nextState.blur);
      setHue(nextState.hue);
      setSepia(nextState.sepia);
      setInvert(nextState.invert);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = applyFilters();
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `adjusted-image-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Color Adjuster</h1>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {image && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="flex justify-center">
              <img
                src={image}
                alt="Selected"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                style={{ filter: applyFilters() }}
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {/* Adjustment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Brightness", value: brightness, setter: setBrightness, min: 0, max: 200 },
                { label: "Contrast", value: contrast, setter: setContrast, min: 0, max: 200 },
                { label: "Saturation", value: saturation, setter: setSaturation, min: 0, max: 200 },
                { label: "Grayscale", value: grayscale, setter: setGrayscale, min: 0, max: 100 },
                { label: "Blur", value: blur, setter: setBlur, min: 0, max: 10, step: 0.1 },
                { label: "Hue Rotate", value: hue, setter: setHue, min: -180, max: 180 },
                { label: "Sepia", value: sepia, setter: setSepia, min: 0, max: 100 },
                { label: "Invert", value: invert, setter: setInvert, min: 0, max: 100 },
              ].map(({ label, value, setter, min, max, step = 1 }) => (
                <label key={label} className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    {label} ({value}{label.includes("Blur") ? "px" : label.includes("Hue") ? "°" : "%"})
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleAdjustChange(setter)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </label>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUndo className="mr-2" /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaRedo className="mr-2" /> Redo
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Adjustment History</h3>
                <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {history.slice().reverse().map((state, index) => (
                    <li key={index} className={index === history.length - 1 - historyIndex ? 'font-bold' : ''}>
                      {`Brightness: ${state.brightness}%, Contrast: ${state.contrast}%, Saturation: ${state.saturation}%, Grayscale: ${state.grayscale}%, Blur: ${state.blur}px, Hue: ${state.hue}°, Sepia: ${state.sepia}%, Invert: ${state.invert}%`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start adjusting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjust brightness, contrast, saturation, and more</li>
            <li>Additional filters: hue, sepia, invert</li>
            <li>Undo/redo functionality with history</li>
            <li>Real-time image preview</li>
            <li>Download adjusted image as PNG</li>
            <li>Responsive design with intuitive controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageColorAdjuster;