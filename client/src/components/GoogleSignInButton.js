import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

// Renders Google Identity Services button and handles sign-in
const GoogleSignInButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const fallbackId = '81993856729-4igd8hkurq85l3gkg2ceim4j33rglh40.apps.googleusercontent.com';
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || window.REACT_APP_GOOGLE_CLIENT_ID || fallbackId;
    if (!clientId) {
      setError('Google Sign-In not configured');
      setIsConfigured(false);
      return;
    }
    setIsConfigured(true);

    // Inject Google script once
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initialize(clientId);
      script.onerror = () => setError('Failed to load Google SDK');
      document.body.appendChild(script);
    } else {
      initialize(clientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialize = (clientId) => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        ux_mode: 'popup',
      });
      setSdkReady(true);
    } catch (e) {
      setError('Google init failed');
    }
  };

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_GOOGLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Google sign-in failed');
      }
      if (data.user?.isAdmin) {
        setError('Admin users must use the admin login portal.');
        return;
      }
      login(data.user, data.token);
      if (onSuccess) onSuccess(data.user);
    } catch (e) {
      setError(e.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomClick = () => {
    if (!isConfigured) return;
    if (!sdkReady || !window.google?.accounts?.id) {
      setError('Google is loading, please try again...');
      return;
    }
    // Show the Google account chooser / One Tap with our callback
    try {
      window.google.accounts.id.prompt();
    } catch (e) {
      setError('Unable to open Google Sign-In');
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      {/* Visible custom button */}
      <button
        type="button"
        onClick={handleCustomClick}
        disabled={!isConfigured || loading}
        className={`w-full max-w-xs flex items-center justify-center gap-3 px-4 py-2 rounded-lg border transition ${
          !isConfigured || loading
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200 shadow-sm'
        }`}
        aria-label="Sign in with Google"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.826 31.91 29.273 35 24 35c-7.18 0-13-5.82-13-13s5.82-13 13-13c3.31 0 6.32 1.236 8.605 3.26l5.657-5.657C34.943 3.042 29.74 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24 24-10.745 24-24c0-1.627-.167-3.215-.389-4.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.379 16.819 18.839 14 24 14c3.31 0 6.32 1.236 8.605 3.26l5.657-5.657C34.943 3.042 29.74 1 24 1 15.317 1 7.93 5.936 4.11 13.027l2.196 1.664z"/>
          <path fill="#4CAF50" d="M24 49c5.166 0 9.86-1.977 13.409-5.197l-6.188-5.238C29.984 40.488 27.128 41.5 24 41.5c-5.237 0-9.676-3.348-11.29-8.018l-6.5 5.005C9.002 44.979 16.02 49 24 49z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.36 3.183-4.121 5.682-7.482 6.53l6.188 5.238C36.92 40.487 41.5 34.5 41.5 25c0-1.627-.167-3.215-.389-4.917z"/>
        </svg>
        <span className="text-sm font-medium">Sign in with Google</span>
      </button>

      {loading && (
        <p className="mt-2 text-sm text-gray-500 text-center">Signing in with Google…</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;


