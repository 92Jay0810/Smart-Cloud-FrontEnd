import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import SurveyDisplay from "./SurveyDisplay";
import { jwtDecode } from "jwt-decode";
import AWSLogin from "./AWSLogin";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //檢查token，時效內就自動登陸，token過期就remove token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          // Token有效，可以自動登陸
          console.log("Token is valid, attempting auto-login");
          setIsLoggedIn(true);
        } else {
          // Token過期，直接移除Token。
          console.log("Token has expired remove Token and Cookie");
          localStorage.removeItem("accessToken");
          alert("Session expired, please log in again.");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Failed to decode token", error);
        alert("Failed to decode token please log in again.");
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
      }
    } else {
      console.log("No valid token or cookie found");
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = useCallback(() => {
    console.log("handleLogin called");
    setIsLoggedIn(true);
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
