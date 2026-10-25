import api from "./api";
import type {
  RealDataResponse,
  AccuracyRequest,
} from "../types";

export const getAccuracyData = async (
  request: AccuracyRequest,
): Promise<RealDataResponse> => {
  const { data } = await api.post<RealDataResponse>(
    "/accuracy-data",
    request,
  );

  return data;
};