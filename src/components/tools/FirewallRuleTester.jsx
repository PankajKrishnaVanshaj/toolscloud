// components/FirewallRuleTester.js
'use client';

import React, { useState } from 'react';

const FirewallRuleTester = () => {
  const [rules, setRules] = useState([{ id: 1, sourceIP: '', destIP: '', port: '', protocol: 'TCP', action: 'Allow' }]);
  const [testPacket, setTestPacket] = useState({ sourceIP: '', destIP: '', port: '', protocol: 'TCP' });
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // IP address regex (basic IPv4 validation)
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // Add new rule
  const addRule = () => {
    setRules([...rules, { id: rules.length + 1, sourceIP: '', destIP: '', port: '', protocol: 'TCP', action: 'Allow' }]);
  };

  // Update rule
  const updateRule = (id, field, value) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, [field]: value } : rule));
  };

  // Remove rule
  const removeRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  // Test packet against rules
  const testRules = () => {
    setError('');
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
      setError('Please enter a valid source IP for the test packet');
      return;
    }
    if (!testPacket.destIP || !ipRegex.test(testPacket.destIP)) {
      setError('Please enter a valid destination IP for the test packet');
      return;
    }
    if (!testPacket.port || isNaN(testPacket.port) || testPacket.port < 0 || testPacket.port > 65535) {
      setError('Please enter a valid port (0-65535) for the test packet');
      return;
    }

    // Simulate rule evaluation (top-down, first match wins)
    let matchedRule = null;
    for (const rule of rules) {
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
      action: matchedRule ? matchedRule.action : 'Deny (default)'
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    testRules();
  };

  // Clear all
  const clearAll = () => {
    setRules([{ id: 1, sourceIP: '', destIP: '', port: '', protocol: 'TCP', action: 'Allow' }]);
    setTestPacket({ sourceIP: '', destIP: '', port: '', protocol: 'TCP' });
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-6">Firewall Rule Tester Simulator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rules */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Firewall Rules</h2>
            {rules.map((rule) => (
              <div key={rule.id} className="flex flex-col sm:flex-row gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={rule.sourceIP}
                  onChange={(e) => updateRule(rule.id, 'sourceIP', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring focus:ring-blue-200"
                  placeholder="Source IP (e.g., 192.168.1.1)"
                />
                <input
                  type="text"
                  value={rule.destIP}
                  onChange={(e) => updateRule(rule.id, 'destIP', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring focus:ring-blue-200"
                  placeholder="Dest IP (e.g., 10.0.0.1)"
                />
                <input
                  type="number"
                  value={rule.port}
                  onChange={(e) => updateRule(rule.id, 'port', e.target.value)}
                  className="w-20 p-2 border rounded focus:ring focus:ring-blue-200"
                  placeholder="Port"
                  min={0}
                  max={65535}
                />
                <select
                  value={rule.protocol}
                  onChange={(e) => updateRule(rule.id, 'protocol', e.target.value)}
                  className="w-24 p-2 border rounded focus:ring focus:ring-blue-200"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
                <select
                  value={rule.action}
                  onChange={(e) => updateRule(rule.id, 'action', e.target.value)}
                  className="w-24 p-2 border rounded focus:ring focus:ring-blue-200"
                >
                  <option value="Allow">Allow</option>
                  <option value="Deny">Deny</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={rules.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRule}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Rule
            </button>
          </div>

          {/* Test Packet */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Test Packet</h2>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                value={testPacket.sourceIP}
                onChange={(e) => setTestPacket({ ...testPacket, sourceIP: e.target.value })}
                className="flex-1 p-2 border rounded focus:ring focus:ring-blue-200"
                placeholder="Source IP (e.g., 192.168.1.100)"
              />
              <input
                type="text"
                value={testPacket.destIP}
                onChange={(e) => setTestPacket({ ...testPacket, destIP: e.target.value })}
                className="flex-1 p-2 border rounded focus:ring focus:ring-blue-200"
                placeholder="Dest IP (e.g., 10.0.0.100)"
              />
              <input
                type="number"
                value={testPacket.port}
                onChange={(e) => setTestPacket({ ...testPacket, port: e.target.value })}
                className="w-20 p-2 border rounded focus:ring focus:ring-blue-200"
                placeholder="Port"
                min={0}
                max={65535}
              />
              <select
                value={testPacket.protocol}
                onChange={(e) => setTestPacket({ ...testPacket, protocol: e.target.value })}
                className="w-24 p-2 border rounded focus:ring focus:ring-blue-200"
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Rules
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">{error}</div>
        )}

        {/* Test Results */}
        {results && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Test Results</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className="text-sm">
                <strong>Test Packet:</strong> {results.packet.sourceIP} → {results.packet.destIP}:{results.packet.port} ({results.packet.protocol})
              </p>
              {results.matchedRule ? (
                <>
                  <p className="text-sm">
                    <strong>Matched Rule:</strong> Rule {results.matchedRule.id} - 
                    {results.matchedRule.sourceIP || 'Any'} → {results.matchedRule.destIP || 'Any'}:
                    {results.matchedRule.port || 'Any'} ({results.matchedRule.protocol})
                  </p>
                  <p className={`text-sm ${results.action === 'Allow' ? 'text-green-600' : 'text-red-600'}`}>
                    <strong>Action:</strong> {results.action}
                  </p>
                </>
              ) : (
                <p className="text-sm text-red-600">
                  <strong>Action:</strong> Deny (no matching rule, default deny)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> This is a simulation. Rules are evaluated top-down, first match applies. Default action is Deny if no rules match. Real firewalls may include additional criteria (e.g., state, direction).
        </p>
      </div>
    </div>
  );
};

export default FirewallRuleTester;