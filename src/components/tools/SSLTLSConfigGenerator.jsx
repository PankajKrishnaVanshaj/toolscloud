"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaLock, FaInfoCircle } from 'react-icons/fa';

const SSLTLSConfigGenerator = () => {
  const [config, setConfig] = useState({
    serverType: 'nginx',
    tlsVersion: '1.2+',
    cipherSuite: 'modern',
    hsts: true,
    ocspStapling: false,
    sslSessionCache: true,
    customCiphers: '',
    dhparamSize: '2048',
  });
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [copied, setCopied] = useState(false);

  const serverTypes = ['nginx', 'apache', 'iis'];
  const tlsVersions = ['1.2+', '1.3 only'];
  const cipherSuites = ['modern', 'intermediate', 'old', 'custom'];
  const dhparamSizes = ['2048', '3072', '4096'];

  const generateConfig = useCallback(() => {
    let configOutput = '';
    
    // Cipher suites
    const modernCiphers = 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305';
    const intermediateCiphers = `${modernCiphers}:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256`;
    const oldCiphers = `${intermediateCiphers}:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384`;
    const ciphers = config.cipherSuite === 'custom' && config.customCiphers 
      ? config.customCiphers 
      : {
          modern: modernCiphers,
          intermediate: intermediateCiphers,
          old: oldCiphers
        }[config.cipherSuite];

    switch (config.serverType) {
      case 'nginx':
        configOutput = `# SSL/TLS Configuration for Nginx
ssl_protocols ${config.tlsVersion === '1.2+' ? 'TLSv1.2 TLSv1.3' : 'TLSv1.3'};
ssl_prefer_server_ciphers on;
ssl_ciphers "${ciphers}";
ssl_dhparam /etc/ssl/certs/dhparam-${config.dhparamSize}.pem;
ssl_session_timeout 1d;
ssl_session_tickets off;
${config.sslSessionCache ? 'ssl_session_cache shared:SSL:10m;' : ''}`;
        if (config.hsts) configOutput += '\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;';
        if (config.ocspStapling) configOutput += '\nssl_stapling on;\nssl_stapling_verify on;';
        break;

      case 'apache':
        configOutput = `# SSL/TLS Configuration for Apache
SSLProtocol ${config.tlsVersion === '1.2+' ? 'all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1' : 'TLSv1.3'}
SSLCipherSuite ${ciphers}
SSLHonorCipherOrder on
SSLOpenSSLConfCmd DHParameters "/etc/ssl/certs/dhparam-${config.dhparamSize}.pem"
SSLSessionCacheTimeout 86400
${config.sslSessionCache ? 'SSLSessionCache "shmcb:/var/cache/mod_ssl/scache(512000)"' : ''}`;
        if (config.hsts) configOutput += '\nHeader always set Strict-Transport-Security "max-age=31536000; includeSubDomains"';
        if (config.ocspStapling) configOutput += '\nSSLUseStapling on\nSSLStaplingCache "shmcb:/var/run/ocsp(128000)"';
        break;

      case 'iis':
        configOutput = `// SSL/TLS Configuration for IIS (PowerShell)
Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/security/access" -name "sslFlags" -value "Ssl"
Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\Protocols\\${config.tlsVersion === '1.2+' ? 'TLS 1.2' : 'TLS 1.3'}" -Name "Enabled" -Value 1
Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\Ciphers" -Name "${ciphers.split(':')[0]}" -Value 1`;
        if (config.hsts) configOutput += '\nSet-WebConfigurationProperty -pspath "MACHINE/WEBROOT/APPHOST" -filter "system.webServer/httpProtocol/customHeaders" -name "." -value @{name="Strict-Transport-Security";value="max-age=31536000; includeSubDomains"}';
        break;
    }

    setGeneratedConfig(configOutput.trim() + '\n');
    setCopied(false);
  }, [config]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.serverType}-ssl-config-${Date.now()}.${config.serverType === 'iis' ? 'ps1' : 'conf'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaLock className="mr-2" /> SSL/TLS Config Generator
        </h2>

        {/* Configuration Form */}
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); generateConfig(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Server Type</label>
              <select
                value={config.serverType}
                onChange={(e) => updateConfig('serverType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {serverTypes.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TLS Version</label>
              <select
                value={config.tlsVersion}
                onChange={(e) => updateConfig('tlsVersion', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {tlsVersions.map(ver => (
                  <option key={ver} value={ver}>{ver}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cipher Suite</label>
              <select
                value={config.cipherSuite}
                onChange={(e) => updateConfig('cipherSuite', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {cipherSuites.map(suite => (
                  <option key={suite} value={suite}>{suite.charAt(0).toUpperCase() + suite.slice(1)}</option>
                ))}
              </select>
            </div>
            {config.cipherSuite === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Ciphers</label>
                <input
                  type="text"
                  value={config.customCiphers}
                  onChange={(e) => updateConfig('customCiphers', e.target.value)}
                  placeholder="e.g., ECDHE-RSA-AES256-GCM-SHA384:..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DH Parameter Size</label>
              <select
                value={config.dhparamSize}
                onChange={(e) => updateConfig('dhparamSize', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {dhparamSizes.map(size => (
                  <option key={size} value={size}>{size} bits</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.hsts}
                onChange={(e) => updateConfig('hsts', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Enable HSTS</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.ocspStapling}
                onChange={(e) => updateConfig('ocspStapling', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">OCSP Stapling</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.sslSessionCache}
                onChange={(e) => updateConfig('sslSessionCache', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">SSL Session Cache</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Config
          </button>
        </form>

        {/* Generated Config */}
        {generatedConfig && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Generated {config.serverType.toUpperCase()} Configuration
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                    copied ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap border border-gray-200 max-h-96 overflow-auto">
              {generatedConfig}
            </pre>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 flex items-center mb-2">
            <FaInfoCircle className="mr-2" /> Configuration Notes
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Modern: High security, modern clients only</li>
            <li>Intermediate: Balanced security and compatibility</li>
            <li>Old: Maximum compatibility, less secure</li>
            <li>DH parameters enhance forward secrecy (requires generation)</li>
            <li>OCSP Stapling improves performance and security</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SSLTLSConfigGenerator;