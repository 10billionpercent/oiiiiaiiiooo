import { Navigate, Route, Routes } from "react-router-dom";

import PageLayout from "./layouts/PageLayout";
import ForecastExplorerPage from "./pages/ForecastExplorerPage";
import AccuracyAnalysisPage from "./pages/AccuracyAnalysisPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route
          path="/"
          element={<Navigate to="/forecast" replace />}
        />

        <Route
          path="/forecast"
          element={<ForecastExplorerPage />}
        />

        <Route
          path="/accuracy"
          element={<AccuracyAnalysisPage />}
        />
      </Route>
    </Routes>
  );
}