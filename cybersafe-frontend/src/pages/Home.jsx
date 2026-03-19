import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center" }}>
      <h1>CyberSafe Training</h1>
      <p>Learn Cyber Threats Interactively</p>
      <Button text="Start Training" onClick={() => navigate("/dashboard")} />
    </div>
  );
}

export default Home;