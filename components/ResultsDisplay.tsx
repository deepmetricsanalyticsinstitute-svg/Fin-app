import React, { useCallback, useRef, useEffect } from 'react';

// Declare Chart globally as it's loaded via CDN
declare global {
  interface Window {
    Chart: any; // Chart.js type can be more specific but `any` for quick integration
  }
}

interface ResultsDisplayProps {
  futureValue: number | null;
  errorMessage?: string;
  currencyCode?: string;
  customCurrencySymbol?: string;
  growthData?: { year: number; value: number; }[];
  realFutureValue?: number; // New: Optional real future value
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ futureValue, errorMessage, currencyCode = 'USD', customCurrencySymbol, growthData, realFutureValue }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null); // To store the Chart.js instance

  const formatCurrency = useCallback((amount: number, code: string, customSymbol?: string) => {
    if (customSymbol && customSymbol.trim() !== '') {
      const formattedNumber = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `${customSymbol.trim()} ${formattedNumber}`;
    } else {
      return amount.toLocaleString(undefined, { style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }, []);

  useEffect(() => {
    if (chartRef.current && growthData && growthData.length > 0 && window.Chart) {
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
            maintainAspectRatio: false, // Allows the chart to resize freely
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
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [growthData, currencyCode, customCurrencySymbol, formatCurrency]); // Re-render chart if these dependencies change

  return (
    <div className="p-8 rounded-lg shadow-xl bg-white w-full max-w-lg mt-8 sm:mt-0 lg:ml-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Results</h2>

      {errorMessage ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{errorMessage}</span>
        </div>
      ) : futureValue !== null && futureValue > 0 ? (
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-2">Your investment will be worth (Nominal):</p>
          <p className="text-5xl font-extrabold text-blue-700 leading-tight">
            {formatCurrency(futureValue, currencyCode, customCurrencySymbol)}
          </p>

          {realFutureValue !== undefined && realFutureValue !== null && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-lg text-gray-700 mb-2">Real future value (adjusted for inflation):</p>
              <p className="text-4xl font-extrabold text-green-700 leading-tight">
                {formatCurrency(realFutureValue, currencyCode, customCurrencySymbol)}
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
              <div className="relative h-64 w-full"> {/* Fixed height for the chart container */}
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 italic">
          Enter your investment details and click 'Calculate' to see the results.
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;