function Level3() {
  const handleChoice = (choice) => {
    if (choice === "safe") {
      alert("Good! Never share OTP.");
    } else {
      alert("Scam! Never share OTP.");
    }
  };

  return (
    <div>
      <h2>Bank OTP Scam</h2>
      <p>Caller: "Please share OTP to verify your account."</p>

      <button onClick={() => handleChoice("safe")}>Refuse</button>
      <button onClick={() => handleChoice("unsafe")}>Share OTP</button>
    </div>
  );
}

export default Level3;