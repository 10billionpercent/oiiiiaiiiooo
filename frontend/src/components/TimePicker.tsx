import { useEffect, useRef, useState } from "react";

interface TimePickerProps {
  value: string; // HH:MM
  onChange: (time: string) => void;
  placeholder?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const isValidTime = (value: string) => {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

export default function TimePicker({
  value,
  onChange,
  placeholder = "HH:MM",
}: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const [selectedHour, selectedMinute] = value
    ? value.split(":")
    : ["00", "00"];

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
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const selectTime = (hour: string, minute: string) => {
    onChange(`${hour}:${minute}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextValue = e.target.value;

    // Allow typing while editing
    if (nextValue.length <= 5) {
      onChange(nextValue);
    }
  };

  const openPicker = () => {
    setShowPicker(true);
  };

  return (
    <div className="time-picker-wrapper" ref={pickerRef}>
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
            // Don't immediately close because clicking the picker
            // happens after the input loses focus.
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
            <div className="time-picker-column">
              <div className="time-picker-column-title">
                HOURS
              </div>

              <div
                className="time-picker-scroll"
                ref={hoursRef}
              >
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    className={`time-picker-option ${
                      selectedHour === hour ? "selected" : ""
                    }`}
                    onClick={() =>
                      selectTime(hour, selectedMinute)
                    }
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            <div className="time-picker-separator">:</div>

            <div className="time-picker-column">
              <div className="time-picker-column-title">
                MINUTES
              </div>

              <div
                className="time-picker-scroll"
                ref={minutesRef}
              >
                {MINUTES.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    className={`time-picker-option ${
                      selectedMinute === minute ? "selected" : ""
                    }`}
                    onClick={() =>
                      selectTime(selectedHour, minute)
                    }
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}