
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { CalculationTarget, AmortizationEntry, LoanScenario, InvestmentInputs } from '../types';

// Declare Chart globally as it's loaded via CDN
declare global {
  interface Window {
    Chart: any; // Chart.js type can be more specific but `any` for quick integration
  }
}

interface ResultsDisplayProps {
  calculationTarget?: CalculationTarget; // New: To determine what to display
  calculatedFutureValue?: number | null;
  calculatedPrincipal?: number | null;
  calculatedAnnualInterestRate?: number | null;
  calculatedTimePeriod?: number | null;
  calculatedMonthlyPayment?: number | null;
  calculatedTotalInterestPaid?: number | null;
  calculatedTotalAmountPaid?: number | null;
  errorMessage?: string;
  currencyCode?: string;
  customCurrencySymbol?: string;
  growthData?: { year: number; value: number; }[];
  realFutureValue?: number | null;
  amortizationSchedule?: AmortizationEntry[];
  
  // New props for loan comparison
  currentCalculatedInputs?: InvestmentInputs | null; // Inputs that produced the current result
  onSaveLoanScenario: (scenario: LoanScenario) => void;
  savedLoanScenarios: LoanScenario[];
  onRemoveLoanScenario: (id: string) => void;
  selectedScenarioForComparison: string[];
  onToggleScenarioForComparison: (id: string) => void;
}

const ANIMATION_DURATION_MS = 1000; // Animation duration in milliseconds

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  calculationTarget,
  calculatedFutureValue = null,
  calculatedPrincipal = null,
  calculatedAnnualInterestRate = null,
  calculatedTimePeriod = null,
  calculatedMonthlyPayment = null,
  calculatedTotalInterestPaid = null,
  calculatedTotalAmountPaid = null,
  errorMessage,
  currencyCode = 'USD',
  customCurrencySymbol,
  growthData,
  realFutureValue = null,
  amortizationSchedule,

  // Loan comparison props
  currentCalculatedInputs,
  onSaveLoanScenario,
  savedLoanScenarios,
  onRemoveLoanScenario,
  selectedScenarioForComparison,
  onToggleScenarioForComparison,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null); // To store the Chart.js instance

  // State for animated values
  const [animatedFutureValue, setAnimatedFutureValue] = useState(0);
  const [animatedRealFutureValue, setAnimatedRealFutureValue] = useState(0);
  const [animatedPrincipal, setAnimatedPrincipal] = useState(0);
  const [animatedAnnualInterestRate, setAnimatedAnnualInterestRate] = useState(0);
  const [animatedTimePeriod, setAnimatedTimePeriod] = useState(0);
  const [animatedMonthlyPayment, setAnimatedMonthlyPayment] = useState(0);
  const [animatedTotalInterestPaid, setAnimatedTotalInterestPaid] = useState(0);
  const [animatedTotalAmountPaid, setAnimatedTotalAmountPaid] = useState(0);

  const formatCurrency = useCallback((amount: number, code: string, customSymbol?: string) => {
    if (customSymbol && customSymbol.trim() !== '') {
      const formattedNumber = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `${customSymbol.trim()} ${formattedNumber}`;
    } else {
      return amount.toLocaleString(undefined, { style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }, []);

  const formatPercentage = useCallback((amount: number) => {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  }, []);

  const formatYears = useCallback((amount: number) => {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} years`;
  }, []);

  // Generic animation hook
  const useCountUpAnimation = (targetValue: number | null, setAnimatedValue: React.Dispatch<React.SetStateAction<number>>) => {
    useEffect(() => {
      if (targetValue !== null && targetValue >= 0) {
        let startTimestamp: DOMHighResTimeStamp;
        const startValue = 0;

        const animate = (currentTime: DOMHighResTimeStamp) => {
          if (!startTimestamp) startTimestamp = currentTime;
          const progress = (currentTime - startTimestamp) / ANIMATION_DURATION_MS;

          if (progress < 1) {
            const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease-in-out
            setAnimatedValue(startValue + (targetValue - startValue) * easedProgress);
            requestAnimationFrame(animate);
          } else {
            setAnimatedValue(targetValue);
          }
        };

        const animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
      } else {
        setAnimatedValue(0); // Reset if target value is not valid
      }
    }, [targetValue, setAnimatedValue]);
  };

  useCountUpAnimation(calculatedFutureValue, setAnimatedFutureValue);
  useCountUpAnimation(realFutureValue, setAnimatedRealFutureValue);
  useCountUpAnimation(calculatedPrincipal, setAnimatedPrincipal);
  useCountUpAnimation(calculatedAnnualInterestRate, setAnimatedAnnualInterestRate);
  useCountUpAnimation(calculatedTimePeriod, setAnimatedTimePeriod);
  useCountUpAnimation(calculatedMonthlyPayment, setAnimatedMonthlyPayment);
  useCountUpAnimation(calculatedTotalInterestPaid, setAnimatedTotalInterestPaid);
  useCountUpAnimation(calculatedTotalAmountPaid, setAnimatedTotalAmountPaid);


  useEffect(() => {
    // Only render chart if calculation target is Future Value and growth data exists
    if (calculationTarget === CalculationTarget.FUTURE_VALUE && chartRef.current && growthData && growthData.length > 0 && window.Chart) {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy existing chart before creating a new one
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: growthData.map(data => data.year),
            datasets: [
              {
                label: 'Investment Value',
                data: growthData.map(data => data.value),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Investment Growth Over Time (Nominal)',
                font: {
                  size: 16,
                },
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += formatCurrency(context.parsed.y, currencyCode, customCurrencySymbol);
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Year',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Value',
                },
                ticks: {
                  callback: function(value: string | number) {
                    return formatCurrency(parseFloat(value.toString()), currencyCode, customCurrencySymbol);
                  }
                }
              },
            },
          },
        });
      }
    } else {
      // Destroy chart if not calculating FV or no growth data
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [calculationTarget, growthData, currencyCode, customCurrencySymbol, formatCurrency]);

  const createCurrentLoanScenario = useCallback((): LoanScenario | null => {
    if (
      calculationTarget === CalculationTarget.LOAN_PAYMENT &&
      calculatedMonthlyPayment !== null &&
      currentCalculatedInputs?.loanAmountInput !== undefined &&
      currentCalculatedInputs?.loanInterestRateInput !== undefined &&
      currentCalculatedInputs?.loanTermInput !== undefined
    ) {
      const inputsForScenario = {
        loanAmountInput: currentCalculatedInputs.loanAmountInput,
        loanInterestRateInput: currentCalculatedInputs.loanInterestRateInput,
        loanTermInput: currentCalculatedInputs.loanTermInput,
        currencyCode: currentCalculatedInputs.currencyCode,
        customCurrencySymbol: currentCalculatedInputs.customCurrencySymbol,
      };

      const resultForScenario = {
        calculatedMonthlyPayment: calculatedMonthlyPayment,
        calculatedTotalInterestPaid: calculatedTotalInterestPaid || 0,
        calculatedTotalAmountPaid: calculatedTotalAmountPaid || 0,
        currencyCode: currencyCode,
        customCurrencySymbol: customCurrencySymbol,
      };

      return {
        id: Date.now().toString(),
        name: `Loan ${savedLoanScenarios.length + 1}`,
        inputs: inputsForScenario,
        result: resultForScenario,
      };
    }
    return null;
  }, [
    calculationTarget, calculatedMonthlyPayment, calculatedTotalInterestPaid, calculatedTotalAmountPaid,
    currencyCode, customCurrencySymbol, currentCalculatedInputs, savedLoanScenarios.length
  ]);

  const handleSaveClick = () => {
    const currentScenario = createCurrentLoanScenario();
    if (currentScenario) {
      const scenarioName = prompt('Enter a name for this loan scenario:', currentScenario.name);
      if (scenarioName !== null && scenarioName.trim() !== '') {
        onSaveLoanScenario({ ...currentScenario, name: scenarioName.trim() });
      } else if (scenarioName === null) {
        // User cancelled
      } else {
        alert('Scenario name cannot be empty.');
      }
    }
  };


  const renderCalculatedValue = () => {
    switch (calculationTarget) {
      case CalculationTarget.FUTURE_VALUE:
        if (calculatedFutureValue !== null && calculatedFutureValue > 0) {
          return (
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Your investment will be worth (Nominal):</p>
              <p className="text-5xl font-extrabold text-blue-700 leading-tight">
                {formatCurrency(animatedFutureValue, currencyCode, customCurrencySymbol)}
              </p>

              {realFutureValue !== null && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-lg text-gray-700 mb-2">Real future value (adjusted for inflation):</p>
                  <p className="text-4xl font-extrabold text-green-700 leading-tight">
                    {formatCurrency(animatedRealFutureValue, currencyCode, customCurrencySymbol)}
                  </p>
                  <p className="text-gray-500 mt-2 text-sm">
                    This value reflects your purchasing power after inflation.
                  </p>
                </div>
              )}

              <p className="text-gray-500 mt-4 text-sm">
                This is the estimated future value of your investment.
              </p>
              {growthData && growthData.length > 0 && (
                <div className="mt-8">
                  <div className="relative h-64 w-full">
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>
              )}
            </div>
          );
        }
        break;
      case CalculationTarget.PRINCIPAL:
        if (calculatedPrincipal !== null && calculatedPrincipal > 0) {
          return (
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">You need to invest:</p>
              <p className="text-5xl font-extrabold text-blue-700 leading-tight">
                {formatCurrency(animatedPrincipal, currencyCode, customCurrencySymbol)}
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                This is the present value required to reach your target future value.
              </p>
            </div>
          );
        }
        break;
      case CalculationTarget.ANNUAL_INTEREST_RATE:
        if (calculatedAnnualInterestRate !== null && calculatedAnnualInterestRate >= 0) {
          return (
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Required Annual Interest Rate:</p>
              <p className="text-5xl font-extrabold text-blue-700 leading-tight">
                {formatPercentage(animatedAnnualInterestRate)}
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                This is the annual interest rate needed to achieve your target.
              </p>
            </div>
          );
        }
        break;
      case CalculationTarget.TIME_PERIOD:
        if (calculatedTimePeriod !== null && calculatedTimePeriod >= 0) {
          return (
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Time Period Required:</p>
              <p className="text-5xl font-extrabold text-blue-700 leading-tight">
                {formatYears(animatedTimePeriod)}
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                This is the number of years required to reach your target future value.
              </p>
            </div>
          );
        }
        break;
      case CalculationTarget.LOAN_PAYMENT:
        if (calculatedMonthlyPayment !== null && calculatedMonthlyPayment > 0) {
          return (
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Monthly Payment:</p>
              <p className="text-5xl font-extrabold text-blue-700 leading-tight mb-6">
                {formatCurrency(animatedMonthlyPayment, currencyCode, customCurrencySymbol)}
              </p>

              <p className="text-lg text-gray-700 mb-2">Total Amount Paid:</p>
              <p className="text-3xl font-bold text-blue-600 leading-tight mb-6">
                {formatCurrency(animatedTotalAmountPaid, currencyCode, customCurrencySymbol)}
              </p>

              <p className="text-lg text-gray-700 mb-2">Total Interest Paid:</p>
              <p className="text-3xl font-bold text-red-600 leading-tight">
                {formatCurrency(animatedTotalInterestPaid, currencyCode, customCurrencySymbol)}
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                These are the estimated payments for your loan.
              </p>
            </div>
          );
        }
        break;
      default:
        // No calculation target selected or invalid state
        return null;
    }
    return null; // Fallback for invalid states for specific targets
  };


  return (
    <div className="p-8 rounded-lg shadow-xl bg-white w-full max-w-lg mt-8 sm:mt-0 lg:ml-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Results</h2>

      {errorMessage ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{errorMessage}</span>
        </div>
      ) : (
        <>
          {renderCalculatedValue()}

          {/* Save Loan Scenario Button */}
          {calculationTarget === CalculationTarget.LOAN_PAYMENT && calculatedMonthlyPayment !== null && (
            <div className="text-center mt-6">
              <button
                onClick={handleSaveClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Save This Loan Scenario
              </button>
            </div>
          )}

          {/* Saved Loan Scenarios List */}
          {savedLoanScenarios.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Saved Loan Scenarios</h3>
              <div className="space-y-4">
                {savedLoanScenarios.map((scenario) => (
                  <div key={scenario.id} className="p-4 bg-gray-50 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{scenario.name}</h4>
                      <p className="text-sm text-gray-600">
                        Monthly: {formatCurrency(scenario.result.calculatedMonthlyPayment || 0, scenario.result.currencyCode, scenario.result.customCurrencySymbol)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Interest: {formatCurrency(scenario.result.calculatedTotalInterestPaid || 0, scenario.result.currencyCode, scenario.result.customCurrencySymbol)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedScenarioForComparison.includes(scenario.id)}
                        onChange={() => onToggleScenarioForComparison(scenario.id)}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        title="Select for comparison"
                      />
                      <button
                        onClick={() => onRemoveLoanScenario(scenario.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove scenario"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loan Comparison Table */}
          {selectedScenarioForComparison.length > 1 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Loan Comparison</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                      {selectedScenarioForComparison.map(id => {
                        const scenario = savedLoanScenarios.find(s => s.id === id);
                        return scenario ? (
                          <th key={id} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {scenario.name}
                          </th>
                        ) : null;
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Monthly Payment */}
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Monthly Payment</td>
                      {selectedScenarioForComparison.map(id => {
                        const scenario = savedLoanScenarios.find(s => s.id === id);
                        return scenario ? (
                          <td key={`${id}-monthly`} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {formatCurrency(scenario.result.calculatedMonthlyPayment || 0, scenario.result.currencyCode, scenario.result.customCurrencySymbol)}
                          </td>
                        ) : null;
                      })}
                    </tr>
                    {/* Total Interest Paid */}
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Total Interest Paid</td>
                      {selectedScenarioForComparison.map(id => {
                        const scenario = savedLoanScenarios.find(s => s.id === id);
                        return scenario ? (
                          <td key={`${id}-interest`} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {formatCurrency(scenario.result.calculatedTotalInterestPaid || 0, scenario.result.currencyCode, scenario.result.customCurrencySymbol)}
                          </td>
                        ) : null;
                      })}
                    </tr>
                    {/* Total Amount Paid */}
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Total Amount Paid</td>
                      {selectedScenarioForComparison.map(id => {
                        const scenario = savedLoanScenarios.find(s => s.id === id);
                        return scenario ? (
                          <td key={`${id}-total`} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {formatCurrency(scenario.result.calculatedTotalAmountPaid || 0, scenario.result.currencyCode, scenario.result.customCurrencySymbol)}
                          </td>
                        ) : null;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Amortization Schedule (for the *currently displayed* loan) */}
          {calculationTarget === CalculationTarget.LOAN_PAYMENT && amortizationSchedule && amortizationSchedule.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Amortization Schedule</h3>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pmt #</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starting Balance</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {amortizationSchedule.map((entry) => (
                      <tr key={entry.paymentNumber}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{entry.paymentNumber}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(entry.startingBalance, currencyCode, customCurrencySymbol)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600">{formatCurrency(entry.interestPaid, currencyCode, customCurrencySymbol)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600">{formatCurrency(entry.principalPaid, currencyCode, customCurrencySymbol)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(entry.endingBalance, currencyCode, customCurrencySymbol)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!calculatedFutureValue && !calculatedPrincipal && !calculatedAnnualInterestRate && !calculatedTimePeriod &&
            !calculatedMonthlyPayment && !calculatedTotalInterestPaid && !calculatedTotalAmountPaid && savedLoanScenarios.length === 0 && (
            <div className="text-center text-gray-500 italic">
              Enter your financial details and click 'Calculate' to see the results.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsDisplay;
