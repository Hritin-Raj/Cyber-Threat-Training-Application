import { useState } from "react";

function Level2() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");

  const checkStrength = (pwd) => {
    if (pwd.length > 10) setStrength("Strong");
    else if (pwd.length > 6) setStrength("Medium");
    else setStrength("Weak");
  };

  return (
    <div>
      <h2>Password Strength Checker</h2>

      <input
        type="text"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          checkStrength(e.target.value);
        }}
      />

      <p>Strength: {strength}</p>
    </div>
  );
}

export default Level2;