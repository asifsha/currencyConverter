import { useState } from "react";
import api from "../api/client";
import NavBar from "../components/NavBar";

const ConvertPage = () => {
  const [amount, setAmount] = useState(0);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/rates/convert", {
        params: { from, to, amount },
      });

      setResult(response.data.result);
    } catch (err: any) {
      setError(err.response?.data?.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <h2>Currency Conversion</h2>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <input value={from} onChange={(e) => setFrom(e.target.value)} />
      <input value={to} onChange={(e) => setTo(e.target.value)} />

      <button onClick={handleConvert}>
        {loading ? "Converting..." : "Convert"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {result !== null && <p>Result: {result}</p>}
    </div>
  );
};

export default ConvertPage;
