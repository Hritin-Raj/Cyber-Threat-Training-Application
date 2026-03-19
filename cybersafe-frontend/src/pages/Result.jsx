import { useContext } from "react";
import { AppContext } from "../context/AppContext";

function Result() {
  const { score } = useContext(AppContext);

  return (
    <div>
      <h2>Final Score: {score}</h2>
    </div>
  );
}

export default Result;