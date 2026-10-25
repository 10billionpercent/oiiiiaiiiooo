import type { AccuracyData } from "../types";

interface AccuracyTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AccuracyData & {
      time: string;
    };
  }>;
}

export default function AccuracyTooltip({
  active,
  payload,
}: AccuracyTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const accuracy = payload[0].payload;

  const formatDate = (dateTime: string) =>
    new Date(dateTime).toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (dateTime: string) =>
    new Date(dateTime).toLocaleTimeString("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div className="accuracy-tooltip">
      <div className="accuracy-tooltip-hero">
        <span className="accuracy-tooltip-label">Absolute Error</span>

        <span className="accuracy-tooltip-value">
          {accuracy.absoluteError.toLocaleString()} MW
        </span>
      </div>

      <div className="accuracy-tooltip-details">
        <div className="accuracy-tooltip-row">
          <span>Actual</span>
          <span>{accuracy.actual.toLocaleString()} MW</span>
        </div>

        <div className="accuracy-tooltip-row">
          <span>Forecast</span>
          <span>{accuracy.forecast.toLocaleString()} MW</span>
        </div>

        <div className="accuracy-tooltip-row">
          <span>Forecast Published at</span>
          <span>
            {accuracy.publishTime
              ? `${formatDate(accuracy.publishTime)} ${formatTime(
                  accuracy.publishTime,
                )} UTC`
              : "Not available"}
          </span>
        </div>
      </div>
    </div>
  );
}
