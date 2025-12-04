export enum CompoundingFrequency {
  ANNUALLY = 1,
  SEMI_ANNUALLY = 2,
  QUARTERLY = 4,
  MONTHLY = 12,
  DAILY = 365,
}

export interface CalculationResult {
  futureValue: number;
  currencyCode: string;
  customCurrencySymbol?: string; // Added optional customCurrencySymbol
  error?: string;
  growthData?: { year: number; value: number; }[]; // Added for charting
  realFutureValue?: number; // New: Optional real future value
}

export interface InvestmentInputs {
  principal: number;
  interestRate: number;
  timePeriod: number;
  compoundingFrequency: CompoundingFrequency;
  currencyCode: string;
  customCurrencySymbol?: string; // Added optional customCurrencySymbol
  inflationRate?: number; // New: Optional inflation rate
}