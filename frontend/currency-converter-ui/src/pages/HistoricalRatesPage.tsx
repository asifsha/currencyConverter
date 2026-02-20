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

  const validateDates = () => {
    if (!start || !end) {
      return "Please select both start and end dates.";
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Invalid date format.";
    }

    if (startDate > endDate) {
      return "Start date cannot be after end date.";
    }

    if (endDate > today) {
      return "End date cannot be in the future.";
    }

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
        params: {
          base,
          start,
          end,
          page: pageNumber,
          pageSize: 5,
        },
      });
      setData(response.data.items ?? []);
      setTotalPages(Math.ceil(response.data.total / 5));
      setPage(pageNumber);
    } catch (err: any) {
      const data = err.response?.data;

      if (typeof data === "string") {
        setError(data);
      } else if (data?.error) {
        setError(data.error);
      } else if (data?.message) {
        setError(data.message);
      } else if (data?.title) {
        setError(data.title);
      } else {
        setError("Failed to fetch historical rates");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <h2>Historical Rates</h2>

      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />

      <input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />

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
