function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        margin: "10px",
        background: "#007bff",
        color: "#fff",
        border: "none",
        cursor: "pointer"
      }}
    >
      {text}
    </button>
  );
}

export default Button;