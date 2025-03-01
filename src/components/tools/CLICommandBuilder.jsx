"use client";

import React, { useState } from 'react';

const CLICommandBuilder = () => {
  const [tool, setTool] = useState('git');
  const [command, setCommand] = useState('');
  const [options, setOptions] = useState({});
  const [generatedCommand, setGeneratedCommand] = useState('');
  const [copied, setCopied] = useState(false);

  const tools = {
    git: {
      commands: {
        'clone': {
          description: 'Clone a repository',
          options: {
            'repo': { type: 'text', label: 'Repository URL', required: true },
            '--depth': { type: 'number', label: 'Clone depth', default: '' },
            '--branch': { type: 'text', label: 'Branch name', default: '' }
          }
        },
        'commit': {
          description: 'Record changes to the repository',
          options: {
            '-m': { type: 'text', label: 'Commit message', required: true },
            '--amend': { type: 'checkbox', label: 'Amend previous commit', default: false }
          }
        }
      }
    },
    npm: {
      commands: {
        'install': {
          description: 'Install dependencies',
          options: {
            'package': { type: 'text', label: 'Package name', default: '' },
            '--save': { type: 'checkbox', label: 'Save to dependencies', default: false },
            '--save-dev': { type: 'checkbox', label: 'Save to devDependencies', default: false }
          }
        },
        'run': {
          description: 'Run a script',
          options: {
            'script': { type: 'text', label: 'Script name', required: true }
          }
        }
      }
    },
    docker: {
      commands: {
        'run': {
          description: 'Run a container',
          options: {
            'image': { type: 'text', label: 'Image name', required: true },
            '-d': { type: 'checkbox', label: 'Run in detached mode', default: false },
            '-p': { type: 'text', label: 'Port mapping (host:container)', default: '' }
          }
        }
      }
    }
  };

  const handleOptionChange = (optionKey, value) => {
    setOptions(prev => ({ ...prev, [optionKey]: value }));
  };

  const generateCommand = () => {
    if (!command) return;

    const toolConfig = tools[tool];
    const cmdConfig = toolConfig.commands[command];
    let cmd = `${tool} ${command}`;

    Object.entries(cmdConfig.options).forEach(([optKey, optConfig]) => {
      const value = options[optKey] || optConfig.default;
      
      if (optConfig.type === 'checkbox' && value) {
        cmd += ` ${optKey}`;
      } else if (optConfig.type === 'text' || optConfig.type === 'number') {
        if (value && (optConfig.required || value !== optConfig.default)) {
          cmd += optKey.startsWith('-') ? ` ${optKey} "${value}"` : ` "${value}"`;
        }
      }
    });

    setGeneratedCommand(cmd.trim());
    setCopied(false);
  };

  const handleCopy = () => {
    if (generatedCommand) {
      navigator.clipboard.writeText(generatedCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetOptions = () => {
    const defaultOptions = {};
    if (command && tools[tool].commands[command]) {
      Object.entries(tools[tool].commands[command].options).forEach(([key, opt]) => {
        defaultOptions[key] = opt.default !== undefined ? opt.default : '';
      });
    }
    setOptions(defaultOptions);
  };

  const handleCommandChange = (newCommand) => {
    setCommand(newCommand);
    resetOptions();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">CLI Command Builder</h2>

        {/* Tool and Command Selection */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tool
              </label>
              <select
                value={tool}
                onChange={(e) => {
                  setTool(e.target.value);
                  setCommand('');
                  resetOptions();
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(tools).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Command
              </label>
              <select
                value={command}
                onChange={(e) => handleCommandChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a command</option>
                {Object.entries(tools[tool].commands).map(([cmd, config]) => (
                  <option key={cmd} value={cmd}>{cmd} - {config.description}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Command Options */}
          {command && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Options</h3>
              <div className="space-y-3">
                {Object.entries(tools[tool].commands[command].options).map(([optKey, optConfig]) => (
                  <div key={optKey} className="flex items-center gap-3">
                    {optConfig.type === 'checkbox' ? (
                      <>
                        <input
                          type="checkbox"
                          checked={options[optKey] || false}
                          onChange={(e) => handleOptionChange(optKey, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="text-sm text-gray-700">{optConfig.label} ({optKey})</label>
                      </>
                    ) : (
                      <>
                        <label className="text-sm text-gray-700 w-32">{optConfig.label} {optConfig.required && '*'}</label>
                        <input
                          type={optConfig.type}
                          value={options[optKey] || ''}
                          onChange={(e) => handleOptionChange(optKey, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={optConfig.required ? 'Required' : 'Optional'}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={generateCommand}
                className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate Command
              </button>
            </div>
          )}
        </div>

        {/* Generated Command */}
        {generatedCommand && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Generated Command</h3>
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
              {generatedCommand}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CLICommandBuilder;