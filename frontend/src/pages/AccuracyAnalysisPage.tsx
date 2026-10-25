import { AnimatePresence, motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

import AccuracyChart from "../components/AccuracyChart";
import MetricCard from "../components/MetricCard";

import { useAccuracyData } from "../queries/accuracyData";
import { useAccuracy } from "../queries/accuracy";

import type { PageLayoutContext } from "../layouts/PageLayout";

export default function AccuracyAnalysisPage() {
  const {
    startDate,
    endDate,
    decisionTime,
  } = useOutletContext<PageLayoutContext>();

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

  const hasAccuracyData =
    accuracyData?.data.length > 0;

  const isLoading =
    isDataLoading || isMetricsLoading;

  const isError =
    isDataError || isMetricsError;

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
                formula="MAE = (1/n) Σ |Forecast − Actual|"
              />

              <MetricCard
                metricName="RMSE"
                value={
                  accuracy.metrics.rmse !== null
                    ? `${accuracy.metrics.rmse.toLocaleString()} MW`
                    : "N/A"
                }
                description="Penalises larger forecast errors more heavily."
                formula="RMSE = √[(1/n) Σ (Forecast − Actual)²]"
              />

              <MetricCard
                metricName="MBE"
                value={
                  accuracy.metrics.mbe !== null
                    ? `${accuracy.metrics.mbe.toLocaleString()} MW`
                    : "N/A"
                }
                description="Shows whether forecasts systematically over- or under-predict."
                formula="MBE = (1/n) Σ (Forecast − Actual)"
              />
            </div>
          )}
        </motion.div>
      )}

      {!hasAccuracyData && (
        <motion.div
          key="accuracy-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          <p>
            No accuracy data available for the selected range.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}