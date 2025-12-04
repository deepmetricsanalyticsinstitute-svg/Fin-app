import React, { useState, useCallback } from 'react';
import InvestmentForm from './components/InvestmentForm';
import ResultsDisplay from './components/ResultsDisplay';
import { performFinancialCalculation } from './services/calculationService'; // Updated import
import { CalculationResult, InvestmentInputs } from './types';

const App: React.FC = () => {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const handleCalculate = useCallback((inputs: InvestmentInputs) => {
    const result = performFinancialCalculation(inputs); // Updated function call
    setCalculationResult(result);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center p-4">
      <InvestmentForm onCalculate={handleCalculate} />
      <ResultsDisplay
        calculationTarget={calculationResult?.calculationTarget} // Pass calculation target
        calculatedFutureValue={calculationResult?.calculatedFutureValue ?? null}
        calculatedPrincipal={calculationResult?.calculatedPrincipal ?? null}
        calculatedAnnualInterestRate={calculationResult?.calculatedAnnualInterestRate ?? null}
        calculatedTimePeriod={calculationResult?.calculatedTimePeriod ?? null}
        errorMessage={calculationResult?.error}
        currencyCode={calculationResult?.currencyCode}
        customCurrencySymbol={calculationResult?.customCurrencySymbol}
        growthData={calculationResult?.growthData}
        realFutureValue={calculationResult?.realFutureValue ?? null}
      />
    </div>
  );
};

export default App;