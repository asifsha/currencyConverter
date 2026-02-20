import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NavBar = () => {
  const { logout } = useAuth();

  return (
    <nav style={{ marginBottom: 20 }}>
      <Link to="/convert">Convert</Link> |{" "}
      <Link to="/latest">Latest Rates</Link> |{" "}
      <Link to="/history">Historical</Link> |{" "}
      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default NavBar;
