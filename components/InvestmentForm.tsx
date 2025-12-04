import React, { useState, useCallback } from 'react';
import { CompoundingFrequency, InvestmentInputs, CalculationTarget } from '../types';
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

const CALCULATION_TARGET_OPTIONS = [
  { value: CalculationTarget.FUTURE_VALUE, label: 'Future Value (FV)' },
  { value: CalculationTarget.PRINCIPAL, label: 'Present Value (PV)' },
  { value: CalculationTarget.ANNUAL_INTEREST_RATE, label: 'Annual Interest Rate (r)' },
  { value: CalculationTarget.TIME_PERIOD, label: 'Time Period (t)' },
];

const InvestmentForm: React.FC<InvestmentFormProps> = ({ onCalculate }) => {
  const [calculationTarget, setCalculationTarget] = useState<CalculationTarget>(CalculationTarget.FUTURE_VALUE);

  const [principalInput, setPrincipalInput] = useState<number>(10000);
  const [futureValueInput, setFutureValueInput] = useState<number>(20000);
  const [annualInterestRateInput, setAnnualInterestRateInput] = useState<number>(5);
  const [timePeriodInput, setTimePeriodInput] = useState<number>(10);
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>(
    CompoundingFrequency.ANNUALLY
  );
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [customCurrencySymbol, setCustomCurrencySymbol] = useState<string>('');
  const [inflationRate, setInflationRate] = useState<number>(0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    const checkPositive = (value: number | undefined, key: string, label: string) => {
      if (value === undefined || value <= 0) newErrors[key] = `${label} must be a positive number.`;
    };
    const checkNonNegative = (value: number | undefined, key: string, label: string) => {
      if (value === undefined || value < 0) newErrors[key] = `${label} cannot be negative.`;
    };

    switch (calculationTarget) {
      case CalculationTarget.FUTURE_VALUE:
        checkPositive(principalInput, 'principalInput', 'Principal amount');
        checkNonNegative(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate');
        checkPositive(timePeriodInput, 'timePeriodInput', 'Time period');
        break;
      case CalculationTarget.PRINCIPAL:
        checkPositive(futureValueInput, 'futureValueInput', 'Future value');
        checkNonNegative(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate');
        checkPositive(timePeriodInput, 'timePeriodInput', 'Time period');
        break;
      case CalculationTarget.ANNUAL_INTEREST_RATE:
        checkPositive(principalInput, 'principalInput', 'Principal amount');
        checkPositive(futureValueInput, 'futureValueInput', 'Future value');
        checkPositive(timePeriodInput, 'timePeriodInput', 'Time period');
        if (futureValueInput !== undefined && principalInput !== undefined && futureValueInput < principalInput) {
          newErrors.futureValueInput = 'Future value must be greater than or equal to principal.';
        }
        break;
      case CalculationTarget.TIME_PERIOD:
        checkPositive(principalInput, 'principalInput', 'Principal amount');
        checkPositive(futureValueInput, 'futureValueInput', 'Future value');
        checkPositive(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate');
        if (futureValueInput !== undefined && principalInput !== undefined && futureValueInput < principalInput) {
          newErrors.futureValueInput = 'Future value must be greater than or equal to principal.';
        }
        break;
    }

    checkPositive(compoundingFrequency, 'compoundingFrequency', 'Compounding frequency');
    checkNonNegative(inflationRate, 'inflationRate', 'Inflation rate');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    calculationTarget,
    principalInput,
    futureValueInput,
    annualInterestRateInput,
    timePeriodInput,
    compoundingFrequency,
    inflationRate,
  ]);

  const formatCurrencyValue = useCallback((amount: number | string, code: string, customSymbol?: string) => {
    if (typeof amount !== 'number') return String(amount);
    if (customSymbol && customSymbol.trim() !== '') {
      const formattedNumber = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `${customSymbol.trim()} ${formattedNumber}`;
    } else {
      return amount.toLocaleString(undefined, { style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }, []);

  const getCurrencyPlaceholder = useCallback((code: string, customSymbol?: string) => {
    if (customSymbol && customSymbol.trim() !== '') {
      return `e.g., ${customSymbol.trim()}10,000.00`;
    }
    const currencyInfo = CURRENCY_OPTIONS.find(opt => opt.value === code);
    const symbol = currencyInfo ? currencyInfo.label.split(' ')[1] : '';
    return `e.g., ${symbol}10,000.00`;
  }, []);

  const parseCurrencyInput = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<number>>) => {
    const cleanedValue = value.replace(/[^0-9.-]/g, '');
    const numValue = parseFloat(cleanedValue);
    setter(isNaN(numValue) ? 0 : numValue);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onCalculate({
        calculationTarget,
        principalInput: principalInput,
        futureValueInput: futureValueInput,
        annualInterestRateInput: annualInterestRateInput,
        timePeriodInput: timePeriodInput,
        compoundingFrequency,
        currencyCode: selectedCurrencyCode,
        customCurrencySymbol: customCurrencySymbol.trim() !== '' ? customCurrencySymbol : undefined,
        inflationRate: inflationRate,
      });
    }
  }, [
    calculationTarget, principalInput, futureValueInput, annualInterestRateInput, timePeriodInput,
    compoundingFrequency, selectedCurrencyCode, customCurrencySymbol, inflationRate,
    validate, onCalculate
  ]);


  const compoundingOptions = [
    { value: CompoundingFrequency.ANNUALLY, label: 'Annually' },
    { value: CompoundingFrequency.SEMI_ANNUALLY, label: 'Semi-Annually' },
    { value: CompoundingFrequency.QUARTERLY, label: 'Quarterly' },
    { value: CompoundingFrequency.MONTHLY, label: 'Monthly' },
    { value: CompoundingFrequency.DAILY, label: 'Daily' },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-8 rounded-lg shadow-xl bg-white w-full max-w-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Financial Calculator</h2>

      {/* Solve For */}
      <SelectGroup
        label="Solve For"
        id="calculationTarget"
        value={calculationTarget}
        onChange={(e) => setCalculationTarget(e.target.value as CalculationTarget)}
        options={CALCULATION_TARGET_OPTIONS}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        }
      />

      {/* Currency Selection */}
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

      {/* Custom Currency Symbol Input */}
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

      {/* Principal Amount Input */}
      {calculationTarget !== CalculationTarget.PRINCIPAL && (
        <InputGroup
          label="Principal Amount"
          id="principalInput"
          type="text"
          value={formatCurrencyValue(principalInput, selectedCurrencyCode, customCurrencySymbol)}
          onChange={(e) => parseCurrencyInput(e.target.value, setPrincipalInput)}
          min={0.01}
          step="0.01"
          placeholder={getCurrencyPlaceholder(selectedCurrencyCode, customCurrencySymbol)}
          errorMessage={errors.principalInput}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1L21 12m-6-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4M4 12H3a2 2 0 00-2 2v4a2 2 0 002 2h1m5-14v2m6-2v2M9 16h6v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2zm8-2v2m-6-2H6v2a2 2 0 002 2h4a2 2 0 002-2v-2zm-3 2V8c0-1.657-1.343-3-3-3S7 6.343 7 8v6z" />
            </svg>
          }
        />
      )}

      {/* Future Value Input */}
      {calculationTarget !== CalculationTarget.FUTURE_VALUE && (
        <InputGroup
          label="Future Value"
          id="futureValueInput"
          type="text"
          value={formatCurrencyValue(futureValueInput, selectedCurrencyCode, customCurrencySymbol)}
          onChange={(e) => parseCurrencyInput(e.target.value, setFutureValueInput)}
          min={0.01}
          step="0.01"
          placeholder={getCurrencyPlaceholder(selectedCurrencyCode, customCurrencySymbol)}
          errorMessage={errors.futureValueInput}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1L21 12m-6-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4M4 12H3a2 2 0 00-2 2v4a2 2 0 002 2h1m5-14v2m6-2v2M9 16h6v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2zm8-2v2m-6-2H6v2a2 2 0 002 2h4a2 2 0 002-2v-2zm-3 2V8c0-1.657-1.343-3-3-3S7 6.343 7 8v6z" />
            </svg>
          }
        />
      )}

      {/* Annual Interest Rate Input */}
      {calculationTarget !== CalculationTarget.ANNUAL_INTEREST_RATE && (
        <InputGroup
          label="Annual Interest Rate (%)"
          id="annualInterestRateInput"
          type="number"
          value={annualInterestRateInput}
          onChange={(e) => setAnnualInterestRateInput(parseFloat(e.target.value))}
          min={0}
          step="0.01"
          placeholder="e.g., 5"
          errorMessage={errors.annualInterestRateInput}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.004.996a2.002 2.002 0 012.83 0L14 10.17V5h5a2 2 0 012 2v5l1.17-1.17a2.002 2.002 0 010 2.83L12 22l-7.17-7.17a2.002 2.002 0 010-2.83l.83-.83H5a2 2 0 01-2-2V7a2 2 0 012-2h5l-2.17 2.17a2.002 2.002 0 010 2.83L9 14z" />
            </svg>
          }
        />
      )}

      {/* Time Period Input */}
      {calculationTarget !== CalculationTarget.TIME_PERIOD && (
        <InputGroup
          label="Time Period (Years)"
          id="timePeriodInput"
          type="number"
          value={timePeriodInput}
          onChange={(e) => setTimePeriodInput(parseFloat(e.target.value))}
          min={1}
          step="1"
          placeholder="e.g., 10"
          errorMessage={errors.timePeriodInput}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      )}

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

      <InputGroup
        label="Assumed Inflation Rate (%) (Optional)"
        id="inflationRate"
        type="number"
        value={inflationRate === 0 && (calculationTarget === CalculationTarget.FUTURE_VALUE || calculationTarget === CalculationTarget.PRINCIPAL) ? '' : inflationRate}
        onChange={(e) => {
          const value = e.target.value;
          setInflationRate(value === '' ? 0 : parseFloat(value));
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
          Calculate
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm;