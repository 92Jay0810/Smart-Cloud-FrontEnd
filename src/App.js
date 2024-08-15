import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import SurveyDisplay from "./SurveyDisplay";
import AWSLogin from "./AWSLogin";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = document.cookie
      .split(";")
      .some((item) => item.trim().startsWith("loggedIn="));
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = useCallback(() => {
    console.log("handleLogin called");
    setIsLoggedIn(true);
    // 增加一個cookie 來表示登陸
    document.cookie = "loggedIn=true; max-age=3600; path=/";
  }, []);
  return (
    <div className="app">
      <Sidebar />
      {isLoggedIn ? (
        <SurveyDisplay />
      ) : (
        <>
          <AWSLogin onLogin={handleLogin} />
        </>
      )}
    </div>
  );
}

export default App;
