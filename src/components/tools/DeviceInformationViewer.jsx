"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCopy, FaDesktop, FaBatteryFull, FaNetworkWired } from "react-icons/fa";

const DeviceInformationViewer = () => {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDeviceInfo = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const info = {
        // Basic Navigator properties
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        languages: navigator.languages?.join(", ") || "Not available",
        cookiesEnabled: navigator.cookieEnabled ? "Yes" : "No",
        onlineStatus: navigator.onLine ? "Online" : "Offline",
        doNotTrack: navigator.doNotTrack || "Not specified",

        // Screen properties
        screenWidth: `${window.screen.width}px`,
        screenHeight: `${window.screen.height}px`,
        availableWidth: `${window.screen.availWidth}px`,
        availableHeight: `${window.screen.availHeight}px`,
        colorDepth: `${window.screen.colorDepth} bits`,
        pixelDepth: `${window.screen.pixelDepth || "N/A"} bits`,

        // Window properties
        windowWidth: `${window.innerWidth}px`,
        windowHeight: `${window.innerHeight}px`,

        // Device capabilities
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Not supported",
        hardwareConcurrency: navigator.hardwareConcurrency
          ? `${navigator.hardwareConcurrency} cores`
          : "Not supported",

        // Connection info
        connection: navigator.connection
          ? {
              effectiveType: navigator.connection.effectiveType,
              downlink: `${navigator.connection.downlink} Mbps`,
              rtt: `${navigator.connection.rtt} ms`,
              type: navigator.connection.type || "Unknown",
            }
          : "Not supported",

        // Geolocation (requires permission)
        geolocation: "Fetching...",
      };

      // Battery info
      if ("getBattery" in navigator) {
        const battery = await navigator.getBattery();
        info.battery = {
          level: `${(battery.level * 100).toFixed(0)}%`,
          charging: battery.charging ? "Yes" : "No",
          chargingTime: battery.chargingTime !== Infinity ? `${battery.chargingTime} sec` : "N/A",
          dischargingTime:
            battery.dischargingTime !== Infinity ? `${battery.dischargingTime} sec` : "N/A",
        };
      } else {
        info.battery = "Not supported";
      }

      // Attempt to get geolocation
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setDeviceInfo((prev) => ({
              ...prev,
              geolocation: {
                latitude: position.coords.latitude.toFixed(6),
                longitude: position.coords.longitude.toFixed(6),
                accuracy: `${position.coords.accuracy} meters`,
              },
            }));
          },
          () => {
            setDeviceInfo((prev) => ({ ...prev, geolocation: "Permission denied or unavailable" }));
          }
        );
      } else {
        info.geolocation = "Not supported";
      }

      setDeviceInfo(info);
      setError("");
    } catch (err) {
      setError("Error fetching device information: " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeviceInfo();
  }, [fetchDeviceInfo]);

  // Copy info to clipboard
  const copyToClipboard = () => {
    const text = JSON.stringify(deviceInfo, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      alert("Device information copied to clipboard!");
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Device Information Viewer
          </h1>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={fetchDeviceInfo}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaSync className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FaCopy className="mr-2" /> Copy
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Section title="Basic Information" icon={<FaDesktop />}>
            <InfoGrid>
              <InfoItem label="User Agent" value={deviceInfo.userAgent} />
              <InfoItem label="Platform" value={deviceInfo.platform} />
              <InfoItem label="Language" value={deviceInfo.language} />
              <InfoItem label="Languages" value={deviceInfo.languages} />
              <InfoItem label="Cookies Enabled" value={deviceInfo.cookiesEnabled} />
              <InfoItem label="Online Status" value={deviceInfo.onlineStatus} />
              <InfoItem label="Do Not Track" value={deviceInfo.doNotTrack} />
            </InfoGrid>
          </Section>

          {/* Screen Info */}
          <Section title="Screen Information" icon={<FaDesktop />}>
            <InfoGrid>
              <InfoItem label="Screen Width" value={deviceInfo.screenWidth} />
              <InfoItem label="Screen Height" value={deviceInfo.screenHeight} />
              <InfoItem label="Available Width" value={deviceInfo.availableWidth} />
              <InfoItem label="Available Height" value={deviceInfo.availableHeight} />
              <InfoItem label="Color Depth" value={deviceInfo.colorDepth} />
              <InfoItem label="Pixel Depth" value={deviceInfo.pixelDepth} />
              <InfoItem label="Window Width" value={deviceInfo.windowWidth} />
              <InfoItem label="Window Height" value={deviceInfo.windowHeight} />
            </InfoGrid>
          </Section>

          {/* Hardware Info */}
          <Section title="Hardware Information" icon={<FaDesktop />}>
            <InfoGrid>
              <InfoItem label="Device Memory" value={deviceInfo.deviceMemory} />
              <InfoItem label="CPU Cores" value={deviceInfo.hardwareConcurrency} />
            </InfoGrid>
          </Section>

          {/* Connection Info */}
          {deviceInfo.connection !== "Not supported" && (
            <Section title="Connection Information" icon={<FaNetworkWired />}>
              <InfoGrid>
                <InfoItem label="Effective Type" value={deviceInfo.connection?.effectiveType} />
                <InfoItem label="Downlink" value={deviceInfo.connection?.downlink} />
                <InfoItem label="Round-Trip Time" value={deviceInfo.connection?.rtt} />
                <InfoItem label="Connection Type" value={deviceInfo.connection?.type} />
              </InfoGrid>
            </Section>
          )}

          {/* Battery Info */}
          {deviceInfo.battery !== "Not supported" && (
            <Section title="Battery Information" icon={<FaBatteryFull />}>
              <InfoGrid>
                <InfoItem label="Level" value={deviceInfo.battery?.level} />
                <InfoItem label="Charging" value={deviceInfo.battery?.charging} />
                <InfoItem label="Charging Time" value={deviceInfo.battery?.chargingTime} />
                <InfoItem label="Discharging Time" value={deviceInfo.battery?.dischargingTime} />
              </InfoGrid>
            </Section>
          )}

          {/* Geolocation Info */}
          <Section title="Geolocation" icon={<FaDesktop />}>
            <InfoGrid>
              {typeof deviceInfo.geolocation === "object" ? (
                <>
                  <InfoItem label="Latitude" value={deviceInfo.geolocation?.latitude} />
                  <InfoItem label="Longitude" value={deviceInfo.geolocation?.longitude} />
                  <InfoItem label="Accuracy" value={deviceInfo.geolocation?.accuracy} />
                </>
              ) : (
                <InfoItem label="Status" value={deviceInfo.geolocation} />
              )}
            </InfoGrid>
          </Section>
        </div>

        {error && <p className="text-sm text-red-600 text-center mt-6">{error}</p>}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Detailed device, screen, and hardware information</li>
            <li>Connection and battery status (where supported)</li>
            <li>Geolocation data (requires permission)</li>
            <li>Refresh and copy to clipboard functionality</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Some information may not be available depending on your browser, device, or permissions.
        </p>
      </div>
    </div>
  );
};

// Reusable Section component
const Section = ({ title, icon, children }) => (
  <section>
    <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
      {icon && <span className="mr-2 text-blue-600">{icon}</span>}
      {title}
    </h2>
    {children}
  </section>
);

// Reusable InfoGrid component
const InfoGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
    {children}
  </div>
);

// Reusable InfoItem component
const InfoItem = ({ label, value }) => (
  <div>
    <span className="font-medium text-gray-700">{label}:</span>{" "}
    <span className="text-gray-600 break-words">{value || "Loading..."}</span>
  </div>
);

export default DeviceInformationViewer;