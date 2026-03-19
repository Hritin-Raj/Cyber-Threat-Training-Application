import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const updateScore = (points) => {
    setScore((prev) => prev + points);
  };

  return (
    <AppContext.Provider value={{ score, level, setLevel, updateScore }}>
      {children}
    </AppContext.Provider>
  );
};