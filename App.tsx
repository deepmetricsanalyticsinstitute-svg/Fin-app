import React, { useState, useCallback } from 'react';
import InvestmentForm from './components/InvestmentForm';
import ResultsDisplay from './components/ResultsDisplay';
import { calculateFutureValue } from './services/calculationService';
import { CalculationResult, InvestmentInputs } from './types';

const App: React.FC = () => {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const handleCalculate = useCallback((inputs: InvestmentInputs) => {
    const result = calculateFutureValue(inputs);
    setCalculationResult(result);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center p-4">
      <InvestmentForm onCalculate={handleCalculate} />
      <ResultsDisplay
        futureValue={calculationResult?.futureValue ?? null}
        errorMessage={calculationResult?.error}
        currencyCode={calculationResult?.currencyCode}
        customCurrencySymbol={calculationResult?.customCurrencySymbol}
        growthData={calculationResult?.growthData}
        realFutureValue={calculationResult?.realFutureValue} // Pass realFutureValue
      />
    </div>
  );
};

export default App;