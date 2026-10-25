export interface ForecastRequest {
  deliveryDate: string;
  decisionTime: string;
}

export interface Forecast {
  startTime: string;
  publishTime: string | null;
  generation: number | null;
}

export interface ForecastEmptyState {
  type: "NOT_AVAILABLE_YET" | "PARTIAL" | "NO_RECORDS";
  message: string;
  missingIntervals?: number;
}

export interface ForecastResponse {
  deliveryDate: string;
  decisionDate: string;
  decisionTime: string;
  forecasts: Forecast[];
  emptyState: {
    type: "NO_RECORDS" | "NOT_AVAILABLE_YET" | "PARTIAL";
    message?: string;
    firstPublishedAt?: string;
    missingIntervals?: number;
  } | null;
}

export interface AccuracyRequest {
  startDate: string;
  endDate: string;
  decisionTime: string;
}

export interface AccuracyData {
  startTime: string;
  publishTime: string | null;
  forecast: number;
  actual: number;
  error: number;
  absoluteError: number;
}

export interface AccuracyMetrics {
  mae: number | null;
  rmse: number | null;
  mbe: number | null;
  validIntervals: number;
}

export interface AccuracyResponse {
  startDate: string;
  endDate: string;
  decisionTime: string;
  unit: string;
  metrics: AccuracyMetrics;
}

export interface AccuracyEmptyState {
  type: "NOT_AVAILABLE_YET" | "PARTIAL" | "NO_RECORDS" | "NO_MATCHED_DATA";
  message: string;
  firstPublishedAt?: string;
  availableIntervals?: number;
  missingIntervals?: number;
}

export interface RealDataResponse {
  startDate: string;
  endDate: string;
  decisionTime: string;
  unit: string;
  data: AccuracyData[];
  emptyState: AccuracyEmptyState | null;
}
