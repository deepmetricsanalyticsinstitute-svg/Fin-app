
import React, { useState, useCallback } from 'react';
import InvestmentForm from './components/InvestmentForm';
import ResultsDisplay from './components/ResultsDisplay';
import { performFinancialCalculation } from './services/calculationService';
import { CalculationResult, InvestmentInputs, LoanScenario, InvestmentScenario } from './types';

const App: React.FC = () => {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [currentCalculatedInputs, setCurrentCalculatedInputs] = useState<InvestmentInputs | null>(null);
  
  // Loan Comparison States
  const [savedLoanScenarios, setSavedLoanScenarios] = useState<LoanScenario[]>([]);
  const [selectedScenarioForComparison, setSelectedScenarioForComparison] = useState<string[]>([]);

  // Investment Comparison States
  const [savedInvestmentScenarios, setSavedInvestmentScenarios] = useState<InvestmentScenario[]>([]);
  const [selectedInvestmentForComparison, setSelectedInvestmentForComparison] = useState<string[]>([]);


  const handleCalculate = useCallback((inputs: InvestmentInputs) => {
    const result = performFinancialCalculation(inputs);
    setCalculationResult(result);
    setCurrentCalculatedInputs(inputs); // Save the inputs that produced this result
  }, []);

  // Loan Comparison Callbacks
  const addLoanScenario = useCallback((scenario: LoanScenario) => {
    setSavedLoanScenarios((prev) => [...prev, scenario]);
  }, []);

  const removeLoanScenario = useCallback((id: string) => {
    setSavedLoanScenarios((prev) => prev.filter((s) => s.id !== id));
    setSelectedScenarioForComparison((prev) => prev.filter((_id) => _id !== id)); // Also remove from comparison if selected
  }, []);

  const toggleScenarioForComparison = useCallback((id: string) => {
    setSelectedScenarioForComparison((prev) =>
      prev.includes(id) ? prev.filter((_id) => _id !== id) : [...prev, id]
    );
  }, []);

  // Investment Comparison Callbacks
  const addInvestmentScenario = useCallback((scenario: InvestmentScenario) => {
    setSavedInvestmentScenarios((prev) => [...prev, scenario]);
  }, []);

  const removeInvestmentScenario = useCallback((id: string) => {
    setSavedInvestmentScenarios((prev) => prev.filter((s) => s.id !== id));
    setSelectedInvestmentForComparison((prev) => prev.filter((_id) => _id !== id)); // Also remove from comparison if selected
  }, []);

  const toggleInvestmentScenarioForComparison = useCallback((id: string) => {
    setSelectedInvestmentForComparison((prev) =>
      prev.includes(id) ? prev.filter((_id) => _id !== id) : [...prev, id]
    );
  }, []);


  return (
    <div className="flex flex-col lg:flex-row items-center justify-center p-4">
      <InvestmentForm onCalculate={handleCalculate} />
      <ResultsDisplay
        calculationTarget={calculationResult?.calculationTarget}
        calculatedFutureValue={calculationResult?.calculatedFutureValue ?? null}
        calculatedPrincipal={calculationResult?.calculatedPrincipal ?? null}
        calculatedAnnualInterestRate={calculationResult?.calculatedAnnualInterestRate ?? null}
        calculatedTimePeriod={calculationResult?.calculatedTimePeriod ?? null}
        calculatedMonthlyPayment={calculationResult?.calculatedMonthlyPayment ?? null}
        calculatedTotalInterestPaid={calculationResult?.calculatedTotalInterestPaid ?? null}
        calculatedTotalAmountPaid={calculationResult?.calculatedTotalAmountPaid ?? null}
        errorMessage={calculationResult?.error}
        currencyCode={calculationResult?.currencyCode}
        customCurrencySymbol={calculationResult?.customCurrencySymbol}
        growthData={calculationResult?.growthData}
        realFutureValue={calculationResult?.realFutureValue ?? null}
        amortizationSchedule={calculationResult?.amortizationSchedule}
        
        // Props for loan comparison feature
        currentCalculatedInputs={currentCalculatedInputs}
        onSaveLoanScenario={addLoanScenario}
        savedLoanScenarios={savedLoanScenarios}
        onRemoveLoanScenario={removeLoanScenario}
        selectedScenarioForComparison={selectedScenarioForComparison}
        onToggleScenarioForComparison={toggleScenarioForComparison}

        // Props for investment comparison feature
        onSaveInvestmentScenario={addInvestmentScenario}
        savedInvestmentScenarios={savedInvestmentScenarios}
        onRemoveInvestmentScenario={removeInvestmentScenario}
        selectedInvestmentForComparison={selectedInvestmentForComparison}
        onToggleInvestmentScenarioForComparison={toggleInvestmentScenarioForComparison}
      />
    </div>
  );
};

export default App;
