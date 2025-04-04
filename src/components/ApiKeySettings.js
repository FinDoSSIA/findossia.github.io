import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApiKey } from '../hooks/useApiKey';

const ApiKeySettings = () => {
  const {
    apiKey,
    setApiKey,
    clearApiKey,
    validateApiKey,
    isKeyValid,
    lastValidated
  } = useApiKey();

  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!inputKey.trim()) {
      setErrorMessage('API key cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      setApiKey(inputKey.trim());

      const isValid = await validateApiKey();

      if (isValid) {
        setSuccessMessage('API key successfully validated and saved');
        setInputKey('');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setErrorMessage('An error occurred while validating the API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
    setErrorMessage('');
    setSuccessMessage('API key has been cleared');
  };

  const maskApiKey = (key) => {
    if (!key) return '';

    if (showKey) return key;

    if (key.length <= 8) {
      return '••••••••';
    }

    return key.substring(0, 4) + '••••••••••••' + key.substring(key.length - 4);
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>API Key Settings</h1>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '1.5rem'
      }}>
        {apiKey ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Current API Key</h2>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <code style={{
                  backgroundColor: '#f3f4f6',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  flexGrow: 1
                }}>
                  {maskApiKey(apiKey)}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    color: '#3b82f6',
                    border: '1px solid #93c5fd',
                    borderRadius: '0.375rem',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = '#1d4ed8';
                    e.target.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = '#3b82f6';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  type="button"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fefce8',
            border: '1px solid #fef08a',
            borderRadius: '0.375rem',
            color: '#854d0e'
          }}>
            <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>No API key is currently set</p>
            <p style={{ fontSize: '0.875rem' }}>
              You need an API key to fetch data from the SEC API. Please enter your key below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            {apiKey ? 'Update API Key' : 'Set API Key'}
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="apiKey"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}
            >
              SEC API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter your SEC API key"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              autoComplete="off"
            />
          </div>

          {errorMessage && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#d1fae5',
              border: '1px solid #a7f3d0',
              borderRadius: '0.375rem',
              color: '#047857',
              fontSize: '0.875rem'
            }}>
              {successMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: isLoading ? 'default' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseOut={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#3b82f6';
              }}
            >
              {isLoading ? 'Validating...' : apiKey ? 'Update Key' : 'Save Key'}
            </button>

            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#fee2e2'}
              >
                Clear Key
              </button>
            )}

            <Link
              to="/"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                marginLeft: 'auto',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              Back to Home
            </Link>
          </div>
        </form>

        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <h3 style={{ fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>About API Keys</h3>
          <p style={{ marginBottom: '0.5rem' }}>
            Your API key is stored securely in your browser's local storage and is never sent to our servers.
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            This application uses the SEC-API.io service to fetch executive compensation data. You'll need to
            sign up for an API key at <a
              href="https://sec-api.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'none' }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              sec-api.io
            </a>.
          </p>
          <p>
            The free tier includes a limited number of API calls per day, which should be sufficient for
            personal use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;