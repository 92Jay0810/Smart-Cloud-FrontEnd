import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import SurveyDisplay from "./SurveyDisplay";
import Login from "./Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = document.cookie
      .split(";")
      .some((item) => item.trim().startsWith("loggedIn="));
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="app">
      <Sidebar />
      {isLoggedIn ? <SurveyDisplay /> : <Login onLogin={handleLogin} />}
    </div>
  );
}

export default App;
