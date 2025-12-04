import React, { useCallback, useRef, useEffect, useState } from 'react';
import { CalculationTarget } from '../types';

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
  errorMessage?: string;
  currencyCode?: string;
  customCurrencySymbol?: string;
  growthData?: { year: number; value: number; }[];
  realFutureValue?: number | null;
}

const ANIMATION_DURATION_MS = 1000; // Animation duration in milliseconds

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  calculationTarget,
  calculatedFutureValue = null,
  calculatedPrincipal = null,
  calculatedAnnualInterestRate = null,
  calculatedTimePeriod = null,
  errorMessage,
  currencyCode = 'USD',
  customCurrencySymbol,
  growthData,
  realFutureValue = null,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null); // To store the Chart.js instance

  // State for animated values
  const [animatedFutureValue, setAnimatedFutureValue] = useState(0);
  const [animatedRealFutureValue, setAnimatedRealFutureValue] = useState(0);
  const [animatedPrincipal, setAnimatedPrincipal] = useState(0);
  const [animatedAnnualInterestRate, setAnimatedAnnualInterestRate] = useState(0);
  const [animatedTimePeriod, setAnimatedTimePeriod] = useState(0);

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
          {!calculatedFutureValue && !calculatedPrincipal && !calculatedAnnualInterestRate && !calculatedTimePeriod && (
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