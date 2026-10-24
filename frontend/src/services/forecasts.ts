import api from "./api";
import type { ForecastRequest, ForecastResponse } from "../types";

export const getForecasts = async (
  request: ForecastRequest,
): Promise<ForecastResponse> => {
  const { data } = await api.post<ForecastResponse>(
    "/forecasts",
    request,
  );

  return data;
};