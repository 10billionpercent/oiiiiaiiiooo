import { AnimatePresence, motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

import ForecastChart from "../components/ForecastChart";
import { useForecasts } from "../queries/forecasts";
import type { PageLayoutContext } from "../layouts/PageLayout";

export default function ForecastExplorerPage() {
  const { deliveryDate, decisionTime } = useOutletContext<PageLayoutContext>();

  const formattedDate = `${deliveryDate.slice(0, 4)}-${deliveryDate.slice(
    4,
    6,
  )}-${deliveryDate.slice(6, 8)}`;

  const { data, isLoading, isError } = useForecasts({
    deliveryDate: formattedDate,
    decisionTime,
  });

  const hasForecastData =
    data?.forecasts.some((forecast) => forecast.generation !== null) ?? false;

  const emptyState = data?.emptyState;

  const firstPublishedTime = emptyState?.firstPublishedAt
    ? new Date(emptyState.firstPublishedAt).toLocaleTimeString([], {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  if (isLoading && !data) {
    return <p>Loading forecast data...</p>;
  }

  if (isError && !data) {
    return <p>Failed to load forecast data.</p>;
  }

  return (
    <AnimatePresence mode="wait">
      {hasForecastData && data && (
        <motion.div
          key="forecast-chart"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          <ForecastChart forecasts={data.forecasts} />
        </motion.div>
      )}

      {!hasForecastData && emptyState && (
        <motion.div
          key={`forecast-empty-${emptyState.type}`}
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

          {emptyState.type === "PARTIAL" && <p>{emptyState.message}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
