'use client';

import React, { useState, useEffect, useCallback } from 'react';

export const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
  };
  
  export const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

const OAuthTokenGenerator = () => {
  const [flow, setFlow] = useState('client_credentials');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [tokenEndpoint, setTokenEndpoint] = useState('');
  const [introspectionEndpoint, setIntrospectionEndpoint] = useState('');
  const [scope, setScope] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '');
  const [tokenResponse, setTokenResponse] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('oauthHistory')) || []);
  const [timeLeft, setTimeLeft] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [codeVerifier, setCodeVerifier] = useState('');
  const [customHeaders, setCustomHeaders] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const generatePKCE = useCallback(() => {
    const verifier = generateCodeVerifier();
    setCodeVerifier(verifier);
    return generateCodeChallenge(verifier);
  }, []);

  const generateToken = async (e) => {
    e.preventDefault();
    setError('');
    setTokenResponse(null);
    setValidationResult(null);
    setTimeLeft(null);
    setIsLoading(true);

    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    try {
      const customHeadersObj = customHeaders ? JSON.parse(customHeaders) : {};
      headers = { ...headers, ...customHeadersObj };
    } catch {
      setError('Invalid custom headers JSON');
      setIsLoading(false);
      return;
    }

    let body = new URLSearchParams({
      client_id: clientId,
      ...(clientSecret && { client_secret: clientSecret }),
    });

    const requestData = { flow, clientId, tokenEndpoint, scope, timestamp: new Date().toISOString() };

    switch (flow) {
      case 'client_credentials':
        body.append('grant_type', 'client_credentials');
        if (scope) body.append('scope', scope);
        break;
      case 'authorization_code':
        if (!authCode || !redirectUri) {
          setError('Authorization Code and Redirect URI are required');
          setIsLoading(false);
          return;
        }
        body.append('grant_type', 'authorization_code');
        body.append('code', authCode);
        body.append('redirect_uri', redirectUri);
        if (codeVerifier) body.append('code_verifier', codeVerifier);
        if (scope) body.append('scope', scope);
        requestData.authCode = authCode;
        requestData.redirectUri = redirectUri;
        requestData.codeVerifier = codeVerifier;
        break;
      case 'refresh_token':
        if (!refreshToken) {
          setError('Refresh Token is required');
          setIsLoading(false);
          return;
        }
        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', refreshToken);
        if (scope) body.append('scope', scope);
        requestData.refreshToken = refreshToken;
        break;
      default:
        setError('Invalid flow selected');
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers,
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTokenResponse(data);
      setHistory(prev => {
        const newHistory = [...prev, { ...requestData, response: data }].slice(-20);
        localStorage.setItem('oauthHistory', JSON.stringify(newHistory));
        return newHistory;
      });
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
        localStorage.setItem('refreshToken', data.refresh_token);
      }
      if (data.expires_in) setTimeLeft(data.expires_in);
    } catch (err) {
      setError(`Failed to generate token: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async () => {
    if (!tokenResponse?.access_token || !introspectionEndpoint) return;

    try {
      const response = await fetch(introspectionEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(clientSecret && { 'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}` }),
        },
        body: new URLSearchParams({
          token: tokenResponse.access_token,
        }),
      });

      if (!response.ok) throw new Error('Validation failed');
      const data = await response.json();
      setValidationResult(data);
    } catch (err) {
      setValidationResult({ error: `Validation failed: ${err.message}` });
    }
  };

  const refreshTokenAutomatically = useCallback(async () => {
    if (!autoRefresh || !refreshToken || !tokenEndpoint || timeLeft > 60) return;

    setIsLoading(true);
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      ...(clientSecret && { client_secret: clientSecret }),
    });

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await response.json();
      setTokenResponse(data);
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
        localStorage.setItem('refreshToken', data.refresh_token);
      }
      if (data.expires_in) setTimeLeft(data.expires_in);
    } catch (err) {
      setError(`Auto-refresh failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [autoRefresh, refreshToken, tokenEndpoint, timeLeft, clientId, clientSecret]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      refreshTokenAutomatically();
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, refreshTokenAutomatically]);

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);
  const exportHistory = () => {
    const json = JSON.stringify(history, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oauth_history.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateAuthUrl = () => {
    if (!tokenEndpoint || !clientId || !redirectUri) return '';
    const authEndpoint = tokenEndpoint.replace('/token', '/authorize');
    const codeChallenge = codeVerifier ? generateCodeChallenge(codeVerifier) : '';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope || '',
      ...(codeVerifier && { code_challenge: codeChallenge }),
      ...(codeVerifier && { code_challenge_method: 'S256' }),
    });
    return `${authEndpoint}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Advanced OAuth Token Generator
        </h1>

        <form onSubmit={generateToken} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OAuth Flow</label>
              <select
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="client_credentials">Client Credentials</option>
                <option value="authorization_code">Authorization Code (with PKCE)</option>
                <option value="refresh_token">Refresh Token</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Refresh</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mt-2"
              />
              <span className="ml-2 text-sm">Enable (within 60s of expiry)</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret (optional)</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token Endpoint</label>
              <input
                type="url"
                value={tokenEndpoint}
                onChange={(e) => setTokenEndpoint(e.target.value)}
                placeholder="https://example.com/oauth/token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Introspection Endpoint</label>
              <input
                type="url"
                value={introspectionEndpoint}
                onChange={(e) => setIntrospectionEndpoint(e.target.value)}
                placeholder="https://example.com/oauth/introspect"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scope (optional)</label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="space-separated scopes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Headers (JSON)</label>
            <textarea
              value={customHeaders}
              onChange={(e) => setCustomHeaders(e.target.value)}
              placeholder='{"X-Custom-Header": "value"}'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
            />
          </div>

          {flow === 'authorization_code' && (
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authorization Code</label>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URI</label>
                  <input
                    type="url"
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => generatePKCE()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Generate PKCE
                </button>
                {codeVerifier && (
                  <p className="mt-2 text-sm">
                    Code Verifier: {codeVerifier} 
                    <button onClick={() => copyToClipboard(codeVerifier)} className="ml-2 text-blue-500">Copy</button>
                  </p>
                )}
                {codeVerifier && (
                  <p className="mt-2 text-sm break-all">
                    Authorization URL: <a href={generateAuthUrl()} target="_blank" className="text-blue-500">{generateAuthUrl()}</a>
                  </p>
                )}
              </div>
            </div>
          )}

          {flow === 'refresh_token' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
              <input
                type="text"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Token'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {tokenResponse && (
          <div className="mt-4 grid gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Token Response:</h2>
              <div className="space-y-2 text-sm">
                {tokenResponse.access_token && (
                  <div className="flex items-center gap-2">
                    <p>Access Token: {tokenResponse.access_token.slice(0, 20)}...</p>
                    <button onClick={() => copyToClipboard(tokenResponse.access_token)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Copy</button>
                  </div>
                )}
                {tokenResponse.refresh_token && (
                  <div className="flex items-center gap-2">
                    <p>Refresh Token: {tokenResponse.refresh_token.slice(0, 20)}...</p>
                    <button onClick={() => copyToClipboard(tokenResponse.refresh_token)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Copy</button>
                  </div>
                )}
                {tokenResponse.expires_in && (
                  <p>Expires in: {timeLeft} seconds {timeLeft <= 0 && '(Expired)'}</p>
                )}
                {tokenResponse.token_type && (
                  <p>Token Type: {tokenResponse.token_type}</p>
                )}
                <button
                  onClick={validateToken}
                  disabled={!introspectionEndpoint}
                  className="mt-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                >
                  Validate Token
                </button>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">{JSON.stringify(tokenResponse, null, 2)}</pre>
              </div>
            </div>

            {validationResult && (
              <div className="p-4 bg-blue-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Token Validation:</h2>
                <pre className="text-sm overflow-auto">{JSON.stringify(validationResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Request History (Last 20):</h2>
              <button onClick={exportHistory} className="px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">Export History</button>
            </div>
            <div className="space-y-2 text-sm max-h-40 overflow-auto">
              {history.map((item, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  <p>{item.timestamp} - {item.flow}</p>
                  <p>Endpoint: {item.tokenEndpoint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Advanced Features</summary>
            <ul className="list-disc list-inside mt-2">
              <li>PKCE support for Authorization Code flow</li>
              <li>Automatic token refresh (within 60s of expiry)</li>
              <li>Token validation with introspection</li>
              <li>Custom request headers</li>
              <li>Persistent storage for history and refresh token</li>
              <li>Authorization URL generator</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default OAuthTokenGenerator;

