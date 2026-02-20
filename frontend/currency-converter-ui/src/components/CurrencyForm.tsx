import { useState } from "react";
import api from "../api/client";
import type { ConversionResponse } from "../types/rate";
import { Loader } from "./Loader";

export const CurrencyForm = () => {
  const [amount, setAmount] = useState<number>(0);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ConversionResponse>(
        `/rates/convert`,
        { params: { from, to, amount } }
      );

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Currency Conversion</h2>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Amount"
      />

      <input value={from} onChange={(e) => setFrom(e.target.value)} />
      <input value={to} onChange={(e) => setTo(e.target.value)} />

      <button onClick={handleConvert}>Convert</button>

      {loading && <Loader />}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <p>Result: {result.result}</p>}
    </div>
  );
};
