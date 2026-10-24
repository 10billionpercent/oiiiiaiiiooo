export interface ForecastRequest {
  deliveryDate: string;
  decisionTime: string;
}

export interface Forecast {
  startTime: string;
  publishTime: string | null;
  generation: number | null;
}

export interface ForecastResponse {
  deliveryDate: string;
  decisionDate: string;
  decisionTime: string;
  forecasts: Forecast[];
}

export interface AccuracyRequest {
  startDate: string;
  endDate: string;
  decisionTime: string;
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