// TemplateMode.js
import React, { useState } from "react";
import "./TemplateMode.css";
import logo from "./assets/cathay.png";

const TemplateMode = ({ username }) => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [view, setView] = useState("grid"); // 'grid' or 'detail'

  const workstations = [
    { id: 1, caption: "適用情境：工作站", image: logo },
    { id: 2, caption: "適用情境：工作站", image: logo },
    { id: 3, caption: "適用情境：工作站", image: logo },
    { id: 4, caption: "適用情境：工作站", image: logo },
    { id: 5, caption: "適用情境：工作站", image: logo },
    { id: 6, caption: "適用情境：工作站", image: logo },
  ];

  const handleStationClick = (station) => {
    setSelectedStation(station);
    setView("detail");
  };

  const handleBackToGrid = () => {
    setView("grid");
    setSelectedStation(null);
  };

  const handleNextStep = () => {
    // 處理下一步邏輯
  };

  // 展示圖片網格
  const renderGrid = () => (
    <>
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
                />
              </div>
              <p className="station-caption">{station.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // 展示單張圖片詳情
  const renderDetail = () => (
    <div className="detail-view">
      <div className="detail-image-container">
        <img
          src={selectedStation?.image}
          alt={`Workflow ${selectedStation?.id}`}
          className="detail-image"
        />
      </div>
      <p className="detail-caption">{selectedStation?.caption}</p>

      <div className="Tnavigation-buttons">
        <button onClick={handleBackToGrid} className="back-button">
          返回
        </button>
        <button onClick={handleNextStep} className="Tnext-button">
          選擇
        </button>
      </div>
    </div>
  );

  return (
    <div className="image-grid-container">
      <h1 className="image-grid-title">
        Hi {username}! Welcome to Smart Archie!
      </h1>
      {view === "grid" ? renderGrid() : renderDetail()}
    </div>
  );
};

export default TemplateMode;
