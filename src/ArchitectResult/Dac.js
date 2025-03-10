import ProgressBar from "@ramonak/react-progress-bar";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import "../App.css";
import { AppContext } from "../AppContext";
function Dac({ username, platform }) {
  const { apiResponseReceived, error_message, imageUrl, savecode } =
    useContext(AppContext);
  // 重置函數,一進來就reset
  useEffect(() => {
    // 重置其他相關狀態
    setFileName("");
    setProgress(0);
    clearInterval(progressRef.current);
  }, []);
  const resetSurvey = useCallback(() => {
    // 重置其他相關狀態
    setFileName("");
    setProgress(0);
    clearInterval(progressRef.current);
  }, []);

  //saveDialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState("");

  // Zoom in/out
  const [scale, setScale] = useState(1); // 初始縮放比例

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 1.8)); // 最大缩放2倍
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // 最小缩放0.5倍
  };

  //生成圖片進度條
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const progress_text = [
    " ",
    "請稍候",
    "正在確認您選擇的服務",
    "圖片生成架構中",
    "架構圖排版繪製中",
    "正在確認架構圖最後的細節！",
    "Smart Archie正在檢查錯誤",
    "您的圖正在生成請稍候",
  ];
  //一開始讓進度條增長
  useEffect(() => {
    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev < 280 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(progressRef.current);
  }, []);
  //當apiResponseReceived 清除事件
  useEffect(() => {
    if (apiResponseReceived) {
      clearInterval(progressRef.current);
    }
  }, [apiResponseReceived]);

  const handleSaveFile = () => {
    setShowSaveDialog(true);
  };

  const saveFile = async () => {
    if (apiResponseReceived && imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const temp_url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = temp_url;
        const fileNameWithExtension = fileName.endsWith(".png")
          ? fileName
          : `${fileName}.png`;
        link.download = fileNameWithExtension;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(temp_url);
        setShowSaveDialog(false);
      } catch (error) {
        console.error("下載檔案時發生錯誤：", error);
        setShowSaveDialog(false);
      }
    }
  };

  const handleSaveCode = async () => {
    if (apiResponseReceived && savecode) {
      try {
        const response = await fetch(savecode);
        const blob = await response.blob();
        const temp_url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = temp_url;
        const fileNameWithExtension = "diagram.py";
        link.download = fileNameWithExtension;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(temp_url);
        setShowSaveDialog(false);
      } catch (error) {
        console.error("下載檔案時發生錯誤：", error);
        setShowSaveDialog(false);
      }
    }
  };

  return (
    <div>
      {apiResponseReceived ? (
        error_message ? (
          <>
            <p className="error-message">{error_message}</p>
          </>
        ) : (
          <>
            {imageUrl ? (
              <>
                <div className="button-container">
                  <button onClick={handleSaveFile}>儲存圖片</button>
                  <button onClick={handleSaveCode}>儲存程式碼</button>
                  <button onClick={handleZoomOut}>🔍 -</button>
                  <button onClick={handleZoomIn}>🔍 +</button>
                  <div className="platform-button-container">
                    <button
                      onClick={() => {} /*() => handleSend(true)*/}
                      disabled={platform === "aws"}
                    >
                      AWS
                    </button>
                    <button
                      onClick={() => {} /*() => handleSend(true)*/}
                      disabled={platform === "gcp"}
                    >
                      GCP
                    </button>
                  </div>
                </div>
                <div className=".survey-result-content">
                  <div className="survey-image-container">
                    <img
                      src={imageUrl}
                      alt="Survey Result"
                      className="survey-image"
                      style={{ transform: `scale(${scale})` }} // 使用 scale 属性控制缩放
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="error-message">沒有架構圖回傳，圖片解析失敗</p>
            )}
          </>
        )
      ) : (
        <>
          <h1>Thank you！ {username}!</h1>
          <h2>
            我們正在設計您的架構圖，請稍等，我們將在這裡為您提供即時的架構圖生成進度。
          </h2>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <div
            style={{
              position: "absolute",
              top: "55%", // 控制進度條的位置向下移
              left: "50%",
              transform: "translate(-50%, -50%)", // 確保進度條居中
              width: "50%", // 控制進度條的寬度
            }}
          >
            <ProgressBar
              completed={progress}
              bgColor="#10b981"
              height="30px"
              width="100%"
              labelSize="16px"
              maxCompleted={280}
              customLabel={progress_text[Math.floor(progress / 40)]}
              customLabelStyles={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                fontWeight: "bold",
              }}
            />
          </div>
        </>
      )}
      {showSaveDialog && (
        <div className="save-dialog">
          <div className="save-dialog-content">
            <h3>儲存圖片</h3>
            <input
              type="text"
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter image name"
            />
            <div className="save-dialog-buttons">
              <button onClick={saveFile}>存擋</button>
              <button onClick={() => setShowSaveDialog(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dac;
