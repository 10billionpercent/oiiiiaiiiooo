import type { Forecast } from "../types";

interface ForecastTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: Forecast & {
      time: string;
    };
  }>;
  deliveryDate: string;
}

export default function ForecastTooltip({
  active,
  payload,
  deliveryDate,
}: ForecastTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const forecast = payload[0].payload;

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
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
    <div className="forecast-tooltip">
      <div className="forecast-tooltip-hero">
        <span className="forecast-tooltip-label">
          Forecast
        </span>

        <span className="forecast-tooltip-value">
          {forecast.generation !== null
            ? `${forecast.generation.toLocaleString()} MW`
            : "Not available"}
        </span>
      </div>

      <div className="forecast-tooltip-details">
        <div className="forecast-tooltip-row">
          <span>Delivery date</span>
          <span>{formatDate(deliveryDate)}</span>
        </div>

        <div className="forecast-tooltip-row">
          <span>Delivery time</span>
          <span>{formatTime(forecast.startTime)} UTC</span>
        </div>

        <div className="forecast-tooltip-row">
          <span>Published at</span>
          <span>
            {forecast.publishTime
              ? `${formatTime(forecast.publishTime)} UTC`
              : "Not available"}
          </span>
        </div>
      </div>
    </div>
  );
}