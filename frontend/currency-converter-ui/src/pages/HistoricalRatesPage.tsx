import { useState } from "react";
import api from "../api/client";
import NavBar from "../components/NavBar";

const HistoricalRatesPage = () => {
  const [base, setBase] = useState("USD");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/rates/historical", {
        params: {
          base,
          start,
          end,
          page: pageNumber,
          pageSize: 5,
        },
      });

      setData(response.data.data);
      setTotalPages(response.data.totalPages);
      setPage(pageNumber);
    } catch (err: any) {
      console.error(err);
      console.error("Error fetching historical rates:", err.response?.data || err); 
      setError(err.response?.data || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <h2>Historical Rates</h2>

      <input type="date" onChange={(e) => setStart(e.target.value)} />
      <input type="date" onChange={(e) => setEnd(e.target.value)} />

      <button onClick={() => fetchHistory(1)}>Search</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {data.map((item, index) => (
          <li key={index}>
            {item.date} - {JSON.stringify(item.rates)}
          </li>
        ))}
      </ul>

      <div>
        <button disabled={page === 1} onClick={() => fetchHistory(page - 1)}>
          Previous
        </button>

        <span> Page {page} of {totalPages} </span>

        <button
          disabled={page === totalPages}
          onClick={() => fetchHistory(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HistoricalRatesPage;
