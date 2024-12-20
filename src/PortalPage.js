import React, { useState } from "react";
import "./PortalPage.css";
const modes = {
  一般模式: {
    title: "General mode",
    suitable: "適用對象：PM、新手架構師、不熟悉架構圖的使用者",
    description:
      "模式介紹：\n用每個部分，將提供您選項說明以及相對應服務的圖示，讓您在繪製架構圖的過程，可以更了解不同問題所對應到的相關雲端服務，以更精確的繪製出期望中的架構圖。",
  },
  快速模式: {
    title: "Fast mode",
    suitable: "適用對象：想快速完成架構圖設計的使用者",
    description:
      "模式介紹：\n將直接跳過問卷，提供您多個常用場景的架構圖模板供您挑選，可快速完成初版架構圖設計，並透過多輪對話框調整細節。",
  },
  進階模式: {
    title: "Advanced mode",
    suitable: "適用對象：資深架構師、想彈性調整架構圖的使用者",
    description:
      "模式介紹：\n透過搜尋頁面選擇繪製架構圖所需服務\n送出後得到ＸＭＬ檔，並送到draw io抑或是進行多輪對話體整需求。",
  },
};
function PortalPage({ username, onSelectService }) {
  const [selectedMode, setSelectedMode] = useState(null); // 跟踪選擇的模式
  return (
    <div className="portal-page">
      <h1 className="portal-title">Hi {username}! Welcome to Smart Archie!</h1>
      <strong className="portal-subtitle">
        Please select the mode you want to use
      </strong>
      <br />
      <br />
      <div className="mode-grid">
        {Object.entries(modes).map(([mode, info]) => (
          <div key={mode} className="mode-container">
            <button
              onClick={() => setSelectedMode(mode)}
              className={`mode-button ${
                selectedMode === mode ? "selected" : ""
              }`}
            >
              {mode}
              <div className="mode-subtitle">{info.title}</div>
            </button>

            {selectedMode === mode && (
              <div className="mode-info">
                <p className="mode-suitable">{info.suitable}</p>
                <p className="mode-description">{info.description}</p>
                <button
                  onClick={() => onSelectService(mode)}
                  className="next-button"
                >
                  下一步
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortalPage;
