import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  getForecasts,
} from "../services/forecasts";
import type { ForecastRequest } from "../types";

export const forecastKeys = {
  all: ["forecasts"] as const,
  detail: (request: ForecastRequest) =>
    [
      ...forecastKeys.all,
      request.deliveryDate,
      request.decisionTime,
    ] as const,
};

export const useForecasts = (request: ForecastRequest) => {
  return useQuery({
    queryKey: forecastKeys.detail(request),
    queryFn: () => getForecasts(request),

    enabled: Boolean(
      request.deliveryDate && request.decisionTime,
    ),

    placeholderData: keepPreviousData,
  });
};