import { useMemo, useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

import BaseChart from "./BaseChart";
import AccuracyTooltip from "./AccuracyTooltip";
import type { AccuracyData } from "../types";

interface AccuracyChartProps {
  data: AccuracyData[];
}

const DATES_PER_PAGE = 10;

export default function AccuracyChart({ data }: AccuracyChartProps) {
  const availableDates = useMemo(() => {
    return Array.from(
      new Set(data.map((item) => item.startTime.slice(0, 10))),
    ).sort();
  }, [data]);

  const [selectedDate, setSelectedDate] = useState("");
  const [dateStartIndex, setDateStartIndex] = useState(0);

  const activeDate = availableDates.includes(selectedDate)
    ? selectedDate
    : (availableDates[0] ?? "");

  const maxStartIndex = Math.max(availableDates.length - DATES_PER_PAGE, 0);

  const safeStartIndex = Math.min(dateStartIndex, maxStartIndex);

  const visibleDates = availableDates.slice(
    safeStartIndex,
    safeStartIndex + DATES_PER_PAGE,
  );

  const selectedDayData = data
    .filter((item) => item.startTime.slice(0, 10) === activeDate)
    .map((item) => ({
      ...item,

      time: new Date(item.startTime).toLocaleTimeString("en-GB", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));

  const formatDay = (date: string) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
      timeZone: "UTC",
      weekday: "short",
    });

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
    });

  const goToPreviousDates = () => {
    setDateStartIndex((index) => Math.max(index - 1, 0));
  };

  const goToNextDates = () => {
    setDateStartIndex((index) => Math.min(index + 1, maxStartIndex));
  };

  return (
    <BaseChart
      data={selectedDayData}
      lines={[
        {
          dataKey: "forecast",
          stroke: "#00baff",
          label: "Forecast",
        },
        {
          dataKey: "actual",
          stroke: "#00ff5e",
          label: "Actual",
        },
      ]}
      tooltip={<AccuracyTooltip />}
      yAxisLabel="Wind Generation (MW)"
      showLegend
    >
      <div className="accuracy-day-selector">
        <div className="accuracy-day-nav-slot">
          <AnimatePresence>
            {availableDates.length > DATES_PER_PAGE && (
              <motion.button
                type="button"
                className="accuracy-day-nav"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                onClick={goToPreviousDates}
                disabled={safeStartIndex === 0}
                aria-label="Previous dates"
              >
                <CaretLeftIcon size={18} weight="bold" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="accuracy-day-buttons">
          {visibleDates.map((date) => (
            <button
              key={date}
              type="button"
              className={`accuracy-day-button ${
                activeDate === date ? "accuracy-day-button-active" : ""
              }`}
              onClick={() => setSelectedDate(date)}
              aria-pressed={activeDate === date}
            >
              <span className="accuracy-day-name">{formatDay(date)}</span>

              <span className="accuracy-day-date">{formatDate(date)}</span>
            </button>
          ))}
        </div>

        <div className="accuracy-day-nav-slot">
          <AnimatePresence>
            {availableDates.length > DATES_PER_PAGE && (
              <motion.button
                type="button"
                className="accuracy-day-nav"
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                onClick={goToNextDates}
                disabled={safeStartIndex === maxStartIndex}
                aria-label="Next dates"
              >
                <CaretRightIcon size={18} weight="bold" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BaseChart>
  );
}
