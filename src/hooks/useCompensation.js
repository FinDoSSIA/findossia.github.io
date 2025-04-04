import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { useApiKey } from './useApiKey';

const API_BASE_URL = "https://api.sec-api.io";

export const useCompensation = () => {
  const { apiKey, isKeyValid } = useApiKey();
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('compensationData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setCompanies(parsedData);
      } catch (err) {
        console.error('Error parsing stored data:', err);
        localStorage.removeItem('compensationData');
      }
    }
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      localStorage.setItem('compensationData', JSON.stringify(companies));
    }
  }, [companies]);

  const processApiData = (data) => {
    return data.map(item => ({
      ID: item.id,
      CIK: item.cik,
      Ticker: item.ticker,
      Name: item.name,
      Position: item.position,
      Year: item.year,
      Salary: item.salary,
      Bonus: item.bonus,
      Stock_Awards: item.stockAwards,
      Option_Awards: item.optionAwards,
      Non_Equity_Comp: item.nonEquityIncentiveCompensation,
      Change_in_Pension_Value_and_Deferred_Earnings: item.changeInPensionValueAndDeferredEarnings,
      Other_Comp: item.otherCompensation,
      Total: item.total
    }));
  };

  const fetchCompensationData = async (ticker) => {
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
      const response = await axios.get(`${API_BASE_URL}/compensation/${ticker}?token=${apiKey}`);

      if (response.data && response.data.length > 0) {
        const processedData = processApiData(response.data);

        updateCompanyData(ticker, processedData);

        return processedData;
      } else {
        throw new Error('No data found');
      }
    } catch (err) {
      console.error(`Error fetching data for ${ticker}:`, err);

      if (err.response && err.response.status === 401) {
        setError("API key unauthorized. Please check your API key in the settings.");
      } else if (err.response && err.response.status === 403) {
        setError("API key access forbidden. You may have reached your quota limit.");
      } else {
        setError(`Failed to fetch data for ${ticker}. ${err.message}`);
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
          if (!firstRecord.Ticker) {
            setError("CSV file must contain a 'Ticker' column");
            setIsLoading(false);
            return;
          }

          const ticker = firstRecord.Ticker.toUpperCase();
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
    link.setAttribute('download', `${ticker}_compensation_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeCompany = (ticker) => {
    setCompanies(companies.filter(c => c.ticker.toUpperCase() !== ticker.toUpperCase()));

    if (companies.length <= 1) {
      localStorage.removeItem('compensationData');
    }
  };

  return {
    companies,
    isLoading,
    error,
    fetchCompensationData,
    handleCsvUpload,
    downloadCompanyData,
    removeCompany
  };
};