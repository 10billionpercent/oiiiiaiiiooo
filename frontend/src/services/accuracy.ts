import api from "./api";
import type { AccuracyRequest, AccuracyResponse } from "../types";

export const getAccuracy = async (
  request: AccuracyRequest,
): Promise<AccuracyResponse> => {
  const { data } = await api.post<AccuracyResponse>(
    "/accuracy",
    request,
  );

  return data;
};