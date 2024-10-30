import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import SurveyDisplay from "./SurveyDisplay";
import { jwtDecode } from "jwt-decode";
import AWSLogin from "./AWSLogin";
import "./App.css";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setusername] = useState("");
  const [user_id, setuser_id] = useState("");
  const [idToken, setidToken] = useState("");
  //重製用
  const [resetTrigger, setResetTrigger] = useState(0);
  //檢查token，時效內就自動登陸，token過期就remove token
  const cleanupSession = () => {
    const intervalId = localStorage.getItem("refreshIntervalId");
    if (intervalId) {
      clearInterval(parseInt(intervalId));
    }

    localStorage.removeItem("IdToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("refreshIntervalId");

    setIsLoggedIn(false);
    handleReset();
    alert("Session expired, please log in again.");
  };
  useEffect(() => {
    const token = localStorage.getItem("IdToken");
    const loginTime = parseInt(localStorage.getItem("loginTime") || "0");
    const currentTime = Date.now();
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // 檢查token是否在有效期內且未超過4小時session
        if (
          decodedToken.exp * 1000 > currentTime &&
          currentTime - loginTime < 4 * 60 * 60 * 1000
        ) {
          // Token有效，可以自動登陸
          console.log("Token is valid, attempting auto-login");
          setidToken(token);
          const accessToken = localStorage.getItem("accessToken");
          const decodedToken = jwtDecode(accessToken);
          setusername(decodedToken.username || decodedToken.email || "User");
          setuser_id(decodedToken.sub);
          setIsLoggedIn(true);
        } else {
          // Token過期，直接移除Token。
          console.log("Token has expired or session timeout");
          cleanupSession();
        }
      } catch (error) {
        console.error("Failed to decode token", error);
        cleanupSession();
      }
    }
  }, []);

  const handleLogin = useCallback(() => {
    console.log("handleLogin called");
    const idToken = localStorage.getItem("IdToken");
    setidToken(idToken);
    const accessToken = localStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    setusername(decodedToken.username || decodedToken.email || "User");
    setuser_id(decodedToken.sub);
    setIsLoggedIn(true);
  }, []);
  const handleLogout = useCallback(() => {
    console.log("handleLogout called");
    localStorage.removeItem("IdToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("refreshIntervalId");
    setIsLoggedIn(false);
    setusername("");
    setuser_id("");
    setidToken("");
    handleReset();
  }, []);
  const handleReset = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);
  return (
    <div className="app">
      <Sidebar
        onReset={handleReset}
        handleLogout={handleLogout}
        isLoggedIn={isLoggedIn}
      />
      <div className="mainContent">
        {isLoggedIn ? (
          <>
            <SurveyDisplay
              idToken={idToken}
              user_id={user_id}
              username={username}
              resetTrigger={resetTrigger}
            />
          </>
        ) : (
          <>
            <AWSLogin onLogin={handleLogin} />
          </>
        )}
      </div>
    </div>

    // <div className="app">
    //   <Sidebar onReset={handleReset} />
    //   {isLoggedIn ? (
    //     <>
    //       <button onClick={handleLogout} className="logout-button">
    //         Logout
    //       </button>
    //       <SurveyDisplay
    //         idToken={idToken}
    //         user_id={user_id}
    //         username={username}
    //         resetTrigger={resetTrigger}
    //       />
    //     </>
    //   ) : (
    //     <>
    //       <AWSLogin onLogin={handleLogin} />
    //     </>
    //   )}
    // </div>
  );
}
export default App;
