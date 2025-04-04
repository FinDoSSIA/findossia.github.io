import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { useApiKey } from './useApiKey';

const API_BASE_URL = "https://api.sec-api.io/insider-trading";

export const useInsiderTrading = () => {
  const { apiKey, isKeyValid } = useApiKey('sec_api_key');
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('insiderTradingData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setCompanies(parsedData);
      } catch (err) {
        console.error('Error parsing stored insider trading data:', err);
        localStorage.removeItem('insiderTradingData');
      }
    }
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      localStorage.setItem('insiderTradingData', JSON.stringify(companies));
    }
  }, [companies]);

  const flattenFiling = (filing) => {
    const transactions = [];

    try {
      const filingId = filing.id || "";
      const baseData = {
        filingId: filingId,
        periodOfReport: filing.periodOfReport,
        issuerCik: filing.issuer.cik,
        issuerTicker: filing.issuer.tradingSymbol,
        reportingPersonName: filing.reportingOwner?.name || "",
        reportingPersonCik: filing.reportingOwner?.cik || "",
        officerTitle: (filing.reportingOwner?.relationship?.isOfficer)
          ? (filing.reportingOwner?.relationship?.officerTitle || "N/A")
          : "N/A",
        isDirector: filing.reportingOwner?.relationship?.isDirector ? "Yes" : "No",
        isTenPercentOwner: filing.reportingOwner?.relationship?.isTenPercentOwner ? "Yes" : "No",
        remarks: filing.remarks || "N/A"
      };

      if (filing.derivativeTable && filing.derivativeTable.transactions) {
        for (const transaction of filing.derivativeTable.transactions) {
          const shares = transaction.amounts?.shares || 0;
          const sharePrice = transaction.amounts?.pricePerShare || 0;
          const sharesOwnedFollowingTransaction =
            transaction.postTransactionAmounts?.sharesOwnedFollowingTransaction || 0;
          const codingCode = transaction.coding?.code || "";
          const underlyingSecurity = transaction.underlyingSecurity?.title || "";

          const entry = {
            type: "derivative",
            securityTitle: transaction.securityTitle,
            underlyingSecurity: underlyingSecurity,
            codingCode: codingCode,
            acquiredDisposed: transaction.amounts.acquiredDisposedCode,
            shares: shares,
            sharePrice: sharePrice,
            total: Math.ceil(shares * sharePrice),
            sharesOwnedFollowingTransaction: sharesOwnedFollowingTransaction
          };

          transactions.push({ ...baseData, ...entry });
        }
      }

      if (filing.nonDerivativeTable && filing.nonDerivativeTable.transactions) {
        for (const transaction of filing.nonDerivativeTable.transactions) {
          const sharePrice = transaction.amounts?.pricePerShare || 0;
          const sharesOwnedFollowingTransaction =
            transaction.postTransactionAmounts?.sharesOwnedFollowingTransaction || 0;

          const entry = {
            type: "nonDerivative",
            securityTitle: transaction.securityTitle,
            codingCode: transaction.coding.code,
            acquiredDisposed: transaction.amounts.acquiredDisposedCode,
            shares: transaction.amounts.shares,
            sharePrice: sharePrice,
            total: Math.ceil(transaction.amounts.shares * sharePrice),
            sharesOwnedFollowingTransaction: sharesOwnedFollowingTransaction
          };

          transactions.push({ ...baseData, ...entry });
        }
      }
    } catch (err) {
      console.error(`Error processing filing ${filing.id || 'unknown'}:`, err);
    }

    return transactions;
  };

  const flattenFilings = (filings) => {
    const unflattenedList = filings.map(flattenFiling);
    return unflattenedList.flat();
  };

  const fetchInsiderTradingData = async (ticker) => {
    if (!apiKey) {
      setError("No API key provided. Please add your API key in the settings.");
      return null;
    }

    if (!isKeyValid) {
      setError("Your API key hasn't been validated. Please check your API key in the settings.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryStr = `issuer.tradingSymbol:${ticker}`;
      const searchQuery = {
        query: { query_string: { query: queryStr } },
        from: "0",
        size: "50", // Maximum allowed per call
        sort: [{ filedAt: { order: "desc" } }]
      };

      const response = await axios.post(
        `${API_BASE_URL}?token=${apiKey}`,
        searchQuery,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data && response.data.transactions && response.data.transactions.length > 0) {
        const processedData = flattenFilings(response.data.transactions);
        updateCompanyData(ticker, processedData);
        return processedData;
      } else {
        throw new Error('No data found');
      }
    } catch (err) {
      console.error(`Error fetching insider trading data for ${ticker}:`, err);
      console.log("Error response:", err.response?.data, "Status:", err.response?.status);

      if (err.response && err.response.status === 401) {
        setError("API key unauthorized. Please check your API key in the settings.");
      } else if (err.response && err.response.status === 403) {
        setError("API key access forbidden. You may have reached your quota limit.");
      } else if (err.response && err.response.status === 404) {
        setError(`API endpoint not found for ${ticker}. Please check if the endpoint is correct.`);
      } else {
        setError(`Failed to fetch insider trading data for ${ticker}. ${err.message}`);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanyData = (ticker, data) => {
    const existingCompanyIndex = companies.findIndex(
      company => company.ticker.toUpperCase() === ticker.toUpperCase()
    );

    if (existingCompanyIndex >= 0) {
      const updatedCompanies = [...companies];
      updatedCompanies[existingCompanyIndex] = {
        ticker: ticker.toUpperCase(),
        data: data
      };
      setCompanies(updatedCompanies);
    } else {
      setCompanies([
        ...companies,
        {
          ticker: ticker.toUpperCase(),
          data: data
        }
      ]);
    }
  };

  const handleCsvUpload = (file) => {
    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const firstRecord = results.data[0];
          if (!firstRecord.issuerTicker) {
            setError("CSV file must contain an 'issuerTicker' column");
            setIsLoading(false);
            return;
          }

          const ticker = firstRecord.issuerTicker.toUpperCase();
          updateCompanyData(ticker, results.data);
          setIsLoading(false);
        } else {
          setError("No valid data found in CSV");
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError(`Failed to parse CSV: ${error.message}`);
        setIsLoading(false);
      }
    });
  };

  const downloadCompanyData = (ticker) => {
    const company = companies.find(c => c.ticker.toUpperCase() === ticker.toUpperCase());

    if (!company || !company.data.length) {
      setError(`No data available for ${ticker}`);
      return;
    }

    const csv = Papa.unparse(company.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${ticker}_insider_trading_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeCompany = (ticker) => {
    setCompanies(companies.filter(c => c.ticker.toUpperCase() !== ticker.toUpperCase()));

    if (companies.length <= 1) {
      localStorage.removeItem('insiderTradingData');
    }
  };

  return {
    companies,
    isLoading,
    error,
    fetchInsiderTradingData,
    handleCsvUpload,
    downloadCompanyData,
    removeCompany
  };
};