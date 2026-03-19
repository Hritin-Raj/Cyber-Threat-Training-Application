import { useContext } from "react";
import { AppContext } from "../context/AppContext";

function Level1() {
  const { updateScore } = useContext(AppContext);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      updateScore(10);
      alert("Correct! This is phishing.");
    } else {
      alert("Wrong! Check suspicious links.");
    }
  };

  return (
    <div>
      <h2>Level 1: Phishing Detection</h2>

      <p>Email: "Your bank account is blocked. Click here to verify."</p>

      <button onClick={() => handleAnswer(true)}>Phishing</button>
      <button onClick={() => handleAnswer(false)}>Legitimate</button>
    </div>
  );
}

export default Level1;