import { useState, useEffect } from 'react';

export const useApiKey = (keyName = 'sec_api_key', defaultValue = '') => {
  const getStoredApiKey = () => {
    try {
      const item = localStorage.getItem(keyName);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading API key from localStorage:', error);
      return defaultValue;
    }
  };

  const [apiKey, setApiKeyState] = useState(getStoredApiKey);
  const [isKeyValid, setIsKeyValid] = useState(Boolean(getStoredApiKey()));
  const [lastValidated, setLastValidated] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(keyName, JSON.stringify(apiKey));
    } catch (error) {
      console.error('Error saving API key to localStorage:', error);
    }
  }, [keyName, apiKey]);

  const setApiKey = (newValue) => {
    setApiKeyState(newValue);
    setIsKeyValid(Boolean(newValue));
  };

  const clearApiKey = () => {
    setApiKeyState(defaultValue);
    setIsKeyValid(false);
    try {
      localStorage.removeItem(keyName);
    } catch (error) {
      console.error('Error removing API key from localStorage:', error);
    }
  };

  const validateApiKey = async (testUrl) => {
    if (!apiKey) {
      setIsKeyValid(false);
      return false;
    }

    try {
      const url = testUrl || `https://api.sec-api.io/compensation/AAPL?token=${apiKey}&limit=1`;

      const response = await fetch(url);

      if (response.ok) {
        setIsKeyValid(true);
        setLastValidated(new Date());
        return true;
      } else {
        setIsKeyValid(false);
        return false;
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setIsKeyValid(false);
      return false;
    }
  };

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    validateApiKey,
    isKeyValid,
    lastValidated
  };
};