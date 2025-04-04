import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Compensation from './components/Compensation';
import ApiKeySettings from './components/ApiKeySettings';
import { useApiKey } from './hooks/useApiKey';
import './App.css';

const Home = () => {
  const { apiKey, isKeyValid } = useApiKey();

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>FinDoSS</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Welcome to FinDoSS (Financial Document Scrape and Summary).
      </p>
      <div style={{
        padding: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '0.5rem'
      }}>
        <p style={{ color: '#1e40af', fontWeight: '500' }}>
          This tool is for educational purposes only. The data presented is sourced from public records but should not be used for financial decision-making.
        </p>
      </div>

      {!apiKey && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          backgroundColor: '#fefce8',
          border: '1px solid #fef08a',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>API Key Required</h2>
          <p style={{ marginBottom: '0.75rem' }}>
            You need to set up your SEC API key before you can fetch data.
          </p>
          <Link
            to="/settings"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#eab308',
              color: 'white',
              borderRadius: '0.25rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ca8a04'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#eab308'}
          >
            Set Up API Key
          </Link>
        </div>
      )}

      {apiKey && !isKeyValid && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>API Key Issue</h2>
          <p style={{ marginBottom: '0.75rem' }}>
            Your API key may be invalid or hasn't been validated yet.
          </p>
          <Link
            to="/settings"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '0.25rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Check API Key
          </Link>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div style={{
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'box-shadow 0.2s'
        }}
          onMouseOver={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
          onMouseOut={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Executive Compensation</h2>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            Explore and visualize executive compensation data from publicly traded companies.
          </p>
          <Link
            to="/compensation"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '0.25rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Explore Compensation Data
          </Link>
        </div>

        <div style={{
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'box-shadow 0.2s'
        }}
          onMouseOver={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
          onMouseOut={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>API Settings</h2>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            Manage your SEC API key for accessing compensation data.
          </p>
          <Link
            to="/settings"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '0.25rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <nav style={{
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          padding: '1rem 0',
          marginBottom: '2rem'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
            display: 'flex',
            flexDirection: window.innerWidth < 640 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: window.innerWidth < 640 ? 'center' : 'center'
          }}>
            <Link to="/" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              textDecoration: 'none',
              marginBottom: window.innerWidth < 640 ? '0.5rem' : '0'
            }}>FinDoSS</Link>
            <div style={{
              display: 'flex',
              gap: '1.5rem'
            }}>
              <Link to="/" style={{
                color: '#4b5563',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontWeight: '500'
              }}
                onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                onMouseOut={(e) => e.target.style.color = '#4b5563'}>Home</Link>
              <Link to="/compensation" style={{
                color: '#4b5563',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontWeight: '500'
              }}
                onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                onMouseOut={(e) => e.target.style.color = '#4b5563'}>Compensation</Link>
              <Link to="/settings" style={{
                color: '#4b5563',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontWeight: '500'
              }}
                onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                onMouseOut={(e) => e.target.style.color = '#4b5563'}>API Settings</Link>
            </div>
          </div>
        </nav>

        <main style={{
          flex: '1',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compensation" element={<Compensation />} />
            <Route path="/settings" element={<ApiKeySettings />} />
          </Routes>
        </main>

        <footer style={{
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '1rem 0',
          marginTop: '2rem',
          width: '100%'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}>
            <p>
              <strong>FinDoSS</strong> - Financial Document Scrape and Summary &copy; {new Date().getFullYear()}
            </p>
            <p>
              For educational purposes only - All data is stored locally in your browser
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;