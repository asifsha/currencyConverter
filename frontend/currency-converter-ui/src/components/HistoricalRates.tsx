import { useState } from "react";
import api from "../api/client";
import type { HistoricalRate, PaginatedResponse } from "../types/rate";
import { Loader } from "./Loader";
import { Pagination } from "./Pagination";

export const HistoricalRates = () => {
  const [base, setBase] = useState("USD");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<HistoricalRate> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<PaginatedResponse<HistoricalRate>>(
        "/rates/historical",
        {
          params: {
            base,
            start,
            end,
            page: pageNumber,
            pageSize: 5,
          },
        }
      );

      setData(response.data);
      setPage(pageNumber);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Historical Rates</h2>

      <input type="date" onChange={(e) => setStart(e.target.value)} />
      <input type="date" onChange={(e) => setEnd(e.target.value)} />

      <button onClick={() => fetchHistory(1)}>Search</button>

      {loading && <Loader />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <>
          <ul>
            {data.data.map((entry) => (
              <li key={entry.date}>
                {entry.date} - {JSON.stringify(entry.rates)}
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={fetchHistory}
          />
        </>
      )}
    </div>
  );
};
