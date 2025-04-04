import React, { useState } from 'react';
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

  const filteredData = selectedCompany?.data.filter(d => d.Year === selectedYear) || [];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 className="text-2xl font-bold mb-4">Executive Compensation Explorer</h1>

      {/* Search Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            placeholder="Enter tickers (e.g., AAPL, MSFT, TSLA)"
            className="flex-grow p-2 border border-gray-300 rounded mr-2"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
        </div>

        <div className="flex items-center">
          <div className="mr-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              key={fileInputKey}
              className="text-sm text-gray-500"
            />
          </div>
          <p className="text-xs text-gray-500">Upload CSV files with compensation data</p>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-3 p-4 bg-gray-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Saved Companies</h2>
          {companies.length > 0 ? (
            <ul>
              {companies.map((company) => (
                <li key={company.ticker} className="flex justify-between items-center py-2 border-b">
                  <button
                    onClick={() => handleSelectCompany(company.ticker)}
                    className={`text-blue-500 hover:underline ${selectedCompany?.ticker === company.ticker ? 'font-bold' : ''}`}
                  >
                    {company.ticker}
                  </button>
                  <div>
                    <button
                      onClick={() => downloadCompanyData(company.ticker)}
                      className="text-green-500 mx-2 text-sm"
                      title="Download CSV"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeCompany(company.ticker)}
                      className="text-red-500 text-sm"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No companies saved yet. Search for a ticker or upload a CSV file.</p>
          )}
        </div>

        <div style={{ padding: '16px' }}>
          {selectedCompany && (
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedCompany.ticker} Compensation Data
                </h2>

                <select
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="p-2 border border-gray-300 rounded"
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>

                  {chartFields.map((field) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #ddd', padding: '8px', background: '#fff' }}>
                      <h3 className="text-center font-semibold text-sm mb-2">{field.replace('_', ' ')}</h3>
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
                <p className="text-center text-gray-500">No data available for {selectedYear}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compensation;