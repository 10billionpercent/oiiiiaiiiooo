import { useEffect, useRef, useState } from "react";
import {
  CaretUpIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const VALUES_PER_VIEW = 6;

const isValidTime = (value: string) => {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return (
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
};

export default function TimePicker({
  value,
  onChange,
  placeholder = "HH:MM",
}: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [selectedHour, selectedMinute] = value
    ? value.split(":")
    : ["00", "00"];

  const [hourStartIndex, setHourStartIndex] = useState(0);
  const [minuteStartIndex, setMinuteStartIndex] =
    useState(0);

  const maxHourStartIndex = Math.max(
    HOURS.length - VALUES_PER_VIEW,
    0,
  );

  const maxMinuteStartIndex = Math.max(
    MINUTES.length - VALUES_PER_VIEW,
    0,
  );

  const safeHourStartIndex = Math.min(
    hourStartIndex,
    maxHourStartIndex,
  );

  const safeMinuteStartIndex = Math.min(
    minuteStartIndex,
    maxMinuteStartIndex,
  );

  const visibleHours = HOURS.slice(
    safeHourStartIndex,
    safeHourStartIndex + VALUES_PER_VIEW,
  );

  const visibleMinutes = MINUTES.slice(
    safeMinuteStartIndex,
    safeMinuteStartIndex + VALUES_PER_VIEW,
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener(
        "mousedown",
        handleClickOutside,
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [showPicker]);

  const selectTime = (
    hour: string,
    minute: string,
  ) => {
    onChange(`${hour}:${minute}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextValue = e.target.value;

    if (nextValue.length <= 5) {
      onChange(nextValue);
    }
  };

  const openPicker = () => {
    setShowPicker(true);
  };

  return (
    <div
      className="time-picker-wrapper"
      ref={pickerRef}
    >
      <div className="time-picker-input-wrap">
        <input
          type="text"
          className="time-picker-input"
          placeholder={placeholder}
          value={value}
          maxLength={5}
          onChange={handleInputChange}
          onFocus={openPicker}
          onBlur={() => {
            setTimeout(() => {
              if (
                pickerRef.current &&
                !pickerRef.current.contains(
                  document.activeElement,
                )
              ) {
                if (!isValidTime(value)) {
                  onChange("");
                }
              }
            }, 0);
          }}
        />

        <button
          className="time-picker-icon-btn"
          type="button"
          onClick={openPicker}
          aria-label="Pick time"
        >
          <span>◷</span>
        </button>
      </div>

      {showPicker && (
        <div className="time-picker-popup">
          <div className="time-picker-columns">
            {/* HOURS */}
            <div className="time-picker-column">
              <div className="time-picker-column-title">
                HOURS
              </div>

              <button
                type="button"
                className="time-picker-nav"
                onClick={() =>
                  setHourStartIndex((index) =>
                    Math.max(index - 1, 0),
                  )
                }
                disabled={safeHourStartIndex === 0}
                aria-label="Previous hours"
              >
                <CaretUpIcon
                  size={16}
                  weight="bold"
                />
              </button>

              <div className="time-picker-options">
                {visibleHours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    className={`time-picker-option ${
                      selectedHour === hour
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectTime(
                        hour,
                        selectedMinute,
                      )
                    }
                  >
                    {hour}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="time-picker-nav"
                onClick={() =>
                  setHourStartIndex((index) =>
                    Math.min(
                      index + 1,
                      maxHourStartIndex,
                    ),
                  )
                }
                disabled={
                  safeHourStartIndex ===
                  maxHourStartIndex
                }
                aria-label="Next hours"
              >
                <CaretDownIcon
                  size={16}
                  weight="bold"
                />
              </button>
            </div>

            {/* MINUTES */}
            <div className="time-picker-column">
              <div className="time-picker-column-title">
                MINUTES
              </div>

              <button
                type="button"
                className="time-picker-nav"
                onClick={() =>
                  setMinuteStartIndex((index) =>
                    Math.max(index - 1, 0),
                  )
                }
                disabled={safeMinuteStartIndex === 0}
                aria-label="Previous minutes"
              >
                <CaretUpIcon
                  size={16}
                  weight="bold"
                />
              </button>

              <div className="time-picker-options">
                {visibleMinutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    className={`time-picker-option ${
                      selectedMinute === minute
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectTime(
                        selectedHour,
                        minute,
                      )
                    }
                  >
                    {minute}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="time-picker-nav"
                onClick={() =>
                  setMinuteStartIndex((index) =>
                    Math.min(
                      index + 1,
                      maxMinuteStartIndex,
                    ),
                  )
                }
                disabled={
                  safeMinuteStartIndex ===
                  maxMinuteStartIndex
                }
                aria-label="Next minutes"
              >
                <CaretDownIcon
                  size={16}
                  weight="bold"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}