import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { Forecast } from "../types";
import ForecastTooltip from "./ForecastTooltip";

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

      time: new Date(forecast.startTime).toLocaleTimeString([], {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),

      generation: forecast.generation,
    }));

  return (
    <div className="forecast-chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 30,
            bottom: 40,
          }}
        >
          <CartesianGrid stroke="#7cdbff" strokeOpacity={0.15} />

          <XAxis
            dataKey="time"
            tick={{ fill: "#e2e8e5", fontSize: 12 }}
            axisLine={{ stroke: "#7cdbff" }}
            tickLine={{ stroke: "#7cdbff" }}
            tickMargin={10}
            label={{
              value: "Time",
              position: "bottom",
              offset: 20,
              fill: "#e2e8e5",
              fontSize: 12,
            }}
          />

          <YAxis
            tick={{ fill: "#e2e8e5", fontSize: 12 }}
            tickMargin={12}
            axisLine={{ stroke: "#7cdbff" }}
            tickLine={{ stroke: "#7cdbff" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            label={{
              value: "Wind Generation Forecast (MW)",
              angle: -90,
              position: "insideLeft",
              offset: 0,
              dy: 100,
              fill: "#e2e8e5",
              fontSize: 12,
            }}
          />

          <Tooltip content={<ForecastTooltip deliveryDate={deliveryDate} />} />

          <Line
            type="monotone"
            dataKey="generation"
            stroke="#00baff"
            strokeWidth={2}
            dot={{
              r: 3,
              fill: "#00baff",
              stroke: "#00baff",
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
