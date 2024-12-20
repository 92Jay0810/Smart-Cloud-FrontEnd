import React, { useState } from "react";
import "./PortalPage.css";

const modes = {
  一般模式: {
    title: "General mode",
    suitable: "適用對象：",
    suitable2: " • PM\n • 新手架構師\n • 不熟悉架構圖的使用者",
    description:
      "模式介紹：",
    description2:" • 問卷每個部分提供選項說明\n • 問卷選項提供相對應服務的圖示\n • 幫助了解不同問題對應的雲端服務",
  },
  快速模式: {
    title: "Fast mode",
    suitable: "適用對象：",
    suitable2: " • 架構師\n • 想快速開始架構圖設計的使用者",
    description:
      "模式介紹：",
    description2: " • 直接提供多個常用場景的架構圖模板\n • 可快速完成初版架構圖設計\n • 透過多輪對話框調整細節",
  },
  進階模式: {
    title: "Advanced mode",
    suitable: "適用對象：",
    suitable2: " • 資深架構師 \n • 想彈性調整架構圖的使用者",
    description:
      "模式介紹：",
    description2:" • 使用搜尋頁面選擇繪製架構圖所需服務\n • 送出後得到XML檔\n • 可將XML檔送到draw io或進行多輪對話體整需求",
  },
};

function PortalPage({ username, onSelectService }) {
  const [selectedMode, setSelectedMode] = useState(null);

  const toggleMode = (mode) => {
    setSelectedMode((prevMode) => (prevMode === mode ? null : mode));
  };

  return (
    <div className="portal-page">
      <h1 className="portal-title">Hi {username}! Welcome to Smart Archie!</h1>
      <strong className="portal-subtitle">
        Please select the mode you want to use
      </strong>
      <div className="mode-grid">
        {Object.entries(modes).map(([mode, info]) => (
          <div
            key={mode}
            className={`mode-container ${selectedMode === mode ? "expanded" : ""}`}
          >
            <button
              onClick={() => toggleMode(mode)}
              className={`mode-button ${selectedMode === mode ? "selected" : ""}`}
            >
              {mode}
              <div className="mode-subtitle">{info.title}</div>
            </button>

            {selectedMode === mode && (
              <div className="mode-info">
                <p className="mode-suitable">{info.suitable}</p>
                <p className="mode-suitable2">{info.suitable2}</p>
                <p className="mode-description">{info.description}</p>
                <p className="mode-description2">{info.description2}</p>
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
