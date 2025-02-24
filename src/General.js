import React, { useCallback, useEffect, useRef, useState } from "react";
import Survey from "./Survey";
import Display from "./Display";
import { v4 as uuidv4 } from "uuid";
import "./SurveyDisplay.css";
function General({
  idToken,
  user_id,
  username,
  handleBackPrortalPage,
  onRefreshTokenCheck,
  handleLogout,
}) {
  // 讀取 cookie 的函數
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
  // 重置函數
  const resetSurvey = useCallback(() => {
    setSubmitted(false);
    setSurveyData(null);
    setPlatform("");
    setTool("");
    // 清除相關的 cookie
    setCookie("submitted", "", -1);
    setCookie("surveyData", "", -1);
    setCookie("platform", "", -1);
    setCookie("tool", "", -1);
    // 如果子元件存在，呼叫它們的 reset 方法
    if (displayRef.current) displayRef.current.reset();
  }, []);

  //token過期呼叫
  const handleRefreshTokenCheck = () => {
    // 先執行當前組件的重置
    resetSurvey();
    console.log("Refreshcall in SurveyDisplay");
    onRefreshTokenCheck();
  };
  const [submitted, setSubmitted] = useState(() => {
    const saved = getCookie("submitted");
    return saved ? JSON.parse(saved) : false;
  });
  const [surveyData, setSurveyData] = useState(() => {
    const data = getCookie("surveyData");
    return data ? JSON.parse(data) : {};
  }, []);
  const [platform, setPlatform] = useState(() => {
    return getCookie("platform") || "";
  });
  const [tool, setTool] = useState(() => {
    return getCookie("tool") || "";
  });

  const [session_id, setSession_id] = useState(() => {
    const saved = getCookie("session_id");
    if (saved) {
      return saved;
    } else {
      const newSessionId = uuidv4();
      setCookie("session_id", newSessionId);
      return newSessionId;
    }
  });

  // 建立 ref 用於呼叫子元件內部的 reset 方法
  const displayRef = useRef();

  // 更新 cookie 的函數
  const updateCookies = () => {
    setCookie("submitted", submitted);
    setCookie("surveyData", JSON.stringify(surveyData));
    setCookie("platform", platform);
    setCookie("tool", tool);
    setCookie("session_id", session_id);
  };

  // 在狀態更新時更新 cookie
  useEffect(() => {
    updateCookies();
  }, [submitted, platform, tool, surveyData, session_id]);

  //返回按鈕
  const handleBack = useCallback(() => {
    resetSurvey(); // 先執行當前組件的重置
    handleBackPrortalPage(); // 返回服務選擇頁面
  }, [resetSurvey, handleBackPrortalPage]);

  //登出按鈕
  const handleLogoutButton = () => {
    // 先執行當前組件的重置
    resetSurvey();
    handleLogout();
  };
  //傳surveyData,tool,plafrom,session_id交給display
  const handleSurveySubmit = (surveyData, tool, platform, session_id) => {
    setSubmitted(true);
    setSurveyData(JSON.stringify(surveyData)); // 確保不會傳入物件
    setTool(tool);
    setPlatform(platform);
    setSession_id(session_id);
  };
  return (
    <div className="survey-display">
      <div className="header-container">
        <button onClick={handleBack} className="back-button">
          返回
        </button>
        <button onClick={handleLogoutButton} className="next-button">
          登出
        </button>
      </div>
      {/* 根據 submitted 狀態顯示不同元件，同時傳入 ref */}
      {!submitted ? (
        <Survey
          onSubmit={handleSurveySubmit}
          username={username}
          user_id={user_id}
          handleBackPrortalPage={handleBackPrortalPage}
        />
      ) : (
        <Display
          idToken={idToken}
          username={username}
          user_id={user_id}
          surveyData={surveyData}
          tool={tool}
          platform={platform}
          session_id={session_id}
          onRefreshTokenCheck={handleRefreshTokenCheck}
          ref={displayRef}
        />
      )}
    </div>
  );
}

export default General;
