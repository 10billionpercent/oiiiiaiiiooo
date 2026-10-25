import { AnimatePresence, motion } from "framer-motion";
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
  const [endDate, setEndDate] = useState("20260107");
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

            <AnimatePresence mode="wait">
              <motion.p
                key={isAccuracyPage ? "accuracy-description" : "forecast-description"}
                className="demo-controls-description"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {isAccuracyPage
                  ? "Select the date range and decision time used for the accuracy analysis."
                  : "Select the delivery date and decision time used for the forecast data."}
              </motion.p>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {isAccuracyPage ? (
              <motion.div
                key="accuracy-pickers"
                className="demo-controls-pickers"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
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

                <div className="demo-control-picker">
                  <span className="demo-control-label">
                    Decision time (UTC)
                  </span>

                  <TimePicker
                    value={decisionTime}
                    onChange={setDecisionTime}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="forecast-pickers"
                className="demo-controls-pickers"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            <Outlet
              context={{
                deliveryDate,
                startDate,
                endDate,
                decisionTime,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}