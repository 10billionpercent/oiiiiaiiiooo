import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import { getAccuracy } from "../services/accuracy";
import type { AccuracyRequest } from "../types";

export const accuracyKeys = {
  all: ["accuracy"] as const,

  detail: (request: AccuracyRequest) =>
    [
      ...accuracyKeys.all,
      request.startDate,
      request.endDate,
      request.decisionTime,
    ] as const,
};

export const useAccuracy = (request: AccuracyRequest) => {
  return useQuery({
    queryKey: accuracyKeys.detail(request),
    queryFn: () => getAccuracy(request),

    enabled: Boolean(
      request.startDate &&
      request.endDate &&
      request.decisionTime,
    ),

    placeholderData: keepPreviousData,
  });
};