import React, { useState, useEffect } from 'react';
import { useInsiderTrading } from '../hooks/useInsiderTrading';

const InsiderTrading = () => {
  const {
    companies,
    isLoading,
    error,
    fetchInsiderTradingData,
    handleCsvUpload,
    downloadCompanyData,
    removeCompany
  } = useInsiderTrading();

  const [tickerInput, setTickerInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'periodOfReport', direction: 'desc' });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      let data = [...selectedCompany.data];

      if (selectedPeriod !== 'all') {
        const today = new Date();
        let filterDate = new Date();

        switch (selectedPeriod) {
          case '30days':
            filterDate.setDate(today.getDate() - 30);
            break;
          case '90days':
            filterDate.setDate(today.getDate() - 90);
            break;
          case '6months':
            filterDate.setMonth(today.getMonth() - 6);
            break;
          case '1year':
            filterDate.setFullYear(today.getFullYear() - 1);
            break;
          default:
            break;
        }

        data = data.filter(item => {
          return new Date(item.periodOfReport) >= filterDate;
        });
      }

      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

      setFilteredData(data);
    } else {
      setFilteredData([]);
    }
  }, [selectedCompany, selectedPeriod, sortConfig]);

  const handleSearch = async () => {
    if (!tickerInput) return;

    const tickerList = tickerInput.split(',').map(t => t.trim().toUpperCase());

    for (const ticker of tickerList) {
      await fetchInsiderTradingData(ticker);
    }

    setTickerInput('');
  };

  const handleSelectCompany = (ticker) => {
    const company = companies.find(c => c.ticker === ticker);
    setSelectedCompany(company);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleCsvUpload(file);
      setFileInputKey(Date.now());
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A';
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return 'N/A';
    return value.toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div style={{ paddingBottom: '40px', maxWidth: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Insider Trading Explorer</h1>

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
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Upload CSV files with insider trading data</p>
        </div>

        {error && <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>{error}</p>}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: windowWidth < 1024 ? '1fr' : '1fr 3fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
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
                  {selectedCompany.ticker} Insider Trading Data
                </h2>

                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    width: windowWidth < 640 ? '100%' : 'auto'
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>

              {filteredData.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'left',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('periodOfReport')}>
                          Date {sortConfig.key === 'periodOfReport' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'left',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('reportingPersonName')}>
                          Insider {sortConfig.key === 'reportingPersonName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'left',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('officerTitle')}>
                          Title {sortConfig.key === 'officerTitle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'left',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('type')}>
                          Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'left',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('securityTitle')}>
                          Security {sortConfig.key === 'securityTitle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('acquiredDisposed')}>
                          A/D {sortConfig.key === 'acquiredDisposed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('shares')}>
                          Shares {sortConfig.key === 'shares' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('sharePrice')}>
                          Price {sortConfig.key === 'sharePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{
                          padding: '0.5rem',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }} onClick={() => handleSort('total')}>
                          Value {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((transaction, index) => (
                        <tr key={`${transaction.filingId}-${index}`} style={{
                          backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            {formatDate(transaction.periodOfReport)}
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            {transaction.reportingPersonName}
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            {transaction.officerTitle}
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            {transaction.type === 'derivative' ? 'Derivative' : 'Non-Derivative'}
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            {transaction.securityTitle}
                          </td>
                          <td style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            textAlign: 'right',
                            color: transaction.acquiredDisposed === 'A' ? '#10b981' : '#ef4444'
                          }}>
                            {transaction.acquiredDisposed === 'A' ? 'Buy' : 'Sell'}
                          </td>
                          <td style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            textAlign: 'right'
                          }}>
                            {formatNumber(transaction.shares)}
                          </td>
                          <td style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            textAlign: 'right'
                          }}>
                            {formatCurrency(transaction.sharePrice)}
                          </td>
                          <td style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            textAlign: 'right'
                          }}>
                            {formatCurrency(transaction.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>No data available for the selected period</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsiderTrading;