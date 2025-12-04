
export enum CompoundingFrequency {
  ANNUALLY = 1,
  SEMI_ANNUALLY = 2,
  QUARTERLY = 4,
  MONTHLY = 12,
  DAILY = 365,
}

export enum CalculationTarget {
  FUTURE_VALUE = 'FUTURE_VALUE',
  PRINCIPAL = 'PRINCIPAL',
  ANNUAL_INTEREST_RATE = 'ANNUAL_INTEREST_RATE',
  TIME_PERIOD = 'TIME_PERIOD',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
}

export interface AmortizationEntry {
  paymentNumber: number;
  startingBalance: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
}

export interface CalculationResult {
  calculatedFutureValue?: number;
  calculatedPrincipal?: number;
  calculatedAnnualInterestRate?: number;
  calculatedTimePeriod?: number;
  calculatedMonthlyPayment?: number;
  calculatedTotalInterestPaid?: number;
  calculatedTotalAmountPaid?: number;
  currencyCode: string;
  customCurrencySymbol?: string;
  error?: string;
  growthData?: { year: number; value: number; }[];
  realFutureValue?: number;
  calculationTarget?: CalculationTarget;
  amortizationSchedule?: AmortizationEntry[];
}

export interface InvestmentInputs {
  calculationTarget: CalculationTarget;
  principalInput?: number;
  futureValueInput?: number;
  annualInterestRateInput?: number;
  timePeriodInput?: number;
  loanAmountInput?: number;
  loanInterestRateInput?: number; // Annual rate in percent
  loanTermInput?: number; // in years
  compoundingFrequency: CompoundingFrequency; // Still present for investment targets
  currencyCode: string;
  customCurrencySymbol?: string;
  inflationRate?: number;
}

export interface LoanInputs {
  loanAmountInput: number;
  loanInterestRateInput: number; // Annual rate in percent
  loanTermInput: number; // in years
  currencyCode: string;
  customCurrencySymbol?: string;
}

export interface LoanScenario {
  id: string;
  name: string;
  inputs: LoanInputs;
  result: {
    calculatedMonthlyPayment: number;
    calculatedTotalInterestPaid: number;
    calculatedTotalAmountPaid: number;
    currencyCode: string;
    customCurrencySymbol?: string;
  };
}

export interface InvestmentScenario {
  id: string;
  name: string;
  inputs: InvestmentInputs;
  result: CalculationResult;
}
