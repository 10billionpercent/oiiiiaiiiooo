import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import DatePicker from "../components/DatePicker";
import TimePicker from "../components/TimePicker";

export interface PageLayoutContext {
  deliveryDate: string;
  decisionTime: string;
}

export default function PageLayout() {
  const [deliveryDate, setDeliveryDate] = useState("20260104");
  const [decisionTime, setDecisionTime] = useState("03:00");

  return (
    <>
      <Navbar />

      <main className="page-content">
        <section className="demo-controls">
          <div className="demo-controls-info">
            <h2 className="demo-controls-title">
              Demo Controls
            </h2>

            <p className="demo-controls-description">
              Select the delivery date and decision time used for the forecast
              data.
            </p>
          </div>

          <div className="demo-controls-pickers">
            <DatePicker
              value={deliveryDate}
              onChange={setDeliveryDate}
            />

            <TimePicker
              value={decisionTime}
              onChange={setDecisionTime}
            />
          </div>
        </section>

        <Outlet
          context={{
            deliveryDate,
            decisionTime,
          }}
        />
      </main>
    </>
  );
}