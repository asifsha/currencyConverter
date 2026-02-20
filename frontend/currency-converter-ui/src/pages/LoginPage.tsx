import { useState } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("converter");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login clicked");
    
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      login(response.data.token);
      navigate("/convert");
    } catch (err: any) {
        console.log("Login error:", err);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
