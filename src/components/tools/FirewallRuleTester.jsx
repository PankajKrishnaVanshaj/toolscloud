"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaPlay, FaSync, FaDownload } from "react-icons/fa";

const FirewallRuleTester = () => {
  const [rules, setRules] = useState([
    { id: 1, sourceIP: "", destIP: "", port: "", protocol: "TCP", action: "Allow" },
  ]);
  const [testPacket, setTestPacket] = useState({ sourceIP: "", destIP: "", port: "", protocol: "TCP" });
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [ruleOrder, setRuleOrder] = useState("top-down"); // New feature: rule evaluation order
  const [defaultAction, setDefaultAction] = useState("Deny"); // New feature: customizable default action

  // IP address regex (IPv4 validation)
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // Add new rule
  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { id: prev.length + 1, sourceIP: "", destIP: "", port: "", protocol: "TCP", action: "Allow" },
    ]);
  };

  // Update rule
  const updateRule = (id, field, value) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule))
    );
  };

  // Remove rule
  const removeRule = (id) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  // Test packet against rules
  const testRules = useCallback(() => {
    setError("");
    setResults(null);

    // Validate rules
    for (const rule of rules) {
      if (rule.sourceIP && !ipRegex.test(rule.sourceIP)) {
        setError(`Invalid source IP in rule ${rule.id}: ${rule.sourceIP}`);
        return;
      }
      if (rule.destIP && !ipRegex.test(rule.destIP)) {
        setError(`Invalid destination IP in rule ${rule.id}: ${rule.destIP}`);
        return;
      }
      if (rule.port && (isNaN(rule.port) || rule.port < 0 || rule.port > 65535)) {
        setError(`Invalid port in rule ${rule.id}: ${rule.port}`);
        return;
      }
    }

    // Validate test packet
    if (!testPacket.sourceIP || !ipRegex.test(testPacket.sourceIP)) {
      setError("Please enter a valid source IP for the test packet");
      return;
    }
    if (!testPacket.destIP || !ipRegex.test(testPacket.destIP)) {
      setError("Please enter a valid destination IP for the test packet");
      return;
    }
    if (!testPacket.port || isNaN(testPacket.port) || testPacket.port < 0 || testPacket.port > 65535) {
      setError("Please enter a valid port (0-65535) for the test packet");
      return;
    }

    // Evaluate rules based on order
    let matchedRule = null;
    const evaluationRules = ruleOrder === "top-down" ? rules : [...rules].reverse();

    for (const rule of evaluationRules) {
      const sourceMatch = !rule.sourceIP || rule.sourceIP === testPacket.sourceIP;
      const destMatch = !rule.destIP || rule.destIP === testPacket.destIP;
      const portMatch = !rule.port || parseInt(rule.port) === parseInt(testPacket.port);
      const protocolMatch = rule.protocol === testPacket.protocol;

      if (sourceMatch && destMatch && portMatch && protocolMatch) {
        matchedRule = rule;
        break;
      }
    }

    setResults({
      packet: { ...testPacket },
      matchedRule: matchedRule ? { ...matchedRule } : null,
      action: matchedRule ? matchedRule.action : defaultAction,
    });
  }, [rules, testPacket, ruleOrder, defaultAction]);

  // Download rules as JSON
  const downloadRules = () => {
    const data = JSON.stringify({ rules, testPacket, results }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `firewall-rules-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear all
  const clearAll = () => {
    setRules([{ id: 1, sourceIP: "", destIP: "", port: "", protocol: "TCP", action: "Allow" }]);
    setTestPacket({ sourceIP: "", destIP: "", port: "", protocol: "TCP" });
    setResults(null);
    setError("");
    setRuleOrder("top-down");
    setDefaultAction("Deny");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Firewall Rule Tester Simulator
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); testRules(); }} className="space-y-8">
          {/* Rules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Firewall Rules</h2>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px_100px_100px_80px] gap-2 items-center bg-gray-50 p-2 rounded-lg"
                >
                  <input
                    type="text"
                    value={rule.sourceIP}
                    onChange={(e) => updateRule(rule.id, "sourceIP", e.target.value)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Source IP (e.g., 192.168.1.1)"
                  />
                  <input
                    type="text"
                    value={rule.destIP}
                    onChange={(e) => updateRule(rule.id, "destIP", e.target.value)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Dest IP (e.g., 10.0.0.1)"
                  />
                  <input
                    type="number"
                    value={rule.port}
                    onChange={(e) => updateRule(rule.id, "port", e.target.value)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Port"
                    min={0}
                    max={65535}
                  />
                  <select
                    value={rule.protocol}
                    onChange={(e) => updateRule(rule.id, "protocol", e.target.value)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                  </select>
                  <select
                    value={rule.action}
                    onChange={(e) => updateRule(rule.id, "action", e.target.value)}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Allow">Allow</option>
                    <option value="Deny">Deny</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={rules.length === 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRule}
              className="mt-4 flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FaPlus className="mr-2" /> Add Rule
            </button>
          </div>

          {/* Test Packet and Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Test Packet</h2>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px_100px] gap-2 bg-gray-50 p-4 rounded-lg">
                <input
                  type="text"
                  value={testPacket.sourceIP}
                  onChange={(e) => setTestPacket({ ...testPacket, sourceIP: e.target.value })}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Source IP (e.g., 192.168.1.100)"
                />
                <input
                  type="text"
                  value={testPacket.destIP}
                  onChange={(e) => setTestPacket({ ...testPacket, destIP: e.target.value })}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Dest IP (e.g., 10.0.0.100)"
                />
                <input
                  type="number"
                  value={testPacket.port}
                  onChange={(e) => setTestPacket({ ...testPacket, port: e.target.value })}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Port"
                  min={0}
                  max={65535}
                />
                <select
                  value={testPacket.protocol}
                  onChange={(e) => setTestPacket({ ...testPacket, protocol: e.target.value })}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Settings</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Evaluation Order
                  </label>
                  <select
                    value={ruleOrder}
                    onChange={(e) => setRuleOrder(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="top-down">Top-Down</option>
                    <option value="bottom-up">Bottom-Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Action
                  </label>
                  <select
                    value={defaultAction}
                    onChange={(e) => setDefaultAction(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Deny">Deny</option>
                    <option value="Allow">Allow</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaPlay className="mr-2" /> Test Rules
            </button>
            <button
              type="button"
              onClick={downloadRules}
              disabled={!rules.length && !results}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Rules
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Test Results */}
        {results && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold text-green-700 mb-2">Test Results</h2>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Test Packet:</strong> {results.packet.sourceIP} → {results.packet.destIP}:
                {results.packet.port} ({results.packet.protocol})
              </p>
              {results.matchedRule ? (
                <>
                  <p className="text-sm">
                    <strong>Matched Rule:</strong> Rule {results.matchedRule.id} -{" "}
                    {results.matchedRule.sourceIP || "Any"} → {results.matchedRule.destIP || "Any"}:
                    {results.matchedRule.port || "Any"} ({results.matchedRule.protocol})
                  </p>
                  <p
                    className={`text-sm ${results.action === "Allow" ? "text-green-600" : "text-red-600"}`}
                  >
                    <strong>Action:</strong> {results.action}
                  </p>
                </>
              ) : (
                <p
                  className={`text-sm ${results.action === "Allow" ? "text-green-600" : "text-red-600"}`}
                >
                  <strong>Action:</strong> {results.action} (no matching rule, default action)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Dynamic rule creation and testing</li>
            <li>Support for TCP, UDP, and ICMP protocols</li>
            <li>Customizable rule evaluation order (top-down or bottom-up)</li>
            <li>Configurable default action (Allow/Deny)</li>
            <li>Download rules and results as JSON</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default FirewallRuleTester;