import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#222", color: "#fff" }}>
      <Link to="/" style={{ marginRight: 10, color: "#fff" }}>Home</Link>
      <Link to="/dashboard" style={{ color: "#fff" }}>Dashboard</Link>
    </nav>
  );
}

export default Navbar;