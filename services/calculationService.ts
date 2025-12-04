
import { CompoundingFrequency, CalculationResult, InvestmentInputs, CalculationTarget, AmortizationEntry } from '../types';

/**
 * Helper function to calculate Future Value
 */
const _calculateFutureValue = (
  principal: number,
  annualInterestRate: number,
  timePeriod: number,
  compoundingFrequency: CompoundingFrequency,
  currencyCode: string,
  customCurrencySymbol?: string,
  inflationRate?: number,
): CalculationResult => {
  if (principal <= 0) return { calculatedFutureValue: 0, currencyCode, customCurrencySymbol, error: 'Principal amount must be positive.', calculationTarget: CalculationTarget.FUTURE_VALUE };
  if (annualInterestRate < 0) return { calculatedFutureValue: 0, currencyCode, customCurrencySymbol, error: 'Annual interest rate cannot be negative.', calculationTarget: CalculationTarget.FUTURE_VALUE };
  if (timePeriod <= 0) return { calculatedFutureValue: 0, currencyCode, customCurrencySymbol, error: 'Time period must be positive.', calculationTarget: CalculationTarget.FUTURE_VALUE };
  if (compoundingFrequency <= 0) return { calculatedFutureValue: 0, currencyCode, customCurrencySymbol, error: 'Compounding frequency must be positive.', calculationTarget: CalculationTarget.FUTURE_VALUE };
  if (inflationRate !== undefined && inflationRate < 0) return { calculatedFutureValue: 0, currencyCode, customCurrencySymbol, error: 'Inflation rate cannot be negative.', calculationTarget: CalculationTarget.FUTURE_VALUE };

  const r = annualInterestRate / 100;
  const n = compoundingFrequency;
  const t = timePeriod;

  const calculatedFutureValue = principal * Math.pow((1 + r / n), (n * t));

  let realFutureValue: number | undefined = undefined;
  if (inflationRate !== undefined && inflationRate >= 0 && t > 0) {
    const annualInflationRate = inflationRate / 100;
    realFutureValue = calculatedFutureValue / Math.pow((1 + annualInflationRate), t);
  }

  const growthData: { year: number; value: number; }[] = [];
  for (let year = 1; year <= t; year++) {
    const valueAtYear = principal * Math.pow((1 + r / n), (n * year));
    growthData.push({ year, value: valueAtYear });
  }

  return { calculatedFutureValue, currencyCode, customCurrencySymbol, growthData, realFutureValue, calculationTarget: CalculationTarget.FUTURE_VALUE };
};

/**
 * Helper function to calculate Present Value
 */
const _calculatePresentValue = (
  futureValue: number,
  annualInterestRate: number,
  timePeriod: number,
  compoundingFrequency: CompoundingFrequency,
  currencyCode: string,
  customCurrencySymbol?: string,
): CalculationResult => {
  if (futureValue <= 0) return { calculatedPrincipal: 0, currencyCode, customCurrencySymbol, error: 'Future value must be positive.', calculationTarget: CalculationTarget.PRINCIPAL };
  if (annualInterestRate < 0) return { calculatedPrincipal: 0, currencyCode, customCurrencySymbol, error: 'Annual interest rate cannot be negative.', calculationTarget: CalculationTarget.PRINCIPAL };
  if (timePeriod <= 0) return { calculatedPrincipal: 0, currencyCode, customCurrencySymbol, error: 'Time period must be positive.', calculationTarget: CalculationTarget.PRINCIPAL };
  if (compoundingFrequency <= 0) return { calculatedPrincipal: 0, currencyCode, customCurrencySymbol, error: 'Compounding frequency must be positive.', calculationTarget: CalculationTarget.PRINCIPAL };

  const r = annualInterestRate / 100;
  const n = compoundingFrequency;
  const t = timePeriod;

  const calculatedPrincipal = futureValue / Math.pow((1 + r / n), (n * t));

  return { calculatedPrincipal, currencyCode, customCurrencySymbol, calculationTarget: CalculationTarget.PRINCIPAL };
};

/**
 * Helper function to calculate Annual Interest Rate
 */
const _calculateAnnualInterestRate = (
  principal: number,
  futureValue: number,
  timePeriod: number,
  compoundingFrequency: CompoundingFrequency,
  currencyCode: string,
  customCurrencySymbol?: string,
): CalculationResult => {
  if (principal <= 0) return { calculatedAnnualInterestRate: 0, currencyCode, customCurrencySymbol, error: 'Principal amount must be positive.', calculationTarget: CalculationTarget.ANNUAL_INTEREST_RATE };
  if (futureValue <= 0) return { calculatedAnnualInterestRate: 0, currencyCode, customCurrencySymbol, error: 'Future value must be positive.', calculationTarget: CalculationTarget.ANNUAL_INTEREST_RATE };
  if (timePeriod <= 0) return { calculatedAnnualInterestRate: 0, currencyCode, customCurrencySymbol, error: 'Time period must be positive.', calculationTarget: CalculationTarget.ANNUAL_INTEREST_RATE };
  if (compoundingFrequency <= 0) return { calculatedAnnualInterestRate: 0, currencyCode, customCurrencySymbol, error: 'Compounding frequency must be positive.', calculationTarget: CalculationTarget.ANNUAL_INTEREST_RATE };
  if (futureValue < principal) return { calculatedAnnualInterestRate: 0, currencyCode, customCurrencySymbol, error: 'Future value must be greater than or equal to principal for a positive interest rate.', calculationTarget: CalculationTarget.ANNUAL_INTEREST_RATE };

  const n = compoundingFrequency;
  const t = timePeriod;

  // r = n * ( (FV/P)^(1/(nt)) - 1 )
  const calculatedAnnualInterestRate = n * (Math.pow((futureValue / principal), (1 / (n * t))) - 1) * 100;

  return { calculatedAnnualInterestRate, currencyCode, customCurrencySymbol, calculationTarget: CalculationTarget.ANNUAL_INTEREST_RATE };
};

/**
 * Helper function to calculate Time Period
 */
const _calculateTimePeriod = (
  principal: number,
  futureValue: number,
  annualInterestRate: number,
  compoundingFrequency: CompoundingFrequency,
  currencyCode: string,
  customCurrencySymbol?: string,
): CalculationResult => {
  if (principal <= 0) return { calculatedTimePeriod: 0, currencyCode, customCurrencySymbol, error: 'Principal amount must be positive.', calculationTarget: CalculationTarget.TIME_PERIOD };
  if (futureValue <= 0) return { calculatedTimePeriod: 0, currencyCode, customCurrencySymbol, error: 'Future value must be positive.', calculationTarget: CalculationTarget.TIME_PERIOD };
  if (annualInterestRate <= 0) return { calculatedTimePeriod: 0, currencyCode, customCurrencySymbol, error: 'Annual interest rate must be positive for time calculation.', calculationTarget: CalculationTarget.TIME_PERIOD };
  if (compoundingFrequency <= 0) return { calculatedTimePeriod: 0, currencyCode, customCurrencySymbol, error: 'Compounding frequency must be positive.', calculationTarget: CalculationTarget.TIME_PERIOD };
  if (futureValue < principal) return { calculatedTimePeriod: 0, currencyCode, customCurrencySymbol, error: 'Future value must be greater than or equal to principal for a positive time period.', calculationTarget: CalculationTarget.TIME_PERIOD };

  const r = annualInterestRate / 100;
  const n = compoundingFrequency;

  // t = log(FV/P) / (n * log(1 + r/n))
  const calculatedTimePeriod = Math.log(futureValue / principal) / (n * Math.log(1 + r / n));

  return { calculatedTimePeriod, currencyCode, customCurrencySymbol, calculationTarget: CalculationTarget.TIME_PERIOD };
};

/**
 * Helper function to calculate Loan Payment and Amortization Schedule
 */
const _calculateLoanPayment = (
  loanAmount: number,
  loanInterestRate: number, // Annual rate in percent
  loanTerm: number, // in years
  currencyCode: string,
  customCurrencySymbol?: string,
): CalculationResult => {
  if (loanAmount <= 0) return { calculatedMonthlyPayment: 0, calculatedTotalInterestPaid: 0, calculatedTotalAmountPaid: 0, currencyCode, customCurrencySymbol, error: 'Loan amount must be positive.', calculationTarget: CalculationTarget.LOAN_PAYMENT };
  if (loanInterestRate < 0) return { calculatedMonthlyPayment: 0, calculatedTotalInterestPaid: 0, calculatedTotalAmountPaid: 0, currencyCode, customCurrencySymbol, error: 'Loan interest rate cannot be negative.', calculationTarget: CalculationTarget.LOAN_PAYMENT };
  if (loanTerm <= 0) return { calculatedMonthlyPayment: 0, calculatedTotalInterestPaid: 0, calculatedTotalAmountPaid: 0, currencyCode, customCurrencySymbol, error: 'Loan term must be positive.', calculationTarget: CalculationTarget.LOAN_PAYMENT };

  const monthlyInterestRate = (loanInterestRate / 100) / 12;
  const numberOfPayments = loanTerm * 12;

  let calculatedMonthlyPayment: number;
  if (monthlyInterestRate === 0) {
    calculatedMonthlyPayment = loanAmount / numberOfPayments;
  } else {
    calculatedMonthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  }

  const calculatedTotalAmountPaid = calculatedMonthlyPayment * numberOfPayments;
  const calculatedTotalInterestPaid = calculatedTotalAmountPaid - loanAmount;

  // Generate Amortization Schedule
  const amortizationSchedule: AmortizationEntry[] = [];
  let currentBalance = loanAmount;
  let totalInterest = 0;

  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = currentBalance * monthlyInterestRate;
    let principalPayment = calculatedMonthlyPayment - interestPayment;

    // Adjust last payment to account for floating point errors
    if (i === numberOfPayments) {
      principalPayment = currentBalance; // Pay off remaining balance
      calculatedMonthlyPayment = currentBalance + interestPayment; // Adjust final monthly payment
    }

    currentBalance -= principalPayment;
    totalInterest += interestPayment;

    amortizationSchedule.push({
      paymentNumber: i,
      startingBalance: currentBalance + principalPayment, // Balance before this payment
      interestPaid: interestPayment,
      principalPaid: principalPayment,
      endingBalance: Math.max(0, currentBalance), // Ensure ending balance is not negative
    });
  }

  // Recalculate total interest and amount paid based on adjusted monthly payment for last iteration
  const finalCalculatedTotalAmountPaid = amortizationSchedule.reduce((sum, entry) => sum + (entry.interestPaid + entry.principalPaid), 0);
  const finalCalculatedTotalInterestPaid = finalCalculatedTotalAmountPaid - loanAmount;


  return {
    calculatedMonthlyPayment: calculatedMonthlyPayment, // Use the adjusted one for the last payment too
    calculatedTotalInterestPaid: finalCalculatedTotalInterestPaid,
    calculatedTotalAmountPaid: finalCalculatedTotalAmountPaid,
    currencyCode,
    customCurrencySymbol,
    calculationTarget: CalculationTarget.LOAN_PAYMENT,
    amortizationSchedule: amortizationSchedule,
  };
};

/**
 * Performs a financial calculation based on the specified target.
 *
 * @param inputs The investment inputs including the calculation target.
 * @returns An object containing the calculated value or an error message.
 */
export const performFinancialCalculation = ({
  calculationTarget,
  principalInput,
  futureValueInput,
  annualInterestRateInput,
  timePeriodInput,
  loanAmountInput, // New loan inputs
  loanInterestRateInput, // New loan inputs
  loanTermInput, // New loan inputs
  compoundingFrequency,
  currencyCode,
  customCurrencySymbol,
  inflationRate,
}: InvestmentInputs): CalculationResult => {

  let result: CalculationResult;

  switch (calculationTarget) {
    case CalculationTarget.FUTURE_VALUE:
      result = _calculateFutureValue(
        principalInput!,
        annualInterestRateInput!,
        timePeriodInput!,
        compoundingFrequency,
        currencyCode,
        customCurrencySymbol,
        inflationRate,
      );
      break;
    case CalculationTarget.PRINCIPAL:
      result = _calculatePresentValue(
        futureValueInput!,
        annualInterestRateInput!,
        timePeriodInput!,
        compoundingFrequency,
        currencyCode,
        customCurrencySymbol,
      );
      break;
    case CalculationTarget.ANNUAL_INTEREST_RATE:
      result = _calculateAnnualInterestRate(
        principalInput!,
        futureValueInput!,
        timePeriodInput!,
        compoundingFrequency,
        currencyCode,
        customCurrencySymbol,
      );
      break;
    case CalculationTarget.TIME_PERIOD:
      result = _calculateTimePeriod(
        principalInput!,
        futureValueInput!,
        annualInterestRateInput!,
        compoundingFrequency,
        currencyCode,
        customCurrencySymbol,
      );
      break;
    case CalculationTarget.LOAN_PAYMENT: // New case for Loan Payment
      result = _calculateLoanPayment(
        loanAmountInput!,
        loanInterestRateInput!,
        loanTermInput!,
        currencyCode,
        customCurrencySymbol,
      );
      break;
    default:
      result = { currencyCode, customCurrencySymbol, error: 'Invalid calculation target.', calculationTarget: calculationTarget };
  }

  // Ensure calculationTarget is always included in the final result object.
  result.calculationTarget = calculationTarget;

  return result;
};
