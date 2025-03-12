"use client";
import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaPlus, FaTrash, FaSync } from 'react-icons/fa';

const DockerfileGenerator = () => {
  const [baseImage, setBaseImage] = useState('node:18');
  const [exposePort, setExposePort] = useState('');
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [workDir, setWorkDir] = useState('/app');
  const [copyFiles, setCopyFiles] = useState([{ source: '', dest: '' }]);
  const [installCmds, setInstallCmds] = useState(['']);
  const [runCmd, setRunCmd] = useState('npm start');
  const [maintainer, setMaintainer] = useState('');
  const [generatedDockerfile, setGeneratedDockerfile] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const baseImages = [
    'node:18', 'node:16', 'python:3.9', 'python:3.8', 'ubuntu:20.04',
    'alpine:3.16', 'nginx:latest', 'openjdk:11', 'ruby:3.1', 'golang:1.19'
  ];

  // Environment Variables
  const addEnvVar = () => setEnvVars([...envVars, { key: '', value: '' }]);
  const updateEnvVar = (index, field, value) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };
  const removeEnvVar = (index) => envVars.length > 1 && setEnvVars(envVars.filter((_, i) => i !== index));

  // Copy Instructions
  const addCopyFile = () => setCopyFiles([...copyFiles, { source: '', dest: '' }]);
  const updateCopyFile = (index, field, value) => {
    const newCopyFiles = [...copyFiles];
    newCopyFiles[index][field] = value;
    setCopyFiles(newCopyFiles);
  };
  const removeCopyFile = (index) => copyFiles.length > 1 && setCopyFiles(copyFiles.filter((_, i) => i !== index));

  // Install Commands
  const addInstallCmd = () => setInstallCmds([...installCmds, '']);
  const updateInstallCmd = (index, value) => {
    const newInstallCmds = [...installCmds];
    newInstallCmds[index] = value;
    setInstallCmds(newInstallCmds);
  };
  const removeInstallCmd = (index) => installCmds.length > 1 && setInstallCmds(installCmds.filter((_, i) => i !== index));

  const generateDockerfile = useCallback(() => {
    let dockerfile = `# Generated Dockerfile on ${new Date().toLocaleString()}\n`;

    // Maintainer
    if (maintainer.trim()) dockerfile += `MAINTAINER ${maintainer}\n\n`;

    // Base Image
    dockerfile += `FROM ${baseImage}\n\n`;

    // Expose Port
    if (exposePort.trim()) dockerfile += `EXPOSE ${exposePort}\n\n`;

    // Environment Variables
    const validEnvVars = envVars.filter(v => v.key.trim());
    if (validEnvVars.length) {
      dockerfile += `# Environment Variables\n`;
      validEnvVars.forEach(({ key, value }) => dockerfile += `ENV ${key}=${value}\n`);
      dockerfile += '\n';
    }

    // Working Directory
    if (workDir.trim()) {
      dockerfile += `# Set working directory\n`;
      dockerfile += `WORKDIR ${workDir}\n\n`;
    }

    // Copy Files
    const validCopyFiles = copyFiles.filter(f => f.source.trim());
    if (validCopyFiles.length) {
      dockerfile += `# Copy files\n`;
      validCopyFiles.forEach(({ source, dest }) => dockerfile += `COPY ${source} ${dest || '.'}\n`);
      dockerfile += '\n';
    }

    // Install Commands
    const validInstallCmds = installCmds.filter(cmd => cmd.trim());
    if (validInstallCmds.length) {
      dockerfile += `# Install dependencies\n`;
      validInstallCmds.forEach(cmd => dockerfile += `RUN ${cmd}\n`);
      dockerfile += '\n';
    }

    // Run Command
    if (runCmd.trim()) {
      const [cmd, ...args] = runCmd.split(' ');
      dockerfile += `# Run command\n`;
      dockerfile += `CMD ["${cmd}", "${args.join(' ')}"]\n`;
    }

    const finalDockerfile = dockerfile.trim();
    setGeneratedDockerfile(finalDockerfile);
    setHistory(prev => [finalDockerfile, ...prev].slice(0, 5));
    setCopied(false);
  }, [baseImage, exposePort, envVars, workDir, copyFiles, installCmds, runCmd, maintainer]);

  const handleCopy = () => {
    if (generatedDockerfile) {
      navigator.clipboard.writeText(generatedDockerfile);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedDockerfile) {
      const blob = new Blob([generatedDockerfile], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dockerfile-${Date.now()}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setBaseImage('node:18');
    setExposePort('');
    setEnvVars([{ key: '', value: '' }]);
    setWorkDir('/app');
    setCopyFiles([{ source: '', dest: '' }]);
    setInstallCmds(['']);
    setRunCmd('npm start');
    setMaintainer('');
    setGeneratedDockerfile('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Dockerfile Generator</h2>

        <form onSubmit={(e) => { e.preventDefault(); generateDockerfile(); }} className="space-y-6">
          {/* Base Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Image</label>
            <select
              value={baseImage}
              onChange={(e) => setBaseImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {baseImages.map(img => <option key={img} value={img}>{img}</option>)}
            </select>
          </div>

          {/* Maintainer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maintainer</label>
            <input
              type="text"
              value={maintainer}
              onChange={(e) => setMaintainer(e.target.value)}
              placeholder="e.g., John Doe <john@example.com>"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Expose Port */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expose Port</label>
            <input
              type="number"
              value={exposePort}
              onChange={(e) => setExposePort(e.target.value)}
              placeholder="e.g., 3000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Environment Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Environment Variables</label>
            {envVars.map((env, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={env.key}
                  onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                  placeholder="Key (e.g., PORT)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={env.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  placeholder="Value (e.g., 3000)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {envVars.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEnvVar(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addEnvVar} className="text-sm text-blue-600 hover:underline flex items-center">
              <FaPlus className="mr-1" /> Add Environment Variable
            </button>
          </div>

          {/* Working Directory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Directory</label>
            <input
              type="text"
              value={workDir}
              onChange={(e) => setWorkDir(e.target.value)}
              placeholder="/app"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Copy Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Copy Files</label>
            {copyFiles.map((file, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={file.source}
                  onChange={(e) => updateCopyFile(index, 'source', e.target.value)}
                  placeholder="Source (e.g., .)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={file.dest}
                  onChange={(e) => updateCopyFile(index, 'dest', e.target.value)}
                  placeholder="Destination (e.g., .)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {copyFiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCopyFile(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addCopyFile} className="text-sm text-blue-600 hover:underline flex items-center">
              <FaPlus className="mr-1" /> Add Copy Instruction
            </button>
          </div>

          {/* Install Commands */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Install Commands</label>
            {installCmds.map((cmd, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={cmd}
                  onChange={(e) => updateInstallCmd(index, e.target.value)}
                  placeholder="e.g., npm install"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {installCmds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstallCmd(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addInstallCmd} className="text-sm text-blue-600 hover:underline flex items-center">
              <FaPlus className="mr-1" /> Add Install Command
            </button>
          </div>

          {/* Run Command */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Run Command</label>
            <input
              type="text"
              value={runCmd}
              onChange={(e) => setRunCmd(e.target.value)}
              placeholder="e.g., npm start"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate Dockerfile
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Generated Dockerfile */}
        {generatedDockerfile && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Generated Dockerfile</h3>
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
              {generatedDockerfile}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">History (Last 5)</h3>
            <ul className="space-y-2">
              {history.map((entry, index) => (
                <li key={index} className="text-sm text-gray-600 truncate">
                  {entry.split('\n')[0]}...
                  <button
                    onClick={() => setGeneratedDockerfile(entry)}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple base image options</li>
            <li>Customizable environment variables</li>
            <li>Multiple COPY instructions</li>
            <li>Multiple RUN commands for installation</li>
            <li>EXPOSE port configuration</li>
            <li>Maintainer information</li>
            <li>Copy and download functionality</li>
            <li>History tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DockerfileGenerator;