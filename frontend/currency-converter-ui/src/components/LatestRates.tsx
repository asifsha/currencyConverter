import { useEffect, useState } from "react";
import api from "../api/client";
import type { LatestRatesResponse } from "../types/rate";
import { Loader } from "./Loader";

export const LatestRates = () => {
  const [base, setBase] = useState("USD");
  const [rates, setRates] = useState<LatestRatesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<LatestRatesResponse>(
        "/rates/latest",
        { params: { base } }
      );

      setRates(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load rates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [base]);

  return (
    <div>
      <h2>Latest Rates</h2>
      <input value={base} onChange={(e) => setBase(e.target.value)} />

      {loading && <Loader />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {rates && (
        <ul>
          {Object.entries(rates.rates).map(([currency, value]) => (
            <li key={currency}>
              {currency}: {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
