import { CompoundingFrequency, CalculationResult, InvestmentInputs } from '../types';

/**
 * Calculates the future value of an investment using the compound interest formula.
 * FV = P * (1 + r/n)^(nt)
 *
 * @param principal The initial principal amount.
 * @param annualInterestRate The annual interest rate (e.g., 0.05 for 5%).
 * @param timePeriod The number of years the money is invested.
 * @param compoundingFrequency The number of times interest is compounded per year.
 * @param currencyCode The currency code (e.g., 'USD', 'EUR').
 * @param customCurrencySymbol An optional custom symbol to use for currency display.
 * @param inflationRate An optional assumed annual inflation rate (e.g., 0.02 for 2%).
 * @returns An object containing the future value or an error message, and yearly growth data.
 */
export const calculateFutureValue = ({
  principal,
  interestRate,
  timePeriod,
  compoundingFrequency,
  currencyCode,
  customCurrencySymbol,
  inflationRate, // Added inflationRate
}: InvestmentInputs): CalculationResult => {
  if (principal <= 0) {
    return { futureValue: 0, currencyCode, customCurrencySymbol, error: 'Principal amount must be positive.' };
  }
  if (interestRate < 0) {
    return { futureValue: 0, currencyCode, customCurrencySymbol, error: 'Interest rate cannot be negative.' };
  }
  if (timePeriod <= 0) {
    return { futureValue: 0, currencyCode, customCurrencySymbol, error: 'Time period must be positive.' };
  }
  if (compoundingFrequency <= 0) {
    return { futureValue: 0, currencyCode, customCurrencySymbol, error: 'Compounding frequency must be positive.' };
  }
  if (inflationRate !== undefined && inflationRate < 0) {
    return { futureValue: 0, currencyCode, customCurrencySymbol, error: 'Inflation rate cannot be negative.' };
  }

  const r = interestRate / 100; // Convert percentage to decimal
  const n = compoundingFrequency;
  const t = timePeriod;

  // FV = P * (1 + r/n)^(nt)
  const futureValue = principal * Math.pow((1 + r / n), (n * t));

  let realFutureValue: number | undefined = undefined;
  if (inflationRate !== undefined && inflationRate >= 0 && t > 0) {
    const annualInflationRate = inflationRate / 100;
    // Real FV = Nominal FV / (1 + inflation_rate)^time_period
    realFutureValue = futureValue / Math.pow((1 + annualInflationRate), t);
  }

  const growthData: { year: number; value: number; }[] = [];
  for (let year = 1; year <= t; year++) {
    const valueAtYear = principal * Math.pow((1 + r / n), (n * year));
    growthData.push({ year, value: valueAtYear });
  }

  return { futureValue, currencyCode, customCurrencySymbol, growthData, realFutureValue };
};