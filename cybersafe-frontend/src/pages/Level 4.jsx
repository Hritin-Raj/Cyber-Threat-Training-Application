function Level4() {
  return (
    <div>
      <h2>Suspicious Download</h2>

      <p>File: free_movie.exe</p>

      <button onClick={() => alert("Correct! Suspicious file.")}>
        Scan First
      </button>

      <button onClick={() => alert("System infected!")}>
        Open File
      </button>
    </div>
  );
}

export default Level4;