import { useEffect, useState } from "react";
import api from "../api/client";
import NavBar from "../components/NavBar";

const LatestRatesPage = () => {
  const [base, setBase] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/rates/latest", {
        params: { base },
      });

      setRates(response.data.rates);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [base]);

  return (
    <div>
      <NavBar />
      <h2>Latest Exchange Rates</h2>

      <input value={base} onChange={(e) => setBase(e.target.value)} />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {Object.entries(rates).map(([currency, value]) => (
          <li key={currency}>
            {currency}: {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatestRatesPage;
