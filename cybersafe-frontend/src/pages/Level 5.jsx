function Level5() {
  return (
    <div>
      <h2>Ransomware Attack</h2>

      <p>Your files are encrypted!</p>

      <button onClick={() => alert("Wrong! Don't pay ransom.")}>
        Pay
      </button>

      <button onClick={() => alert("Correct! Use backups.")}>
        Restore Backup
      </button>
    </div>
  );
}

export default Level5;