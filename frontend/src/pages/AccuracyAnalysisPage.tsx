import { AnimatePresence, motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

import AccuracyChart from "../components/AccuracyChart";
import MetricCard from "../components/MetricCard";

import { useAccuracyData } from "../queries/accuracyData";
import { useAccuracy } from "../queries/accuracy";

import type { PageLayoutContext } from "../layouts/PageLayout";

export default function AccuracyAnalysisPage() {
  const { startDate, endDate, decisionTime, isInvalidAccuracyRange } =
    useOutletContext<PageLayoutContext>();

  const request = {
    startDate,
    endDate,
    decisionTime,
  };

  const {
    data: accuracyData,
    isLoading: isDataLoading,
    isError: isDataError,
  } = useAccuracyData(request);

  const {
    data: accuracy,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
  } = useAccuracy(request);

  const hasAccuracyData = (accuracyData?.data?.length ?? 0) > 0;

  const emptyState = accuracyData?.emptyState;

  const firstPublishedTime = emptyState?.firstPublishedAt
    ? new Date(emptyState.firstPublishedAt).toLocaleTimeString([], {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  const isLoading = isDataLoading || isMetricsLoading;

  const isError = isDataError || isMetricsError;

  if (isInvalidAccuracyRange) {
    return (
      <p className="accuracy-validation-message">
        Please select a valid date range. Start date must be earlier than or
        equal to the end date.
      </p>
    );
  }

  if (isLoading && !accuracyData) {
    return <p>Loading accuracy data...</p>;
  }

  if (isError && !accuracyData) {
    return <p>Failed to load accuracy data.</p>;
  }

  return (
    <AnimatePresence mode="wait">
      {hasAccuracyData && accuracyData && (
        <motion.div
          key="accuracy-content"
          className="accuracy-analysis"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          <div className="accuracy-analysis-chart">
            <AccuracyChart data={accuracyData.data} />
          </div>

          {accuracy && (
            <div className="accuracy-metrics">
              <MetricCard
                metricName="MAE"
                value={
                  accuracy.metrics.mae !== null
                    ? `${accuracy.metrics.mae.toLocaleString()} MW`
                    : "N/A"
                }
                description="Average absolute difference between forecast and actual generation."
                formula="\mathrm{MAE} = \frac{1}{n}\sum_{i=1}^{n}\left|F_i - A_i\right|"
              />

              <MetricCard
                metricName="RMSE"
                value={
                  accuracy.metrics.rmse !== null
                    ? `${accuracy.metrics.rmse.toLocaleString()} MW`
                    : "N/A"
                }
                description="Penalises larger forecast errors more heavily."
                formula="\mathrm{RMSE} = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(F_i - A_i)^2}"
              />

              <MetricCard
                metricName="MBE"
                value={
                  accuracy.metrics.mbe !== null
                    ? `${accuracy.metrics.mbe.toLocaleString()} MW`
                    : "N/A"
                }
                description="Shows whether forecasts systematically over- or under-predict."
                formula="\mathrm{MBE} = \frac{1}{n}\sum_{i=1}^{n}(F_i - A_i)"
              />
            </div>
          )}
        </motion.div>
      )}

      {!hasAccuracyData && emptyState && (
        <motion.div
          key={`accuracy-empty-${emptyState.type}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          {emptyState.type === "NOT_AVAILABLE_YET" && firstPublishedTime && (
            <p>
              No forecast was available by {decisionTime} UTC. The first
              recorded forecast was published at {firstPublishedTime} UTC.
            </p>
          )}

          {emptyState.type === "NO_RECORDS" && <p>{emptyState.message}</p>}

          {emptyState.type === "NO_MATCHED_DATA" && <p>{emptyState.message}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
