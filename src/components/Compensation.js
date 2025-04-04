import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useCompensation } from '../hooks/useCompensation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Compensation = () => {
  const {
    companies,
    isLoading,
    error,
    fetchCompensationData,
    handleCsvUpload,
    downloadCompanyData,
    removeCompany
  } = useCompensation();

  const [tickerInput, setTickerInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const chartFields = [
    "Salary",
    "Bonus",
    "Stock_Awards",
    "Option_Awards",
    "Non_Equity_Comp",
    "Change_in_Pension_Value_and_Deferred_Earnings",
    "Other_Comp",
    "Total"
  ];

  const handleSearch = async () => {
    if (!tickerInput) return;

    const tickerList = tickerInput.split(',').map(t => t.trim().toUpperCase());

    for (const ticker of tickerList) {
      await fetchCompensationData(ticker);
    }

    setTickerInput('');
  };

  const handleSelectCompany = (ticker) => {
    const company = companies.find(c => c.ticker === ticker);
    setSelectedCompany(company);

    if (company && company.data.length > 0) {
      const years = [...new Set(company.data.map(d => d.Year))].sort((a, b) => b - a);
      setSelectedYear(years[0]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleCsvUpload(file);
      setFileInputKey(Date.now());
    }
  };

  // Determine grid columns based on screen width
  const getGridColumns = () => {
    if (windowWidth < 768) {
      return 1; // Mobile: 1 column
    } else if (windowWidth < 1024) {
      return 2; // Tablet: 2 columns
    } else {
      return 4; // Desktop: 4 columns
    }
  };

  const filteredData = selectedCompany?.data.filter(d => d.Year === selectedYear) || [];

  return (
    <div style={{ paddingBottom: '40px', maxWidth: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Executive Compensation Explorer</h1>

      {/* Search Section */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: windowWidth < 640 ? 'column' : 'row',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            placeholder="Enter tickers (e.g., AAPL, MSFT, TSLA)"
            style={{
              flexGrow: 1,
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              marginRight: windowWidth < 640 ? '0' : '0.5rem',
              marginBottom: windowWidth < 640 ? '0.5rem' : '0',
              width: windowWidth < 640 ? '100%' : 'auto'
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              cursor: isLoading ? 'default' : 'pointer',
              width: windowWidth < 640 ? '100%' : 'auto'
            }}
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: windowWidth < 640 ? 'column' : 'row',
          alignItems: windowWidth < 640 ? 'flex-start' : 'center'
        }}>
          <div style={{
            marginRight: windowWidth < 640 ? '0' : '0.5rem',
            marginBottom: windowWidth < 640 ? '0.5rem' : '0'
          }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              key={fileInputKey}
              style={{ fontSize: '0.875rem', color: '#6b7280' }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Upload CSV files with compensation data</p>
        </div>

        {error && <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>{error}</p>}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: windowWidth < 1024 ? '1fr' : '1fr 3fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Companies List */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Saved Companies</h2>
          {companies.length > 0 ? (
            <ul>
              {companies.map((company) => (
                <li key={company.ticker} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <button
                    onClick={() => handleSelectCompany(company.ticker)}
                    style={{
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontWeight: selectedCompany?.ticker === company.ticker ? 'bold' : 'normal',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: 'inherit'
                    }}
                  >
                    {company.ticker}
                  </button>
                  <div>
                    <button
                      onClick={() => downloadCompanyData(company.ticker)}
                      style={{
                        color: '#10b981',
                        marginLeft: '0.5rem',
                        marginRight: '0.5rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0
                      }}
                      title="Download CSV"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeCompany(company.ticker)}
                      style={{
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0
                      }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#6b7280' }}>No companies saved yet. Search for a ticker or upload a CSV file.</p>
          )}
        </div>

        {/* Charts Area */}
        <div style={{ padding: '1rem' }}>
          {selectedCompany && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#ffffff',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: windowWidth < 640 ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: windowWidth < 640 ? 'flex-start' : 'center',
                marginBottom: '1rem'
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: windowWidth < 640 ? '0.5rem' : '0'
                }}>
                  {selectedCompany.ticker} Compensation Data
                </h2>

                <select
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    width: windowWidth < 640 ? '100%' : 'auto'
                  }}
                >
                  {[...new Set(selectedCompany.data.map(d => d.Year))]
                    .sort((a, b) => b - a)
                    .map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))
                  }
                </select>
              </div>

              {filteredData.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  {chartFields.map((field) => (
                    <div key={field} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff'
                    }}>
                      <h3 style={{
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                      }}>
                        {field.replace(/_/g, ' ')}
                      </h3>
                      <div style={{ height: '250px', width: '100%' }}>
                        <Bar
                          data={{
                            labels: filteredData.map(d => d.Name.split(' ').slice(-1)[0]),
                            datasets: [{
                              label: field,
                              data: filteredData.map(d => d[field]),
                              backgroundColor: `rgba(${Math.floor(Math.random() * 155) + 50}, ${Math.floor(Math.random() * 155) + 50}, ${Math.floor(Math.random() * 155) + 50}, 0.7)`,
                              borderWidth: 1
                            }]
                          }}
                          options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: function (context) {
                                    let value = context.raw;
                                    return `${context.dataset.label}: $${value.toLocaleString()}`;
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  callback: function (value) {
                                    if (value >= 1000000) {
                                      return '$' + (value / 1000000).toFixed(1) + 'M';
                                    } else if (value >= 1000) {
                                      return '$' + (value / 1000).toFixed(1) + 'K';
                                    }
                                    return '$' + value;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>No data available for {selectedYear}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compensation;