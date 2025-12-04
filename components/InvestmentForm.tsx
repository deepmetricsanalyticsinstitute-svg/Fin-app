

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CompoundingFrequency, InvestmentInputs, CalculationTarget, PaymentFrequency, FormState } from '../types';
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
  { value: CalculationTarget.LOAN_PAYMENT, label: 'Loan Payment' },
];

const PAYMENT_FREQUENCY_OPTIONS = [
  { value: PaymentFrequency.MONTHLY, label: 'Monthly' },
  { value: PaymentFrequency.BI_WEEKLY, label: 'Bi-weekly' },
  { value: PaymentFrequency.WEEKLY, label: 'Weekly' },
  { value: PaymentFrequency.ANNUALLY, label: 'Annually' },
  { value: PaymentFrequency.SEMI_ANNUALLY, label: 'Semi-Annually' },
  { value: PaymentFrequency.QUARTERLY, label: 'Quarterly' },
];

// Default values for form inputs
const DEFAULT_CALC_TARGET = CalculationTarget.FUTURE_VALUE;
const DEFAULT_PRINCIPAL = 10000;
const DEFAULT_FUTURE_VALUE = 20000;
const DEFAULT_ANNUAL_INTEREST_RATE = 5;
const DEFAULT_TIME_PERIOD = 10;
const DEFAULT_LOAN_AMOUNT = 100000;
const DEFAULT_LOAN_INTEREST_RATE = 4.5;
const DEFAULT_LOAN_TERM = 30;
const DEFAULT_LOAN_PAYMENT_FREQUENCY = PaymentFrequency.MONTHLY;
const DEFAULT_COMPOUNDING_FREQUENCY = CompoundingFrequency.ANNUALLY;
const DEFAULT_CURRENCY_CODE = 'USD';
const DEFAULT_CUSTOM_CURRENCY_SYMBOL = '';
const DEFAULT_INFLATION_RATE = 0;

const InvestmentForm: React.FC<InvestmentFormProps> = ({ onCalculate }) => {
  const [calculationTarget, setCalculationTarget] = useState<CalculationTarget>(DEFAULT_CALC_TARGET);
  const [principalInput, setPrincipalInput] = useState<number>(DEFAULT_PRINCIPAL);
  const [futureValueInput, setFutureValueInput] = useState<number>(DEFAULT_FUTURE_VALUE);
  const [annualInterestRateInput, setAnnualInterestRateInput] = useState<number>(DEFAULT_ANNUAL_INTEREST_RATE);
  const [timePeriodInput, setTimePeriodInput] = useState<number>(DEFAULT_TIME_PERIOD);
  const [loanAmount, setLoanAmount] = useState<number>(DEFAULT_LOAN_AMOUNT);
  const [loanInterestRate, setLoanInterestRate] = useState<number>(DEFAULT_LOAN_INTEREST_RATE);
  const [loanTerm, setLoanTerm] = useState<number>(DEFAULT_LOAN_TERM);
  const [loanPaymentFrequency, setLoanPaymentFrequency] = useState<PaymentFrequency>(DEFAULT_LOAN_PAYMENT_FREQUENCY);
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>(DEFAULT_COMPOUNDING_FREQUENCY);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>(DEFAULT_CURRENCY_CODE);
  const [customCurrencySymbol, setCustomCurrencySymbol] = useState<string>(DEFAULT_CUSTOM_CURRENCY_SYMBOL);
  const [inflationRate, setInflationRate] = useState<number>(DEFAULT_INFLATION_RATE);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedInputId, setFocusedInputId] = useState<string | null>(null);

  // Undo/Redo states and refs
  const [history, setHistory] = useState<FormState[]>([]);
  const [future, setFuture] = useState<FormState[]>([]);
  // currentFormStateRef is no longer needed since pushCurrentStateToHistory will directly call getFormStateSnapshot()

  const getFormStateSnapshot = useCallback((): FormState => ({
    calculationTarget, principalInput, futureValueInput, annualInterestRateInput,
    timePeriodInput, loanAmount, loanInterestRate, loanTerm, loanPaymentFrequency,
    compoundingFrequency, selectedCurrencyCode, customCurrencySymbol, inflationRate,
  }), [
    calculationTarget, principalInput, futureValueInput, annualInterestRateInput,
    timePeriodInput, loanAmount, loanInterestRate, loanTerm, loanPaymentFrequency,
    compoundingFrequency, selectedCurrencyCode, customCurrencySymbol, inflationRate,
  ]);

  // Push initial state to history on mount, runs only once
  // This was line 73, error "Expected 1 arguments, but got 0." might be related to
  // this useEffect's dependencies potentially causing re-runs in a bad context.
  // Changing dependencies to [] ensures it runs once on mount.
  useEffect(() => {
    if (history.length === 0) { // Ensure it only runs once
      setHistory([getFormStateSnapshot()]);
    }
  }, []); // Empty dependency array means it runs once on mount

  // This useEffect is no longer needed as pushCurrentStateToHistory will directly call getFormStateSnapshot()
  // useEffect(() => {
  //     currentFormStateRef.current = getFormStateSnapshot();
  // }, [getFormStateSnapshot]);

  const applyFormState = useCallback((state: FormState) => {
    setCalculationTarget(state.calculationTarget);
    setPrincipalInput(state.principalInput);
    setFutureValueInput(state.futureValueInput);
    setAnnualInterestRateInput(state.annualInterestRateInput);
    setTimePeriodInput(state.timePeriodInput);
    setLoanAmount(state.loanAmount);
    setLoanInterestRate(state.loanInterestRate);
    setLoanTerm(state.loanTerm);
    setLoanPaymentFrequency(state.loanPaymentFrequency);
    setCompoundingFrequency(state.compoundingFrequency);
    setSelectedCurrencyCode(state.selectedCurrencyCode);
    setCustomCurrencySymbol(state.customCurrencySymbol);
    setInflationRate(state.inflationRate);
    setErrors({}); // Clear errors when applying history
    setFocusedInputId(null); // Unfocus any input
  }, []); // Dependencies are stable setters

  const pushCurrentStateToHistory = useCallback(() => {
    // Correctly capture the latest state using getFormStateSnapshot()
    const latestSnapshot = getFormStateSnapshot();
    if (!latestSnapshot) return;

    const lastInHistory = history[history.length - 1];
    // Avoid pushing identical consecutive states
    if (lastInHistory && JSON.stringify(latestSnapshot) === JSON.stringify(lastInHistory)) {
      return;
    }

    setHistory(prev => [...prev, latestSnapshot]);
    setFuture([]); // Clear future when a new action is performed
  }, [history, getFormStateSnapshot]);

  const handleUndo = useCallback(() => {
    if (history.length <= 1) return; // Cannot undo beyond initial state

    // The state we are currently looking at (before undo)
    const currentStateSnapshot = getFormStateSnapshot();
    if (!currentStateSnapshot) return;

    // The state we want to revert to
    const previousStateSnapshot = history[history.length - 2];
    if (!previousStateSnapshot) return;

    // 1. Add the current state to the 'future' stack for redo
    setFuture(prev => [currentStateSnapshot, ...prev]);

    // 2. Remove the last state (which is the current one) from history
    setHistory(prev => prev.slice(0, prev.length - 1));

    // 3. Apply the previous state to the form
    applyFormState(previousStateSnapshot);

    setErrors({});
    setFocusedInputId(null);
  }, [history, applyFormState, getFormStateSnapshot]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;

    // The state we want to move forward to
    const nextStateSnapshot = future[0];

    // The state we are currently looking at (before redo)
    const currentStateSnapshot = getFormStateSnapshot();
    if (!currentStateSnapshot) return;

    // 1. Add the current state to the 'history' stack
    setHistory(prev => [...prev, currentStateSnapshot]);

    // 2. Remove the state we just applied from 'future'
    setFuture(prev => prev.slice(1));

    // 3. Apply the next state to the form
    applyFormState(nextStateSnapshot);

    setErrors({});
    setFocusedInputId(null);
  }, [future, applyFormState, getFormStateSnapshot]);


  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    const checkPositive = (value: number | undefined, key: string, label: string) => {
      if (value === undefined || value <= 0) newErrors[key] = `${label} must be a positive number.`;
    };
    const checkNonNegative = (value: number | undefined, key: string, label: string) => {
      if (value === undefined || value < 0) newErrors[key] = `${label} cannot be negative.`;
    };
    const checkValueTooHigh = (value: number | undefined, key: string, label: string, limit: number) => {
      if (value !== undefined && value > limit) newErrors[key] = `${label} seems unusually high (>${limit}).`;
    };

    switch (calculationTarget) {
      case CalculationTarget.FUTURE_VALUE:
        checkPositive(principalInput, 'principalInput', 'Principal amount');
        checkNonNegative(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate');
        checkValueTooHigh(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate', 500);
        checkPositive(timePeriodInput, 'timePeriodInput', 'Time period');
        checkValueTooHigh(timePeriodInput, 'timePeriodInput', 'Time period', 100);
        checkPositive(compoundingFrequency, 'compoundingFrequency', 'Compounding frequency');
        break;
      case CalculationTarget.PRINCIPAL:
        checkPositive(futureValueInput, 'futureValueInput', 'Future value');
        checkNonNegative(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate');
        checkValueTooHigh(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate', 500);
        checkPositive(timePeriodInput, 'timePeriodInput', 'Time period');
        checkValueTooHigh(timePeriodInput, 'timePeriodInput', 'Time period', 100);
        checkPositive(compoundingFrequency, 'compoundingFrequency', 'Compounding frequency');
        break;
      case CalculationTarget.ANNUAL_INTEREST_RATE:
        checkPositive(principalInput, 'principalInput', 'Principal amount');
        checkPositive(futureValueInput, 'futureValueInput', 'Future value');
        checkPositive(timePeriodInput, 'timePeriodInput', 'Time period');
        checkValueTooHigh(timePeriodInput, 'timePeriodInput', 'Time period', 100);
        checkPositive(compoundingFrequency, 'compoundingFrequency', 'Compounding frequency');
        if (futureValueInput !== undefined && principalInput !== undefined && futureValueInput < principalInput) {
          newErrors.futureValueInput = 'Future value must be greater than or equal to principal for a positive interest rate.';
        }
        break;
      case CalculationTarget.TIME_PERIOD:
        checkPositive(principalInput, 'principalInput', 'Principal amount');
        checkPositive(futureValueInput, 'futureValueInput', 'Future value');
        checkPositive(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate');
        checkValueTooHigh(annualInterestRateInput, 'annualInterestRateInput', 'Annual interest rate', 500);
        checkPositive(compoundingFrequency, 'compoundingFrequency', 'Compounding frequency');
        if (futureValueInput !== undefined && principalInput !== undefined && futureValueInput < principalInput) {
          newErrors.futureValueInput = 'Future value must be greater than or equal to principal for a positive time period.';
        }
        break;
      case CalculationTarget.LOAN_PAYMENT:
        checkPositive(loanAmount, 'loanAmount', 'Loan amount');
        checkNonNegative(loanInterestRate, 'loanInterestRate', 'Loan interest rate');
        checkValueTooHigh(loanInterestRate, 'loanInterestRate', 'Loan interest rate', 500);
        checkPositive(loanTerm, 'loanTerm', 'Loan term');
        checkValueTooHigh(loanTerm, 'loanTerm', 'Loan term', 100);
        break;
    }

    if (calculationTarget !== CalculationTarget.LOAN_PAYMENT) {
      checkNonNegative(inflationRate, 'inflationRate', 'Inflation rate');
      checkValueTooHigh(inflationRate, 'inflationRate', 'Inflation rate', 100);
    }

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
    loanAmount,
    loanInterestRate,
    loanTerm,
    loanPaymentFrequency,
  ]);

  const formatNumberForInputDisplay = useCallback((amount: number | string) => {
    if (typeof amount !== 'number') return String(amount);
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const getCurrencyPlaceholder = useCallback((code: string, customSymbol?: string) => {
    if (customSymbol && customSymbol.trim() !== '') {
      return `e.g., ${customSymbol.trim()}10,000.00`;
    }
    try {
      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      const parts = formatter.formatToParts(0);
      const symbolPart = parts.find(part => part.type === 'currency');
      const symbol = symbolPart ? symbolPart.value : code;
      return `e.g., ${symbol}10,000.00`;
    } catch (e) {
      console.warn('Error getting currency symbol for placeholder:', e);
      return `e.g., $10,000.00`;
    }
  }, []);

  const parseCurrencyInput = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<number>>) => {
    const cleanedValue = value.replace(/[^0-9.-]/g, '');
    const numValue = parseFloat(cleanedValue);
    setter(isNaN(numValue) ? 0 : numValue);
  }, []);

  const parseNumberInput = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<number>>, minAllowed: number = 0) => {
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(cleanedValue);
    setter(isNaN(numValue) || value === '' ? minAllowed : numValue);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const commonInputs = {
        calculationTarget,
        compoundingFrequency,
        currencyCode: selectedCurrencyCode,
        customCurrencySymbol: customCurrencySymbol.trim() !== '' ? customCurrencySymbol : undefined,
      };

      let inputs: InvestmentInputs;

      switch (calculationTarget) {
        case CalculationTarget.FUTURE_VALUE:
        case CalculationTarget.PRINCIPAL:
        case CalculationTarget.ANNUAL_INTEREST_RATE:
        case CalculationTarget.TIME_PERIOD:
          inputs = {
            ...commonInputs,
            principalInput: principalInput,
            futureValueInput: futureValueInput,
            annualInterestRateInput: annualInterestRateInput,
            timePeriodInput: timePeriodInput,
            inflationRate: inflationRate,
          };
          break;
        case CalculationTarget.LOAN_PAYMENT:
          inputs = {
            ...commonInputs,
            loanAmountInput: loanAmount,
            loanInterestRateInput: loanInterestRate,
            loanTermInput: loanTerm,
            paymentFrequency: loanPaymentFrequency,
          };
          break;
        default:
          throw new Error("Unhandled calculation target");
      }

      onCalculate(inputs);
    }
  }, [
    calculationTarget, principalInput, futureValueInput, annualInterestRateInput, timePeriodInput,
    loanAmount, loanInterestRate, loanTerm, loanPaymentFrequency,
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

  const initialFormState: FormState = {
    calculationTarget: DEFAULT_CALC_TARGET,
    principalInput: DEFAULT_PRINCIPAL,
    futureValueInput: DEFAULT_FUTURE_VALUE,
    annualInterestRateInput: DEFAULT_ANNUAL_INTEREST_RATE,
    timePeriodInput: DEFAULT_TIME_PERIOD,
    loanAmount: DEFAULT_LOAN_AMOUNT,
    loanInterestRate: DEFAULT_LOAN_INTEREST_RATE,
    loanTerm: DEFAULT_LOAN_TERM,
    loanPaymentFrequency: DEFAULT_LOAN_PAYMENT_FREQUENCY,
    compoundingFrequency: DEFAULT_COMPOUNDING_FREQUENCY,
    selectedCurrencyCode: DEFAULT_CURRENCY_CODE,
    customCurrencySymbol: DEFAULT_CUSTOM_CURRENCY_SYMBOL,
    inflationRate: DEFAULT_INFLATION_RATE,
  };

  const handleReset = useCallback(() => {
    applyFormState(initialFormState); // Apply the original initial state
    setErrors({});
    setFocusedInputId(null);
    setHistory([initialFormState]); // Reset history to just the initial state
    setFuture([]); // Clear future
  }, [applyFormState, initialFormState]); // Depend on applyFormState and initialFormState

  const isInvestmentMode = calculationTarget !== CalculationTarget.LOAN_PAYMENT;

  return (
    <form onSubmit={handleSubmit} className="p-8 rounded-lg shadow-xl bg-white w-full max-w-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Financial Calculator</h2>

      {/* Undo/Redo Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          type="button"
          onClick={handleUndo}
          disabled={history.length <= 1} // Disable if only initial state or empty
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.000001,8.000001 L8,12 L12.000001,16 M6.000001,12 L19.000001,12" transform="matrix(-1 0 0 1 25 0)"></path>
          </svg>
          Undo
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={future.length === 0}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Redo
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.000001,8.000001 L8,12 L12.000001,16 M6.000001,12 L19.000001,12"></path>
          </svg>
        </button>
      </div>


      {/* Solve For */}
      <SelectGroup
        label="Solve For"
        id="calculationTarget"
        value={calculationTarget}
        onChange={(e) => {
          setCalculationTarget(e.target.value as CalculationTarget);
          pushCurrentStateToHistory(); // Push history after state updates (ref updates)
        }}
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
        onChange={(e) => {
          setSelectedCurrencyCode(e.target.value);
          pushCurrentStateToHistory();
        }}
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
        onBlur={pushCurrentStateToHistory} // Push on blur for text inputs
        placeholder="e.g., £, €, Kr"
        errorMessage={errors.customCurrencySymbol}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
      />

      {isInvestmentMode ? (
        <>
          {/* Principal Amount Input */}
          {calculationTarget !== CalculationTarget.PRINCIPAL && (
            <InputGroup
              label="Principal Amount"
              id="principalInput"
              type="text"
              value={focusedInputId === 'principalInput' ? principalInput.toString() : formatNumberForInputDisplay(principalInput)}
              onChange={(e) => parseCurrencyInput(e.target.value, setPrincipalInput)}
              placeholder={getCurrencyPlaceholder(selectedCurrencyCode, customCurrencySymbol)}
              errorMessage={errors.principalInput}
              onFocus={() => setFocusedInputId('principalInput')}
              onBlur={() => {setFocusedInputId(null); pushCurrentStateToHistory();}}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5Z" />
                  <path fillRule="evenodd" d="M8.25 0A9.75 9.75 0 002.25 6H0v1.5h2.25A9.75 9.75 0 000 12c0 2.296.84 4.417 2.25 6H0v1.5h2.25A9.75 9.75 0 008.25 24h7.5A9.75 9.75 0 0021.75 18H24v-1.5h-2.25A9.75 9.75 0 0024 12c0-2.296-.84-4.417-2.25-6H24V4.5h-2.25A9.75 9.75 0 0015.75 0h-7.5ZM4.5 7.5a8.25 8.25 0 1016.5 0v.75a8.25 8.25 0 00-16.5 0V7.5Zm-.75 4.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75Zm16.5 0a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75Z" clipRule="evenodd" />
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
              value={focusedInputId === 'futureValueInput' ? futureValueInput.toString() : formatNumberForInputDisplay(futureValueInput)}
              onChange={(e) => parseCurrencyInput(e.target.value, setFutureValueInput)}
              placeholder={getCurrencyPlaceholder(selectedCurrencyCode, customCurrencySymbol)}
              errorMessage={errors.futureValueInput}
              onFocus={() => setFocusedInputId('futureValueInput')}
              onBlur={() => {setFocusedInputId(null); pushCurrentStateToHistory();}}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5Z" />
                  <path fillRule="evenodd" d="M8.25 0A9.75 9.75 0 002.25 6H0v1.5h2.25A9.75 9.75 0 000 12c0 2.296.84 4.417 2.25 6H0v1.5h2.25A9.75 9.75 0 008.25 24h7.5A9.75 9.75 0 0021.75 18H24v-1.5h-2.25A9.75 9.75 0 0024 12c0-2.296-.84-4.417-2.25-6H24V4.5h-2.25A9.75 9.75 0 0015.75 0h-7.5ZM4.5 7.5a8.25 8.25 0 1016.5 0v.75a8.25 8.25 0 00-16.5 0V7.5Zm-.75 4.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75Zm16.5 0a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75Z" clipRule="evenodd" />
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
              value={annualInterestRateInput === 0 && (focusedInputId !== 'annualInterestRateInput') ? '' : annualInterestRateInput}
              onChange={(e) => parseNumberInput(e.target.value, setAnnualInterestRateInput)}
              min={0}
              step="0.01"
              placeholder="e.g., 5"
              errorMessage={errors.annualInterestRateInput}
              onFocus={() => setFocusedInputId('annualInterestRateInput')}
              onBlur={() => {setFocusedInputId(null); pushCurrentStateToHistory();}}
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
              value={timePeriodInput === 0 && (focusedInputId !== 'timePeriodInput') ? '' : timePeriodInput}
              onChange={(e) => parseNumberInput(e.target.value, setTimePeriodInput, 1)}
              min={1}
              step="1"
              placeholder="e.g., 10"
              errorMessage={errors.timePeriodInput}
              onFocus={() => setFocusedInputId('timePeriodInput')}
              onBlur={() => {setFocusedInputId(null); pushCurrentStateToHistory();}}
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
            onChange={(e) => {
              setCompoundingFrequency(parseInt(e.target.value, 10) as CompoundingFrequency);
              pushCurrentStateToHistory();
            }}
            options={compoundingOptions}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M12 10c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a9 9 0 110 0zm0 0l-1.5 1.5"></path>
                </svg>
            }
          />

          <InputGroup
            label="Assumed Inflation Rate (%) (Optional)"
            id="inflationRate"
            type="number"
            value={inflationRate === 0 && (focusedInputId !== 'inflationRate') ? '' : inflationRate}
            onChange={(e) => parseNumberInput(e.target.value, setInflationRate)}
            min={0}
            step="0.01"
            placeholder="e.g., 2"
            errorMessage={errors.inflationRate}
            onFocus={() => setFocusedInputId('inflationRate')}
            onBlur={() => {setFocusedInputId(null); pushCurrentStateToHistory();}}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM8.25 15.75L15.75 8.25"></path>
              </svg>
            }
          />
        </>
      ) : (
        <>
          {/* Loan Amount Input */}
          <InputGroup
            label="Loan Amount"
            id="loanAmount"
            type="text"
            value={focusedInputId === 'loanAmount' ? loanAmount.toString() : formatNumberForInputDisplay(loanAmount)}
            onChange={(e) => parseCurrencyInput(e.target.value, setLoanAmount)}
            placeholder={getCurrencyPlaceholder(selectedCurrencyCode, customCurrencySymbol)}
            errorMessage={errors.loanAmount}
            onFocus={() => setFocusedInputId('loanAmount')}
            onBlur={() => {setFocusedInputId(null); pushCurrentStateToHistory();}}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5Z" />
                <path fillRule="evenodd" d="M8.25 0A9.75 9.75 0 002.25 6H0v1.5h2.25A9.75 9.75 0 000 12c0 2.296.84 4.417 2.25 6H0v1.5h2.25A9.75 9.75 0 008.25 24h7.5A9.75 9.75 0 0021.75 18H24v-1.5h-2.25A9.75 9.75 0 0024 12c0-2.296-.84-4.417-2.25-6H24V4.5h-2.25A9.75 9.75 0 0015.75 0h-7.5ZM4.5 7.5a8.25 8.25 0 1016.5 0v.75a8.25 8.25 0 00-16.5 0V7.5Zm-.75 4.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75Zm16.5 0a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75Z" clipRule="evenodd" />
              </svg>
            }
          />

          {/* Loan Interest Rate Input */}
          <InputGroup
            label="Annual Interest Rate (%)"
            id="loanInterestRate"
            type="number"
            value={loanInterestRate === 0 && (focusedInputId !== 'loanInterestRate') ? '' : loanInterestRate}
            onChange={(e) => parseNumberInput(e.target.value, setLoanInterestRate)}
            min={0}
            step="0.01"
            placeholder="e.g., 4.5"
            errorMessage={errors.loanInterestRate}
            onFocus={() => setFocusedInputId('loanInterestRate')}
            onBlur={() => {setFocusedInputId(null); pushCurrentStateToHistory();}}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.004.996a2.002 2.002 0 012.83 0L14 10.17V5h5a2 2 0 012 2v5l1.17-1.17a2.002 2.002 0 010 2.83L12 22l-7.17-7.17a2.002 2.002 0 010-2.83l.83-.83H5a2 2 0 01-2-2V7a2 2 0 012-2h5l-2.17 2.17a2.002 2.002 0 010 2.83L9 14z" />
              </svg>
            }
          />

          {/* Loan Term Input */}
          <InputGroup
            label="Loan Term (Years)"
            id="loanTerm"
            type="number"
            value={loanTerm === 0 && (focusedInputId !== 'loanTerm') ? '' : loanTerm}
            onChange={(e) => parseNumberInput(e.target.value, setLoanTerm, 1)}
            min={1}
            step="1"
            placeholder="e.g., 30"
            errorMessage={errors.loanTerm}
            onFocus={() => setFocusedInputId('loanTerm')}
            onBlur={() => {setFocusedInputId(null); pushCurrentStateToHistory();}}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />

          {/* Loan Payment Frequency Input */}
          <SelectGroup
            label="Payment Frequency"
            id="loanPaymentFrequency"
            value={loanPaymentFrequency}
            onChange={(e) => {
              setLoanPaymentFrequency(parseInt(e.target.value, 10) as PaymentFrequency);
              pushCurrentStateToHistory();
            }}
            options={PAYMENT_FREQUENCY_OPTIONS}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </>
      )}

      <div className="flex items-center justify-center mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-full focus:outline-none focus:ring-4 focus:ring-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Reset Form
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm;