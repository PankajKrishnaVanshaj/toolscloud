"use client";

import React, { useState } from 'react';

const DockerfileGenerator = () => {
  const [baseImage, setBaseImage] = useState('node:18');
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [workDir, setWorkDir] = useState('/app');
  const [copyFiles, setCopyFiles] = useState([{ source: '', dest: '' }]);
  const [installCmd, setInstallCmd] = useState('npm install');
  const [runCmd, setRunCmd] = useState('npm start');
  const [generatedDockerfile, setGeneratedDockerfile] = useState('');
  const [copied, setCopied] = useState(false);

  const baseImages = [
    'node:18', 'node:16', 'python:3.9', 'python:3.8', 'ubuntu:20.04', 
    'alpine:3.16', 'nginx:latest', 'openjdk:11'
  ];

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const updateEnvVar = (index, field, value) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const removeEnvVar = (index) => {
    if (envVars.length > 1) {
      setEnvVars(envVars.filter((_, i) => i !== index));
    }
  };

  const addCopyFile = () => {
    setCopyFiles([...copyFiles, { source: '', dest: '' }]);
  };

  const updateCopyFile = (index, field, value) => {
    const newCopyFiles = [...copyFiles];
    newCopyFiles[index][field] = value;
    setCopyFiles(newCopyFiles);
  };

  const removeCopyFile = (index) => {
    if (copyFiles.length > 1) {
      setCopyFiles(copyFiles.filter((_, i) => i !== index));
    }
  };

  const generateDockerfile = () => {
    let dockerfile = `# Generated Dockerfile\n`;
    
    // Base Image
    dockerfile += `FROM ${baseImage}\n\n`;

    // Environment Variables
    if (envVars.some(v => v.key.trim())) {
      dockerfile += `# Environment Variables\n`;
      envVars.forEach(({ key, value }) => {
        if (key.trim()) {
          dockerfile += `ENV ${key}=${value}\n`;
        }
      });
      dockerfile += '\n';
    }

    // Working Directory
    if (workDir.trim()) {
      dockerfile += `# Set working directory\n`;
      dockerfile += `WORKDIR ${workDir}\n\n`;
    }

    // Copy Files
    if (copyFiles.some(f => f.source.trim())) {
      dockerfile += `# Copy files\n`;
      copyFiles.forEach(({ source, dest }) => {
        if (source.trim()) {
          dockerfile += `COPY ${source} ${dest || '.'}\n`;
        }
      });
      dockerfile += '\n';
    }

    // Install Command
    if (installCmd.trim()) {
      dockerfile += `# Install dependencies\n`;
      dockerfile += `RUN ${installCmd}\n\n`;
    }

    // Run Command
    if (runCmd.trim()) {
      dockerfile += `# Run command\n`;
      dockerfile += `CMD ["${runCmd.split(' ')[0]}", "${runCmd.split(' ').slice(1).join(' ')}"]\n`;
    }

    setGeneratedDockerfile(dockerfile.trim());
    setCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateDockerfile();
  };

  const handleCopy = () => {
    if (generatedDockerfile) {
      navigator.clipboard.writeText(generatedDockerfile);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Dockerfile Generator</h2>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Image
            </label>
            <select
              value={baseImage}
              onChange={(e) => setBaseImage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {baseImages.map(img => (
                <option key={img} value={img}>{img}</option>
              ))}
            </select>
          </div>

          {/* Environment Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment Variables
            </label>
            {envVars.map((env, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={env.key}
                  onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Key (e.g., PORT)"
                />
                <input
                  type="text"
                  value={env.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., 3000)"
                />
                {envVars.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEnvVar(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addEnvVar}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Environment Variable
            </button>
          </div>

          {/* Working Directory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Working Directory
            </label>
            <input
              type="text"
              value={workDir}
              onChange={(e) => setWorkDir(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/app"
            />
          </div>

          {/* Copy Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copy Files
            </label>
            {copyFiles.map((file, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={file.source}
                  onChange={(e) => updateCopyFile(index, 'source', e.target.value)}
                  className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Source (e.g., .)"
                />
                <input
                  type="text"
                  value={file.dest}
                  onChange={(e) => updateCopyFile(index, 'dest', e.target.value)}
                  className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Destination (e.g., .)"
                />
                {copyFiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCopyFile(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCopyFile}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Copy Instruction
            </button>
          </div>

          {/* Install Command */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Install Command
            </label>
            <input
              type="text"
              value={installCmd}
              onChange={(e) => setInstallCmd(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="npm install"
            />
          </div>

          {/* Run Command */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Run Command
            </label>
            <input
              type="text"
              value={runCmd}
              onChange={(e) => setRunCmd(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="npm start"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Dockerfile
          </button>
        </form>

        {/* Generated Dockerfile */}
        {generatedDockerfile && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated Dockerfile</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {generatedDockerfile}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DockerfileGenerator;