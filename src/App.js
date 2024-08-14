import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import SurveyDisplay from "./SurveyDisplay";
import Login from "./Login";
import AWSLogin from "./AWSLogin";
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
  //{isLoggedIn ? <SurveyDisplay /> : <AWSLogin />}
  return (
    <div className="app">
      <Sidebar />
      {isLoggedIn ? (
        <SurveyDisplay />
      ) : (
        <>
          <AWSLogin onLogin={handleLogin} />
          <Login onLogin={handleLogin} />
        </>
      )}
    </div>
  );
}

export default App;
