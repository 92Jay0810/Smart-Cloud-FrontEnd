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

  //Session Expiration Related
  const [refreshTokenTrigger, setrefreshTokenTrigger] = useState(0);
  const [showModal, setShowModal] = useState(true);
  //檢查token，時效內就自動登陸，token過期就remove token
  useEffect(() => {
    const token = localStorage.getItem("IdToken");
    if (token) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const decodedToken = jwtDecode(accessToken);
        setusername(decodedToken.username || decodedToken.email || "User");
        setuser_id(decodedToken.sub);
        setidToken(token);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to decode token", error);
        handleLogout();
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
    setIsLoggedIn(false);
    setusername("");
    setuser_id("");
    setidToken("");
    handleReset();
  }, []);
  const handleReset = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);
  const handleRefreshTokenCheck = useCallback(() => {
    setrefreshTokenTrigger((prev) => {
      const newValue = prev + 1;
      console.log("Updating refreshTokenTrigger:", prev, "->", newValue);
      return newValue;
    });
  }, []);
  const closeModal = () => {
    setShowModal(false);
  };
  const handleSessionExpiration = useCallback(() => {
    console.log("call remove Expiration session in AWSLogin");
    // 清除所有相關的存儲和狀態
    localStorage.removeItem("accessToken");
    localStorage.removeItem("IdToken");
    setShowModal(true);
    window.location.reload();
  }, []);

  useEffect(() => {
    const checkSession = () => {
      const accessToken = localStorage.getItem("accessToken");
      const IdToken = localStorage.getItem("IdToken");

      if (accessToken && IdToken) {
        const decodedToken = jwtDecode(IdToken);
        const currentTime = Math.floor(Date.now() / 1000); // 當前時間（秒）

        // 檢查 idToken 的 exp（過期時間）是否已過
        if (decodedToken.exp <= currentTime) {
          handleSessionExpiration();
        }
      }
    };

    // 畫面載入時自動刷新
    checkSession();
    console.log(
      "Effect triggered with refreshTokenTrigger:",
      refreshTokenTrigger
    );
  }, [refreshTokenTrigger]);

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
              onRefreshTokenCheck={handleRefreshTokenCheck}
            />
          </>
        ) : (
          <>
            <AWSLogin onLogin={handleLogin} />
          </>
        )}
      </div>
      {showModal && (
        <>
          {/* 背景遮罩 */}
            <div className="modal_overlay" onClick={closeModal}></div>
            <div className="modal">
              <div className="modal_content">
                <p>The session token has expired, please try to login again.</p>
                <button className="buttons" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
        </>
      )}
    </div>
  );
}
export default App;
