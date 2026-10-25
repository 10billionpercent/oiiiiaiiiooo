import { InfoIcon } from "@phosphor-icons/react";

interface MetricCardProps {
  metricName: string;
  value: string;
  description: string;
  formula: string;
}

export default function MetricCard({
  metricName,
  value,
  description,
  formula,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-name">
          {metricName}
        </span>

        <div className="metric-card-info">
          <InfoIcon
            size={15}
            weight="regular"
            className="metric-card-info-icon"
          />

          <div className="metric-card-tooltip">
            <p className="metric-card-tooltip-description">
              {description}
            </p>

            <div className="metric-card-tooltip-formula">
              <span className="metric-card-tooltip-label">
                Formula
              </span>

              <code>{formula}</code>
            </div>
          </div>
        </div>
      </div>

      <span className="metric-card-value">
        {value}
      </span>
    </div>
  );
}