import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => navigate("/level1")}>Level 1: Phishing</button>
      <button onClick={() => navigate("/level2")}>Level 2: Password</button>
      <button onClick={() => navigate("/level3")}>Level 3: Social</button>
      <button onClick={() => navigate("/level4")}>Level 4: Malware</button>
      <button onClick={() => navigate("/level5")}>Level 5: Ransomware</button>
    </div>
  );
}

export default Dashboard;