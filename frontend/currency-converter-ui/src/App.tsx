import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import ConvertPage from "./pages/ConvertPage";
import LatestRatesPage from "./pages/LatestRatesPage";
import HistoricalRatesPage from "./pages/HistoricalRatesPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<Navigate to="/convert" />} />

          <Route
            path="/convert"
            element={<ProtectedRoute><ConvertPage /></ProtectedRoute>}
          />

          <Route
            path="/latest"
            element={<ProtectedRoute><LatestRatesPage /></ProtectedRoute>}
          />

          <Route
            path="/history"
            element={<ProtectedRoute><HistoricalRatesPage /></ProtectedRoute>}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
