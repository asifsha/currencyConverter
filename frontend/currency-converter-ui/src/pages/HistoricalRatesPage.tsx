import { useState } from "react";
import api from "../api/client";
import NavBar from "../components/NavBar";

const HistoricalRatesPage = () => {
  const [base] = useState("USD");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateDates = () => {
    if (!start || !end) return "Please select both start and end dates.";

    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
      return "Invalid date format.";

    if (startDate > endDate) return "Start date cannot be after end date.";
    if (endDate > today) return "End date cannot be in the future.";

    return null;
  };

  const fetchHistory = async (pageNumber: number) => {
    const validationError = validateDates();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/rates/historical", {
        params: { base, start, end, page: pageNumber, pageSize: 5 },
      });

      setData(response.data.items ?? []);
      setTotalPages(Math.ceil(response.data.total / 5));
      setPage(pageNumber);
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data === "string") setError(data);
      else if (data?.error) setError(data.error);
      else if (data?.message) setError(data.message);
      else setError("Failed to fetch historical rates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "0 20px" }}>
      <NavBar />
      <h2 style={{ textAlign: "center", margin: "20px 0" }}>Historical Rates</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button
          onClick={() => fetchHistory(1)}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && (
        <p style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16,
        }}
      >
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#323030",
              padding: 16,
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 10px" }}>{item.date}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {Object.entries(item.rates).map(([currency, value]) => (
                <li key={currency}>
                  <strong>{currency}:</strong> {Number(value).toFixed(4)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {data.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            gap: 10,
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => fetchHistory(page - 1)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => fetchHistory(page + 1)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: page === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoricalRatesPage;
