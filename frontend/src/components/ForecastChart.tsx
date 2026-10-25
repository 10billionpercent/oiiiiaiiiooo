import type { Forecast } from "../types";
import ForecastTooltip from "./ForecastTooltip";
import BaseChart from "./BaseChart";

interface ForecastChartProps {
  forecasts: Forecast[];
  deliveryDate: string;
  decisionTime: string;
}

export default function ForecastChart({
  forecasts,
  deliveryDate,
}: ForecastChartProps) {
  const chartData = forecasts
    .filter((forecast) => forecast.generation !== null)
    .map((forecast) => ({
      ...forecast,
      time: new Date(forecast.startTime).toLocaleTimeString("en-GB", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));

  return (
    <BaseChart
      data={chartData}
      lines={[
        {
          dataKey: "generation",
          stroke: "#00baff",
          label: "Forecast",
        },
      ]}
      tooltip={<ForecastTooltip deliveryDate={deliveryDate} />}
      yAxisLabel="Wind Generation Forecast (MW)"
    />
  );
}
