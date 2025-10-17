import React, { useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

// Renders the official Google Identity Services button and handles sign-in
const GoogleSignInButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const { login } = useAuth();
  const buttonContainerRef = useRef(null);

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
        ux_mode: 'popup'
      });
      // Render the official Google button
      if (buttonContainerRef.current) {
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 280
        });
      }
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

  return (
    <div className="mt-4 flex flex-col items-center">
      {/* Official Google button will render into this container */}
      <div
        ref={buttonContainerRef}
        className="w-full max-w-xs flex items-center justify-center"
        aria-label="Sign in with Google"
      />

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


