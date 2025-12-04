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
}

export interface CalculationResult {
  calculatedFutureValue?: number;
  calculatedPrincipal?: number;
  calculatedAnnualInterestRate?: number;
  calculatedTimePeriod?: number;
  currencyCode: string;
  customCurrencySymbol?: string;
  error?: string;
  growthData?: { year: number; value: number; }[];
  realFutureValue?: number;
  calculationTarget?: CalculationTarget; // Added to store which target was calculated
}

export interface InvestmentInputs {
  calculationTarget: CalculationTarget;
  principalInput?: number; // Optional as it might be the target
  futureValueInput?: number; // Optional as it might be the target
  annualInterestRateInput?: number; // Optional as it might be the target
  timePeriodInput?: number; // Optional as it might be the target
  compoundingFrequency: CompoundingFrequency;
  currencyCode: string;
  customCurrencySymbol?: string;
  inflationRate?: number;
}