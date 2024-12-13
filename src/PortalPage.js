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
          <h2>一般模式：</h2>
          <p>
            適用對象：新手架構師、PM、不熟悉架構圖的使用者
            模式介紹：在問卷中每個部分，將提供您選項說明以及相對應服務的圖示，讓您在繪製架構圖的過程，可以更了解不同問題所對應到的相關雲端服務，以更精確的繪製出期望中的架構圖。
          </p>
          <button className="nextStepButton" onClick={handleNextStep}>
            下一步
          </button>
        </div>
      )}
      {selectedMode === "快速模式" && (
        <div className="modeDescription">
          <h2>快速模式：</h2>
          <p>適用對象：</p>
          <p>模式介紹：</p>
          ontrary to popular belief, Lorem Ipsum is not simply random text. It
          has roots in a piece of classical Latin literature from 45 BC, making
          it over 2000 years old. Richard McClintock, a Latin professor at
          Hampden-Sydney College in Virginia, looked up one of the more obscure
          Latin words, consectetur, from a Lorem Ipsum passage, and going
          through the cites of the word in classical literature, discovered the
          undoubtable source. Lorem Ipsum comes from sections 1.10.32 and
          1.10.33 of "de Finibus Bonorum et Malorum"
          <button className="nextStepButton" onClick={handleNextStep}>
            下一步
          </button>
        </div>
      )}
      {selectedMode === "進階模式" && (
        <div className="modeDescription">
          <h2>進階模式：</h2>
          <p>適用對象：</p>
          <p>模式介紹：</p>
          here are many variations of passages of Lorem Ipsum available, but the
          majority have suffered alteration in some form, by injected humour, or
          randomised words which don't look even slightly believable. If you are
          going to use a passage of Lorem Ipsum, you need to be sure there isn't
          anything embarrassing hidden in the middle of text. All the Lorem
          Ipsum generators on the Internet tend to repeat predefined chunks as
          necessary, making this the first true generator on the Internet. It
          uses a dictionary of over 200 Latin words, combined with a handful of
          model sentence structures, to generate Lorem Ipsum which looks
          reasonable. The generated Lorem Ipsum is therefore always free from
          repetition, injected humour, or non-characteristic words etc.
          <button className="nextStepButton" onClick={handleNextStep}>
            下一步
          </button>
        </div>
      )}
    </div>
  );
}

export default PortalPage;
