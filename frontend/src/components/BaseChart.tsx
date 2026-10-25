import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartLine {
  dataKey: string;
  stroke: string;
  label: string;
}

interface BaseChartProps {
  data: Record<string, unknown>[];
  lines: ChartLine[];
  tooltip: React.ReactElement;
  yAxisLabel: string;
  showLegend?: boolean;
  children?: React.ReactNode;
}

export default function BaseChart({
  data,
  lines,
  tooltip,
  yAxisLabel,
  showLegend = false,
  children,
}: BaseChartProps) {
  return (
    <div className="forecast-chart-container">
      {children}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
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
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              offset: 0,
              dy: 100,
              fill: "#e2e8e5",
              fontSize: 12,
            }}
          />

          <Tooltip content={tooltip} />

          {showLegend && (
            <Legend
              formatter={(value) => {
                const line = lines.find((line) => line.dataKey === value);

                return line?.label ?? value;
              }}
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                paddingBottom: "1rem",
                fontSize: "12px",
              }}
            />
          )}

          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={2}
              dot={{
                r: 3,
                fill: line.stroke,
                stroke: line.stroke,
              }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
