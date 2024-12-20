import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import PortalPage from "./PortalPage";
import TemplateMode from "./TemplateMode";
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
  const [showModal, setShowModal] = useState(false);
  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };
  // 設置 cookie 的函數
  const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  };
  //選擇服務
  const [selectedService, setSelectedService] = useState(() => {
    const selectedService = getCookie("selectedService");
    return selectedService ? selectedService : null;
  });
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
  // 讀取 cookie 的函數

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
    setSelectedService(null);
    setCookie("selectedService", "", -1);
    setResetTrigger((prev) => prev + 1);
  }, []);
  const handleServiceSelection = (service) => {
    setSelectedService(service);
  };
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
    setIsLoggedIn(false);
    setusername("");
    setuser_id("");
    setidToken("");
    //setSelectedService(null);
    //setCookie("selectedService", "", -1);
    handleReset();
  }, []);
  // 更新 cookie 的函數
  const updateCookies = () => {
    setCookie("selectedService", selectedService);
  };
  // 在狀態更新時更新 cookie
  useEffect(() => {
    updateCookies();
  }, [selectedService]);
  //檢查token過期
  useEffect(() => {
    const checkSession = () => {
      const accessToken = localStorage.getItem("accessToken");
      const IdToken = localStorage.getItem("IdToken");

      // 如果 token 缺失，直接返回
      if (!accessToken || !IdToken) {
        console.log("Missing tokens, skipping session expiration check.");
        return;
      }
      try {
        const decodedToken = jwtDecode(IdToken);
        const currentTime = Math.floor(Date.now() / 1000); // 當前時間（秒）

        // 檢查 idToken 的 exp（過期時間）是否已過
        if (decodedToken.exp <= currentTime) {
          console.log("Token expired, calling handleSessionExpiration");
          handleSessionExpiration();
        }
      } catch (error) {
        console.error("Failed to decode IdToken", error);
        handleSessionExpiration(); // token無法處理，直接預設過期。
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
          selectedService === null ? (
            <PortalPage
              username={username}
              onSelectService={handleServiceSelection}
            />
          ) : selectedService === "一般模式" ? (
            <SurveyDisplay
              idToken={idToken}
              user_id={user_id}
              username={username}
              resetTrigger={resetTrigger}
              onRefreshTokenCheck={handleRefreshTokenCheck}
            />
          ) : selectedService === "快速模式" ? (
            <TemplateMode username={username} />
          ) : (
            <div>Selected Service: {selectedService}</div> // 其他服務之後再加入
          )
        ) : (
          <AWSLogin onLogin={handleLogin} />
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
