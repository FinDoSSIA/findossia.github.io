import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Compensation from './components/Compensation';
import ApiKeySettings from './components/ApiKeySettings';
import { useApiKey } from './hooks/useApiKey';
import './App.css';

const Home = () => {
  const { apiKey, isKeyValid } = useApiKey();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">FinDoSS</h1>
      <p className="mb-6">
        Welcome to FinDoSS (Financial Document Scrape and Summary).
      </p>
      <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 font-medium">
          This tool is for educational purposes only. The data presented is sourced from public records but should not be used for financial decision-making.
        </p>
      </div>

      {!apiKey && (
        <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">API Key Required</h2>
          <p className="mb-3">
            You need to set up your SEC API key before you can fetch data.
          </p>
          <Link
            to="/settings"
            className="inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Set Up API Key
          </Link>
        </div>
      )}

      {apiKey && !isKeyValid && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">API Key Issue</h2>
          <p className="mb-3">
            Your API key may be invalid or hasn't been validated yet.
          </p>
          <Link
            to="/settings"
            className="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Check API Key
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Executive Compensation</h2>
          <p className="text-gray-600 mb-4">
            Explore and visualize executive compensation data from publicly traded companies.
          </p>
          <Link
            to="/compensation"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Explore Compensation Data
          </Link>
        </div>

        <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3">API Settings</h2>
          <p className="text-gray-600 mb-4">
            Manage your SEC API key for accessing compensation data.
          </p>
          <Link
            to="/settings"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Manage API Key
          </Link>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center' }}>
        <nav style={{ paddingTop: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Link to="/" className="text-xl font-bold text-blue-600">FinDoSS</Link>
            <div style={{ display: 'flex', gap: '16px', paddingTop: '8px' }}>
              <Link to="/" className="text-gray-700 hover:text-blue-500">Home</Link>
              <Link to="/compensation" className="text-gray-700 hover:text-blue-500">Compensation</Link>
              <Link to="/settings" className="text-gray-700 hover:text-blue-500">API Settings</Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compensation" element={<Compensation />} />
            <Route path="/settings" element={<ApiKeySettings />} />
          </Routes>
        </main>

        <footer style={{ position: 'fixed', bottom: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            FinDoSS - Financial Document Scrape and Summary &copy; {new Date().getFullYear()} - For educational purposes only - All data is stored locally in your browser
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;