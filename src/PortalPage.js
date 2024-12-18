import React, { useState } from "react";
import "./PortalPage.css";
function PortalPage({ username, onSelectService }) {
  const [selectedMode, setSelectedMode] = useState(null); // 跟踪選擇的模式
  const handleModeSelection = (mode) => {
    setSelectedMode(mode); // 更新當前選擇的模式
  };
  const handleNextStep = () => {
    onSelectService(selectedMode); // 確認模式並進入下一頁
  };
  return (
    <div className="portalPage">
      <h1>Hi {username}! Welcome to Smart Archie!</h1>
      <strong>Please select the mode you want to use</strong>
      <br />
      <div className="serviceButtons">
        <button onClick={() => handleModeSelection("一般模式")}>
          一般模式 
        </button>
        <button onClick={() => handleModeSelection("快速模式")}>
          快速模式
        </button>
        <button onClick={() => handleModeSelection("進階模式")}>
          進階模式
        </button>
      </div>
      {/* 顯示對應模式的說明 */}
      {selectedMode === "一般模式" && (
        <div className="modeDescription">
          <h3>一般模式</h3>
          <p>
            適用對象：新手架構師、PM、不熟悉架構圖的使用者</p>
          <p>模式介紹：</p>
          在問卷中每個部分，將提供您選項說明以及相對應服務的圖示，讓您在繪製架構圖的過程，可以更了解不同問題所對應到的相關雲端服務，以更精確的繪製出期望中的架構圖。
          <br />
          <button className="nextStepButton" onClick={handleNextStep}>
            下一步
          </button>
        </div>
      )}
      {selectedMode === "快速模式" && (
        <div className="modeDescription">
          <h3>快速模式</h3>
          <p>
            適用對象：想快速完成架構圖設計的使用者</p>
            <p>模式介紹：</p>
            將直接跳過問卷，提供您多個常用場景的架構圖模板供您挑選，可快速完成初版架構圖設計，並透過多輪對話框調整細節。
          <button className="nextStepButton" onClick={handleNextStep}>
            下一步
          </button>
        </div>
      )}
      {selectedMode === "進階模式" && (
        <div className="modeDescription">
          <h3>進階模式</h3>
          <p>適用對象：資深架構師、想彈性調整架構圖的使用者</p>
          <p>模式介紹：</p>
          <p>透過搜尋頁面選擇繪製架構圖所需服務<br/> 送出後得到ＸＭＬ檔，並送到draw io抑或是進行多輪對話體整需求。</p>
          <button className="nextStepButton" onClick={handleNextStep}>
            下一步
          </button>
        </div>
      )}
    </div>
  );
}

export default PortalPage;
