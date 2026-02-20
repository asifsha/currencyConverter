export interface ConversionResponse {
  from: string;
  to: string;
  amount: number;
  result: number;
}

export interface LatestRatesResponse {
  base: string;
  rates: Record<string, number>;
}

export interface HistoricalRate {
  date: string;
  rates: Record<string, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
}
