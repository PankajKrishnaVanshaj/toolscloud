"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaTrash } from "react-icons/fa";

export const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (dec) => ("0" + dec.toString(16)).slice(-2)).join("");
};

export const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const OAuthTokenGenerator = () => {
  const [flow, setFlow] = useState("client_credentials");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [tokenEndpoint, setTokenEndpoint] = useState("");
  const [introspectionEndpoint, setIntrospectionEndpoint] = useState("");
  const [scope, setScope] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || "");
  const [tokenResponse, setTokenResponse] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem("oauthHistory")) || []);
  const [timeLeft, setTimeLeft] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [codeVerifier, setCodeVerifier] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [responseFormat, setResponseFormat] = useState("json"); // New: JSON or Plain Text
  const [requestTimeout, setRequestTimeout] = useState(30); // New: Request timeout in seconds

  const generatePKCE = useCallback(async () => {
    const verifier = generateCodeVerifier();
    setCodeVerifier(verifier);
    const challenge = await generateCodeChallenge(verifier);
    return challenge;
  }, []);

  const generateToken = async (e) => {
    e.preventDefault();
    setError("");
    setTokenResponse(null);
    setValidationResult(null);
    setTimeLeft(null);
    setIsLoading(true);

    let headers = { "Content-Type": "application/x-www-form-urlencoded" };
    try {
      const customHeadersObj = customHeaders ? JSON.parse(customHeaders) : {};
      headers = { ...headers, ...customHeadersObj };
    } catch {
      setError("Invalid custom headers JSON");
      setIsLoading(false);
      return;
    }

    let body = new URLSearchParams({ client_id: clientId });
    if (clientSecret) body.append("client_secret", clientSecret);

    const requestData = { flow, clientId, tokenEndpoint, scope, timestamp: new Date().toISOString() };

    switch (flow) {
      case "client_credentials":
        body.append("grant_type", "client_credentials");
        if (scope) body.append("scope", scope);
        break;
      case "authorization_code":
        if (!authCode || !redirectUri) {
          setError("Authorization Code and Redirect URI are required");
          setIsLoading(false);
          return;
        }
        body.append("grant_type", "authorization_code");
        body.append("code", authCode);
        body.append("redirect_uri", redirectUri);
        if (codeVerifier) body.append("code_verifier", codeVerifier);
        if (scope) body.append("scope", scope);
        requestData.authCode = authCode;
        requestData.redirectUri = redirectUri;
        requestData.codeVerifier = codeVerifier;
        break;
      case "refresh_token":
        if (!refreshToken) {
          setError("Refresh Token is required");
          setIsLoading(false);
          return;
        }
        body.append("grant_type", "refresh_token");
        body.append("refresh_token", refreshToken);
        if (scope) body.append("scope", scope);
        requestData.refreshToken = refreshToken;
        break;
      default:
        setError("Invalid flow selected");
        setIsLoading(false);
        return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout * 1000);

      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers,
        body: body.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setTokenResponse(data);
      setHistory((prev) => {
        const newHistory = [...prev, { ...requestData, response: data }].slice(-50); // Increased to 50
        localStorage.setItem("oauthHistory", JSON.stringify(newHistory));
        return newHistory;
      });
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
        localStorage.setItem("refreshToken", data.refresh_token);
      }
      if (data.expires_in) setTimeLeft(data.expires_in);
    } catch (err) {
      setError(`Failed to generate token: ${err.name === "AbortError" ? "Request timed out" : err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async () => {
    if (!tokenResponse?.access_token || !introspectionEndpoint) return;

    try {
      const response = await fetch(introspectionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(clientSecret && { Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}` }),
        },
        body: new URLSearchParams({ token: tokenResponse.access_token }),
      });

      if (!response.ok) throw new Error("Validation failed");
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
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      ...(clientSecret && { client_secret: clientSecret }),
    });

    try {
      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await response.json();
      setTokenResponse(data);
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
        localStorage.setItem("refreshToken", data.refresh_token);
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
      setTimeLeft((prev) => prev - 1);
      refreshTokenAutomatically();
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, refreshTokenAutomatically]);

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);
  const exportHistory = () => {
    const json = JSON.stringify(history, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oauth_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("oauthHistory");
  };

  const generateAuthUrl = async () => {
    if (!tokenEndpoint || !clientId || !redirectUri) return "";
    const authEndpoint = tokenEndpoint.replace("/token", "/authorize");
    const codeChallenge = codeVerifier ? await generateCodeChallenge(codeVerifier) : "";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope || "",
      ...(codeVerifier && { code_challenge: codeChallenge }),
      ...(codeVerifier && { code_challenge_method: "S256" }),
    });
    return `${authEndpoint}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced OAuth Token Generator
        </h1>

        <form onSubmit={generateToken} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OAuth Flow</label>
              <select
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="client_credentials">Client Credentials</option>
                <option value="authorization_code">Authorization Code (with PKCE)</option>
                <option value="refresh_token">Refresh Token</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Response Format</label>
              <select
                value={responseFormat}
                onChange={(e) => setResponseFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="plain">Plain Text</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret (optional)</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token Endpoint</label>
              <input
                type="url"
                value={tokenEndpoint}
                onChange={(e) => setTokenEndpoint(e.target.value)}
                placeholder="https://example.com/oauth/token"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scope (optional)</label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="space-separated scopes"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Timeout (seconds)</label>
              <input
                type="number"
                value={requestTimeout}
                onChange={(e) => setRequestTimeout(Math.max(1, e.target.value))}
                min="1"
                max="120"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Headers (JSON)</label>
            <textarea
              value={customHeaders}
              onChange={(e) => setCustomHeaders(e.target.value)}
              placeholder='{"X-Custom-Header": "value"}'
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-24 resize-y"
            />
          </div>

          {flow === "authorization_code" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authorization Code</label>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URI</label>
                  <input
                    type="url"
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={async () => await generatePKCE()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Generate PKCE
              </button>
              {codeVerifier && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>Code Verifier:</span>
                    <span className="truncate flex-1">{codeVerifier}</span>
                    <button
                      onClick={() => copyToClipboard(codeVerifier)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>Auth URL:</span>
                    <a
                      href={generateAuthUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 break-all flex-1 hover:underline"
                    >
                      {generateAuthUrl()}
                    </a>
                    <button
                      onClick={async () => copyToClipboard(await generateAuthUrl())}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {flow === "refresh_token" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
              <input
                type="text"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm">Auto-Refresh (within 60s of expiry)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : null}
            {isLoading ? "Generating..." : "Generate Token"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {tokenResponse && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Token Response</h2>
              <div className="space-y-2 text-sm">
                {tokenResponse.access_token && (
                  <div className="flex items-center gap-2">
                    <span>Access Token:</span>
                    <span className="truncate flex-1">{tokenResponse.access_token}</span>
                    <button
                      onClick={() => copyToClipboard(tokenResponse.access_token)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <FaCopy />
                    </button>
                  </div>
                )}
                {tokenResponse.refresh_token && (
                  <div className="flex items-center gap-2">
                    <span>Refresh Token:</span>
                    <span className="truncate flex-1">{tokenResponse.refresh_token}</span>
                    <button
                      onClick={() => copyToClipboard(tokenResponse.refresh_token)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <FaCopy />
                    </button>
                  </div>
                )}
                {tokenResponse.expires_in && (
                  <p>
                    Expires in: {timeLeft} seconds {timeLeft <= 0 && "(Expired)"}
                  </p>
                )}
                {tokenResponse.token_type && <p>Token Type: {tokenResponse.token_type}</p>}
                <button
                  onClick={validateToken}
                  disabled={!introspectionEndpoint}
                  className="mt-2 px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Validate Token
                </button>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-48">
                  {responseFormat === "json"
                    ? JSON.stringify(tokenResponse, null, 2)
                    : Object.entries(tokenResponse)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join("\n")}
                </pre>
              </div>
            </div>

            {validationResult && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Token Validation</h2>
                <pre className="text-sm overflow-auto max-h-48">
                  {JSON.stringify(validationResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Request History (Last 50)</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportHistory}
                  className="px-4 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Export
                </button>
                <button
                  onClick={clearHistory}
                  className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaTrash className="mr-2" /> Clear
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {history.map((item, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  <p>
                    {item.timestamp} - <span className="font-medium">{item.flow}</span>
                  </p>
                  <p className="truncate">Endpoint: {item.tokenEndpoint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for Client Credentials, Authorization Code (PKCE), and Refresh Token flows</li>
            <li>Automatic token refresh with configurable timeout</li>
            <li>Token validation via introspection endpoint</li>
            <li>Customizable request headers and timeout</li>
            <li>Response format toggle (JSON/Plain Text)</li>
            <li>Persistent history (up to 50 requests) with export/import</li>
            <li>PKCE generation and Authorization URL builder</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OAuthTokenGenerator;