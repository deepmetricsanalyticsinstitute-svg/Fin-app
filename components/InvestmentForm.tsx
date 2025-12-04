import React, { useState, useCallback } from 'react';
import { CompoundingFrequency, InvestmentInputs } from '../types';
import InputGroup from './InputGroup';
import SelectGroup from './SelectGroup';

interface InvestmentFormProps {
  onCalculate: (inputs: InvestmentInputs) => void;
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

const InvestmentForm: React.FC<InvestmentFormProps> = ({ onCalculate }) => {
  const [principal, setPrincipal] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [timePeriod, setTimePeriod] = useState<number>(10);
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>(
    CompoundingFrequency.ANNUALLY
  );
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [customCurrencySymbol, setCustomCurrencySymbol] = useState<string>('');
  const [inflationRate, setInflationRate] = useState<number>(0); // New state for inflation rate

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (principal <= 0) newErrors.principal = 'Must be a positive number.';
    if (interestRate < 0) newErrors.interestRate = 'Cannot be negative.';
    if (timePeriod <= 0) newErrors.timePeriod = 'Must be a positive number.';
    if (inflationRate < 0) newErrors.inflationRate = 'Cannot be negative.'; // Validate inflation rate
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [principal, interestRate, timePeriod, inflationRate]); // Add inflationRate to dependencies

  const formatPrincipalValue = useCallback((amount: number, code: string, customSymbol?: string) => {
    if (customSymbol && customSymbol.trim() !== '') {
      const formattedNumber = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `${customSymbol.trim()} ${formattedNumber}`;
    } else {
      return amount.toLocaleString(undefined, { style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }, []);

  const getPrincipalPlaceholder = useCallback((code: string, customSymbol?: string) => {
    if (customSymbol && customSymbol.trim() !== '') {
      return `e.g., ${customSymbol.trim()}10,000.00`;
    }
    const currencyInfo = CURRENCY_OPTIONS.find(opt => opt.value === code);
    return `e.g., ${currencyInfo ? currencyInfo.label.split(' ')[1] : ''}10,000.00`;
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onCalculate({
        principal,
        interestRate,
        timePeriod,
        compoundingFrequency,
        currencyCode: selectedCurrencyCode,
        customCurrencySymbol: customCurrencySymbol.trim() !== '' ? customCurrencySymbol : undefined,
        inflationRate: inflationRate, // Pass inflation rate
      });
    }
  }, [principal, interestRate, timePeriod, compoundingFrequency, selectedCurrencyCode, customCurrencySymbol, inflationRate, validate, onCalculate]); // Add inflationRate to dependencies

  const compoundingOptions = [
    { value: CompoundingFrequency.ANNUALLY, label: 'Annually' },
    { value: CompoundingFrequency.SEMI_ANNUALLY, label: 'Semi-Annually' },
    { value: CompoundingFrequency.QUARTERLY, label: 'Quarterly' },
    { value: CompoundingFrequency.MONTHLY, label: 'Monthly' },
    { value: CompoundingFrequency.DAILY, label: 'Daily' },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-8 rounded-lg shadow-xl bg-white w-full max-w-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Investment Details</h2>

      {/* SelectGroup for Currency */}
      <SelectGroup
        label="Currency"
        id="currency"
        value={selectedCurrencyCode}
        onChange={(e) => setSelectedCurrencyCode(e.target.value)}
        options={CURRENCY_OPTIONS}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
      />

      {/* New InputGroup for Custom Currency Symbol */}
      <InputGroup
        label="Custom Symbol (Optional)"
        id="customCurrencySymbol"
        type="text"
        value={customCurrencySymbol}
        onChange={(e) => setCustomCurrencySymbol(e.target.value)}
        placeholder="e.g., £, €, Kr"
        errorMessage={errors.customCurrencySymbol}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
      />

      {/* Changed type to "text" to allow custom formatting for currency display */}
      <InputGroup
        label="Principal Amount"
        id="principal"
        type="text"
        value={formatPrincipalValue(principal, selectedCurrencyCode, customCurrencySymbol)}
        onChange={(e) => {
          const cleanedValue = e.target.value.replace(/[^0-9.-]/g, ''); // Remove all non-numeric, non-dot, non-minus characters
          const numValue = parseFloat(cleanedValue);
          setPrincipal(isNaN(numValue) ? 0 : numValue); // Set to 0 if input becomes invalid after cleaning
        }}
        // min is still relevant for validation logic but not browser enforcement for type="text".
        // Validation is handled by the `validate` function.
        min={0.01}
        step="0.01"
        placeholder={getPrincipalPlaceholder(selectedCurrencyCode, customCurrencySymbol)}
        errorMessage={errors.principal}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1L21 12m-6-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4M4 12H3a2 2 0 00-2 2v4a2 2 0 002 2h1m5-14v2m6-2v2M9 16h6v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2zm8-2v2m-6-2H6v2a2 2 0 002 2h4a2 2 0 002-2v-2zm-3 2V8c0-1.657-1.343-3-3-3S7 6.343 7 8v6z" />
          </svg>
        }
      />

      <InputGroup
        label="Annual Interest Rate (%)"
        id="interestRate"
        type="number"
        value={interestRate}
        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
        min={0}
        step="0.01"
        placeholder="e.g., 5"
        errorMessage={errors.interestRate}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.004.996a2.002 2.002 0 012.83 0L14 10.17V5h5a2 2 0 012 2v5l1.17-1.17a2.002 2.002 0 010 2.83L12 22l-7.17-7.17a2.002 2.002 0 010-2.83l.83-.83H5a2 2 0 01-2-2V7a2 2 0 012-2h5l-2.17 2.17a2.002 2.002 0 010 2.83L9 14z" />
          </svg>
        }
      />

      <InputGroup
        label="Time Period (Years)"
        id="timePeriod"
        type="number"
        value={timePeriod}
        onChange={(e) => setTimePeriod(parseFloat(e.target.value))}
        min={1}
        step="1"
        placeholder="e.g., 10"
        errorMessage={errors.timePeriod}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />

      <SelectGroup
        label="Compounding Frequency"
        id="compoundingFrequency"
        value={compoundingFrequency}
        onChange={(e) => setCompoundingFrequency(parseInt(e.target.value, 10) as CompoundingFrequency)}
        options={compoundingOptions}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1L21 12m-6-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4M4 12H3a2 2 0 00-2 2v4a2 2 0 002 2h1m5-14v2m6-2v2M9 16h6v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2zm8-2v2m-6-2H6v2a2 2 0 002 2h4a2 2 0 002-2v-2zm-3 2V8c0-1.657-1.343-3-3-3S7 6.343 7 8v6z" />
          </svg>
        }
      />

      {/* New InputGroup for Assumed Inflation Rate */}
      <InputGroup
        label="Assumed Inflation Rate (%) (Optional)"
        id="inflationRate"
        type="number"
        value={inflationRate === 0 ? '' : inflationRate} // Display empty if 0
        onChange={(e) => {
          const value = e.target.value;
          setInflationRate(value === '' ? 0 : parseFloat(value)); // Default to 0 if empty
        }}
        min={0}
        step="0.01"
        placeholder="e.g., 2"
        errorMessage={errors.inflationRate}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM8.25 15.75L15.75 8.25"></path>
          </svg>
        }
      />

      <div className="flex items-center justify-center mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Calculate Future Value
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm;