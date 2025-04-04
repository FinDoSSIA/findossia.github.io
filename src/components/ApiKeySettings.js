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
      } else {
        setErrorMessage('The API key appears to be invalid. Please check and try again.');
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
    <div style={{ paddingBottom: '40px' }}>
      <h1 className="text-3xl font-bold mb-6">API Key Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {apiKey ? (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Current API Key</h2>
            <div className="p-4 bg-gray-50 rounded border mb-4">
              <div className="flex items-center mb-2">
                <code className="bg-gray-100 px-3 py-2 rounded font-mono text-sm flex-grow">
                  {maskApiKey(apiKey)}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="ml-2 px-3 py-2 text-sm text-blue-500 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
                  type="button"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
            <p className="mb-1 font-medium">No API key is currently set</p>
            <p className="text-sm">
              You need an API key to fetch data from the SEC API. Please enter your key below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {apiKey ? 'Update API Key' : 'Set API Key'}
          </h2>

          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              SEC API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter your SEC API key"
              className="w-full p-3 border rounded"
              autoComplete="off"
            />
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
              {successMessage}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Validating...' : apiKey ? 'Update Key' : 'Save Key'}
            </button>

            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Clear Key
              </button>
            )}

            <Link to="/" className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 ml-auto">
              Back to Home
            </Link>
          </div>
        </form>

        <div className="border-t pt-4 text-sm text-gray-500">
          <h3 className="font-medium text-gray-700 mb-2">About API Keys</h3>
          <p className="mb-2">
            Your API key is stored securely in your browser's local storage and is never sent to our servers.
          </p>
          <p className="mb-2">
            This application uses the SEC-API.io service to fetch executive compensation data. You'll need to
            sign up for an API key at <a href="https://sec-api.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">sec-api.io</a>.
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