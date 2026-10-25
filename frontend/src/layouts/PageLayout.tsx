import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import DatePicker from "../components/DatePicker";
import TimePicker from "../components/TimePicker";

export interface PageLayoutContext {
  deliveryDate: string;
  startDate: string;
  endDate: string;
  decisionTime: string;
}

export default function PageLayout() {
  const location = useLocation();

  const isAccuracyPage = location.pathname === "/accuracy";

  const [deliveryDate, setDeliveryDate] = useState("20260104");
  const [startDate, setStartDate] = useState("20260104");
  const [endDate, setEndDate] = useState("20260104");
  const [decisionTime, setDecisionTime] = useState("03:00");

  return (
    <>
      <Navbar />

      <main className="page-content">
        <section
          className={`demo-controls ${
            isAccuracyPage ? "demo-controls-accuracy" : ""
          }`}
        >
          <div className="demo-controls-info">
            <h2 className="demo-controls-title">
              Demo Controls
            </h2>

            <p className="demo-controls-description">
              {isAccuracyPage
                ? "Select the date range and decision time used for the accuracy analysis."
                : "Select the delivery date and decision time used for the forecast data."}
            </p>
          </div>

          {isAccuracyPage ? (
            <div className="demo-controls-accuracy-pickers">
              <div className="demo-controls-date-pickers">
                <div className="demo-control-picker">
                  <span className="demo-control-label">
                    Start date
                  </span>

                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                  />
                </div>

                <div className="demo-control-picker">
                  <span className="demo-control-label">
                    End date
                  </span>

                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                  />
                </div>
              </div>

              <div className="demo-control-picker">
                <span className="demo-control-label">
                  Decision time (UTC)
                </span>

                <TimePicker
                  value={decisionTime}
                  onChange={setDecisionTime}
                />
              </div>
            </div>
          ) : (
            <div className="demo-controls-pickers">
              <div className="demo-control-picker">
                <span className="demo-control-label">
                  Delivery date
                </span>

                <DatePicker
                  value={deliveryDate}
                  onChange={setDeliveryDate}
                />
              </div>

              <div className="demo-control-picker">
                <span className="demo-control-label">
                  Decision time (UTC)
                </span>

                <TimePicker
                  value={decisionTime}
                  onChange={setDecisionTime}
                />
              </div>
            </div>
          )}
        </section>

        <Outlet
          context={{
            deliveryDate,
            startDate,
            endDate,
            decisionTime,
          }}
        />
      </main>
    </>
  );
}