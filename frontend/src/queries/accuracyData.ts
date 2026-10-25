import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import { getAccuracyData } from "../services/accuracyData";
import type { AccuracyRequest } from "../types";

export const accuracyDataKeys = {
  all: ["accuracyData"] as const,

  detail: (request: AccuracyRequest) =>
    [
      ...accuracyDataKeys.all,
      request.startDate,
      request.endDate,
      request.decisionTime,
    ] as const,
};

export const useAccuracyData = (
  request: AccuracyRequest,
) => {
  return useQuery({
    queryKey: accuracyDataKeys.detail(request),
    queryFn: () => getAccuracyData(request),

    enabled: Boolean(
      request.startDate &&
      request.endDate &&
      request.decisionTime,
    ),

    placeholderData: keepPreviousData,
  });
};