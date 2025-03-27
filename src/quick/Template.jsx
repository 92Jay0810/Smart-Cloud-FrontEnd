import React, { useState, useEffect,useCallback } from "react";
import "../App.css";
import close from "../assets/grey close.png";
import { v4 as uuidv4 } from "uuid";
import template_data from "../data/template_data"; 
function Template({ onSubmit, user_id, handleBack, handleLogoutButton }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //模板資料
  const [workstations, setWorkstations] = useState([]);
  useEffect(() => {
    // 未來可以改為 fetch('/templates')
    setWorkstations(template_data);
  }, []);

  const handleStationClick = (station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStation(null);
    setIsModalOpen(false);
  };

  const handleNextStep = async (template, plafrom) => {
    setSelectedStation(null);
    setIsModalOpen(false);
    const newSessionId = uuidv4();
    console.log("New Session ID generated:", newSessionId);
    const SubmitAnswers = {
      template: template,
      session_id: newSessionId,
      user_id: user_id,
      tool: "drawio",
    };
    console.log("傳送格式:\n", SubmitAnswers);
    onSubmit(SubmitAnswers, plafrom, newSessionId);
  };

  //返回按鈕
  const handleBackButton = useCallback(() => {
    handleBack();
  });

  //登出按鈕
  const handleLogoutButton2 = () => {
    handleLogoutButton();
  };

  return (
    <div className="image-grid-container">
      <div className="header-container">
        <button onClick={handleBackButton} className="backk-button">
          返回
        </button>
        <button onClick={handleLogoutButton2} className="next-button">
          登出
        </button>
      </div>
      <h1 className="image-grid-title">
        {" "}
        歡迎使用快速模式，請選擇您想使用的架構圖模板！
      </h1>
      <div className="image-grid">
        {workstations.map((station) => (
          <div
            key={station.id}
            className="station-card"
            onClick={() => handleStationClick(station)}
          >
            <div className="card-content">
              <div className="image-container">
                <img
                  src={station.image}
                  alt={`Workflow ${station.id}`}
                  className="station-image"
                  loading="lazy"
                />
              </div>
              <p className="station-caption">{station.caption}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* 模態框 */}
      {isModalOpen && selectedStation && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // 防止點擊內部關閉模態框
          >
            <div className="modal-layout">
              {/* 左邊側邊欄和資訊 */}
              <div className="modal-sidebar">
                <h1 className="detail-caption">{selectedStation.caption}</h1>
                <h4 className="detail-subtitle">{selectedStation.subtitle}</h4>
                <h4 className="detail-subtitle2">
                  {selectedStation.subtitle2}
                </h4>
                <p className="detail-content">{selectedStation.content}</p>

                <button
                  className="Tnext-button"
                  onClick={() =>
                    handleNextStep(
                      selectedStation.backendAPI,
                      selectedStation.plamform
                    )
                  }
                >
                  選擇模板
                </button>
                <button className="exit-button" onClick={handleCloseModal}>
                  <img
                    src={close}
                    style={{ width: "24px", height: "24px" }}
                    alt="Close"
                  />
                </button>
              </div>

              {/* 右邊圖片 */}
              <div className="modal-image-container">
                <img
                  src={selectedStation.image}
                  alt={`Workflow ${selectedStation.id}`}
                  className="detail-image"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Template;
