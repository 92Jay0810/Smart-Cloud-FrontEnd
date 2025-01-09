// TemplateMode.jsz
import React, { useState, useEffect, useCallback, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import "./TemplateMode.css";
import { jwtDecode } from "jwt-decode";
import userImg from "./assets/user.jpg";
import systemImg from "./assets/system.jpeg";
import close from "./assets/grey close.png";
import { v4 as uuidv4 } from "uuid";
import logo from "./assets/cathay.png";

const TemplateMode = ({
  idToken,
  user_id,
  username,
  onRefreshTokenCheck,
  handleBackPrortalPage,
  handleLogout,
}) => {
  const handleRefreshTokenCheck = () => {
    console.log("Refreshcall in SurveyDisplay");
    onRefreshTokenCheck();
  };
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
  const resetSurvey = useCallback(() => {
    setSubmitted(false);
    setImageUrl("");
    setsavecode("");
    setPlatform("");
    setTool("");
    setMessages([]);
    const newSessionId = uuidv4();
    console.log("New Session ID generated:", newSessionId);
    setSession_id(newSessionId);
    // 清除相關的 cookie
    setCookie("session_id", newSessionId);
    setCookie("submitted", "", -1);
    setCookie("imageUrl", "", -1);
    setCookie("savecode", "", -1);
    setCookie("platform", "", -1);
    setCookie("tool", "", -1);
    setCookie("messages", "", -1);
    // 重置其他相關狀態
    setShowDialog(false);
    setInputText("");
    setFileName("");
  }, []);
  // need store in cookie and read
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
  const [submitted, setSubmitted] = useState(() => {
    const saved = getCookie("submitted");
    return saved ? JSON.parse(saved) : false;
  });
  const [imageUrl, setImageUrl] = useState(() => {
    return getCookie("imageUrl") || "";
  });
  const [savecode, setsavecode] = useState(() => {
    return getCookie("savecode") || false;
  });
  const [platform, setPlatform] = useState(() => {
    return getCookie("platform") || "";
  });
  const [tool, setTool] = useState(() => {
    return getCookie("tool") || "";
  });
  const [messages, setMessages] = useState(() => {
    try {
      const saved = getCookie("messages");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error parsing messages from cookie:", error);
      return [];
    }
  });

  // 更新 cookie 的函數
  const updateCookies = () => {
    setCookie("submitted", submitted);
    setCookie("imageUrl", imageUrl);
    setCookie("savecode", savecode);
    setCookie("platform", platform);
    setCookie("tool", tool);
    setCookie("messages", JSON.stringify(messages));
    setCookie("session_id", session_id);
  };

  // 在狀態更新時更新 cookie
  useEffect(() => {
    updateCookies();
  }, [submitted, imageUrl, savecode, platform, tool, messages, session_id]);
  // 重置函數

  const [selectedStation, setSelectedStation] = useState(null);
  const [view, setView] = useState("grid"); // 'grid' or 'detail'

  const workstations = [
    {
      id: 1,
      caption: "適用情境：對外活動網站",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/website/website.png",
      backendAPI: "website",
    },
    { id: 2, caption: "適用情境：公開資料查詢服務", 
      image: "https://d2s0u5536e7dee.cloudfront.net/template/open_data_service/%E4%BA%A4%E6%98%93%E5%85%AC%E9%96%8B%E8%B3%87%E6%96%99%E6%9F%A5%E8%A9%A2%E6%9C%8D%E5%8B%99.png" },
    { id: 3, caption: "適用情境：內部員工教育平台", 
      image: "https://d2s0u5536e7dee.cloudfront.net/template/education_platform/education_platform.png" },
    { id: 4, caption: "適用情境：資料自動化蒐集平台",
       image: "https://d2s0u5536e7dee.cloudfront.net/template/collection_system/collection_system.png" },
    { id: 5, caption: "適用情境：轉址等小型服務", 
      image: "https://d2s0u5536e7dee.cloudfront.net/template/short_link/short_link.png" },
    { id: 6, caption: "適用情境：串接不同資訊chatbot",
       image: "https://d2s0u5536e7dee.cloudfront.net/template/chatbot/chatbot.png"},
  ];

  const handleStationClick = (station) => {
    setSelectedStation(station);
    setView("detail");
  };

  const handleBackToGrid = () => {
    setView("grid");
    setSelectedStation(null);
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
        <button onClick={handleBackToGrid} className="backk-button">
          返回
        </button>
        <button
          onClick={() => handleNextStep(selectedStation?.image)}
          className="Tnext-button"
        >
          選擇
        </button>
      </div>
    </div>
  );

  const handleNextStep = (imageUrl) => {
    setView("grid");
    setSelectedStation(null);
    setTool("diagrams");
    setImageUrl(imageUrl);
    setPlatform("aws");
    setSubmitted(true);
  };
  const handleBack = useCallback(() => {
    resetSurvey(); // 先執行當前組件的重置
    handleBackPrortalPage(); // 返回服務選擇頁面
  }, [resetSurvey, handleBackPrortalPage]);

  //csd-ca-lab
  const baseurl = "https://d2s0u5536e7dee.cloudfront.net";
  const url = baseurl + "/api/diagram-as-code";
  //const url = "http://localhost:3001";

  // Zoom in/out
  const [scale, setScale] = useState(1); // 初始縮放比例

  //ConversationDialog
  const [showDialog, setShowDialog] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  //saveDialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState("");

  //以下未改
  const handleSaveFile = () => {
    setShowSaveDialog(true);
  };

  const saveFile = async () => {
    if (imageUrl) {
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
        console.error("Error downloading the file:", error);
        setShowSaveDialog(false);
      }
    }
  };

  const handleSaveCode = async () => {
    if (savecode) {
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
        console.error("Error downloading the file:", error);
        setShowSaveDialog(false);
      }
    }
  };
  // 當message改變滑動到指定參考位置
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000; // 當前時間 (秒)
    // 檢查 token 是否過期
    if (decodedToken.exp < currentTime) {
      //超過4小時，就trigger AWSLogin去登出並跳警告
      handleRefreshTokenCheck();
      return;
    }
    if (inputText.trim() !== "") {
      const newMessages = [...messages, { sender: username, text: inputText }];
      setMessages(newMessages);
      setInputText("");
      setLoading(true);
      const now = new Date();
      const timestamp =
        now.getFullYear().toString() + // 年份
        (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
        now.getDate().toString().padStart(2, "0") + // 日期
        now.getHours().toString().padStart(2, "0") + // 小时
        now.getMinutes().toString().padStart(2, "0") + // 分钟
        now.getSeconds().toString().padStart(2, "0") + // 秒
        now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
      const consersationRequest = {
        prompt: inputText,
        session_id: session_id,
        timestamp: timestamp,
        user_id: user_id,
        tool: tool,
      };
      console.log("傳送格式:\n", consersationRequest);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorizationToken: `Bearer ${idToken}`,
          },
          body: JSON.stringify(consersationRequest),
        });
        const responseData = await response.json();
        console.log("responseData :", responseData);
        //確保body裡面是json讀取，後端可能誤傳string
        if (response.status === 504) {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `The request to the API Gateway timed out. Please try again later.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          return; // 退出函式，避免進一步處理
        }
        let data =
          typeof responseData.body === "string"
            ? JSON.parse(responseData.body)
            : responseData.body;
        console.log("responseData 的body：", data);
        if (typeof data === "undefined") {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `The format of response is incorrect\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
        } else if (data.errorMessage) {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `Error occur: ${data.errorMessage}\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
        } else if (data?.AIMessage) {
          if (data?.s3_object_name && data?.s3_python_code) {
            setImageUrl(baseurl + "/diagram/" + data.s3_object_name); //新的路徑為diagram
            setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          }

          setMessages([
            ...newMessages,
            { sender: "System", text: data.AIMessage },
          ]);
        } //如果只有圖片
        else if (data?.s3_object_name && data?.s3_python_code) {
          setImageUrl(baseurl + "/diagram/" + data.s3_object_name);
          setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `AI no response but return image\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
        } else {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `Bad response format with internal server\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
        }
      } catch (error) {
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `Error: Failed to fetch response.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
          },
        ]);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleModifyPromptClick = () => {
    setShowDialog(true);
  };

  // 動態調整 textarea 高度的函數
  const handleInput = (e) => {
    const textarea = e.target;
  };

  // Enter 送出訊息，Shift + Enter 換行
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.isComposing) {
        // 如果正在選字，不進行任何操作
        return;
      }
      e.preventDefault(); // 禁止預設的換行
      handleSend(); // 執行送出訊息的函數
      setInputText("");
    }
  };
  const CustomPromptTemplate = `transform to {platform}, make sure to follow the transformation and service mapping rules, and ensure all security and operational components present.`;

  // 定义一个函数来替换 {platform} 占位符
  const generatePrompt = (platform) => {
    return CustomPromptTemplate.replace("{platform}", platform);
  };
  //未改
  const handleTransform = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000; // 當前時間 (秒)
    // 檢查 token 是否過期
    if (decodedToken.exp < currentTime) {
      //超過4小時，就trigger AWSLogin去登出並跳警告
      handleRefreshTokenCheck();
      return;
    }
    const newPlatform = platform === "aws" ? "gcp" : "aws";
    setPlatform(newPlatform);

    const promptText = generatePrompt(newPlatform);
    if (promptText.trim() !== "") {
      console.log(promptText);
      const newMessages = [
        ...messages,
        { sender: username, text: `transforming to ${newPlatform}...` },
      ];
      setMessages(newMessages);
      setInputText("");
      setLoading(true);
      const now = new Date();
      const timestamp =
        now.getFullYear().toString() + // 年份
        (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
        now.getDate().toString().padStart(2, "0") + // 日期
        now.getHours().toString().padStart(2, "0") + // 小时
        now.getMinutes().toString().padStart(2, "0") + // 分钟
        now.getSeconds().toString().padStart(2, "0") + // 秒
        now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
      const transformationRequest = {
        prompt: promptText,
        session_id: session_id,
        timestamp: timestamp,
        user_id: user_id,
        tool: tool,
      };
      console.log("傳送格式:\n", transformationRequest);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorizationToken: `Bearer ${idToken}`,
          },
          body: JSON.stringify(transformationRequest),
        });
        const responseData = await response.json();
        console.log("responseData :", responseData);
        //確保body裡面是json讀取，後端可能誤傳string
        if (response.status === 504) {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `The request to the API Gateway timed out. Please try again later.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          return; // 退出函式，避免進一步處理
        }
        let data =
          typeof responseData.body === "string"
            ? JSON.parse(responseData.body)
            : responseData.body;
        console.log("responseData 的body：", data);
        if (typeof data === "undefined") {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `The format of response is incorrect\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
        } else if (data.errorMessage) {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `Error occur: ${data.errorMessage}\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
        } else if (data?.AIMessage) {
          if (data?.s3_object_name && data?.s3_python_code) {
            setImageUrl(baseurl + "/diagram/" + data.s3_object_name); //新的路徑為diagram
            setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          }
          setMessages([
            ...newMessages,
            { sender: "System", text: data.AIMessage },
          ]);
        } //如果只有圖片
        else if (data?.s3_object_name && data?.s3_python_code) {
          setImageUrl(baseurl + "/diagram/" + data.s3_object_name);
          setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `AI no response but return image\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
        } else {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `Bad response format with internal server\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
        }
      } catch (error) {
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `Error: Failed to fetch response.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
          },
        ]);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 1.8)); // 最大缩放2倍
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // 最小缩放0.5倍
  };
  if (submitted) {
    return (
      <div className="App">
        <div className="header-container">
          <button onClick={handleBack} className="back-button">
            返回
          </button>
          <button onClick={handleLogout} className="next-button">
            登出
          </button>
        </div>
        <CSSTransition
          in={submitted}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <div className="survey-result-container">
            <h1>Nice, {username}! Here is your architecture:</h1>
            <h2>
              This architecture diagram is generated based on the technical
              requirements you provided.
            </h2>
            {imageUrl ? (
              <>
                <div className="button-container">
                  <button onClick={handleSaveFile}>Save Image</button>
                  <button onClick={handleSaveCode}>Save Code</button>
                  <button onClick={handleModifyPromptClick}>
                    Modify Prompt
                  </button>
                  
                  <button onClick={handleZoomOut}>🔍 -</button>
                  <button onClick={handleZoomIn}>🔍 +</button>
                  <div className="platform-button-container">
                    <button
                      onClick={() => handleTransform()}
                      disabled={platform === "aws"}
                    >
                      AWS
                    </button>
                    <button
                      onClick={() => handleTransform()}
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
          </div>
        </CSSTransition>
        {showSaveDialog && (
          <div className="save-dialog">
            <div className="save-dialog-content">
              <h3>Save Image</h3>
              <input
                type="text"
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter image name"
              />
              <div className="save-dialog-buttons">
                <button onClick={saveFile}>Save</button>
                <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {showDialog && (
          <div className="dialog-container">
            <div className="dialog-topic">
              <div className="topic">
                <span>Smart Archie</span>
              </div>
              <button
                className="dialog-close"
                onClick={() => setShowDialog(false)}
              >
                <img
                  src={close}
                  style={{ width: "24px", height: "24px" }}
                  alt="Close"
                />
              </button>
            </div>

            <div className="dialog-content">
              <div className="dialog-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`dialog-message ${
                      msg.sender === "System" ? "system" : "user"
                    }`}
                  >
                    <div className="avatar-container">
                      <img
                        src={msg.sender === "System" ? systemImg : userImg}
                        alt={`${
                          msg.sender === "System" ? "System" : "User"
                        }Img`}
                        className="avatar"
                      />
                    </div>
                    <div className="message-content">
                      <span className="message-content-text">{msg.text}</span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="dialog-message system">
                    <div className="avatar-container">
                      <img
                        src={systemImg}
                        alt={`SystemImg`}
                        className="avatar"
                      />
                    </div>
                    <div className="message-content">
                      <p></p>
                      <div className="thinking-container">
                        <div className="thinking-dots">
                          <div className="thinking-dot"></div>
                          <div className="thinking-dot"></div>
                          <div className="thinking-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    handleInput(e); // 動態調整高度
                  }}
                  onKeyDown={handleKeyPress} //監聽按鍵事件
                  placeholder="Enter your new prompt here..."
                  rows="1"
                />
                <button onClick={handleSend}>
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path
                      fill="currentColor"
                      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                    ></path>
                  </svg>
                </button>
              </div>
              <p className="warning">
                AI may make errors. Please try multiple times and review the
                results carefully.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="image-grid-container">
      <div className="header-container">
        {view== "grid" && (
          <button onClick={handleBack} className="bback-button">
            返回
          </button>
        )}
        <button onClick={handleLogout} className="next-button">
          登出
        </button>
      </div>
      <h1 className="image-grid-title">
        Hi {username}! Welcome to Smart Archie!
      </h1>
      {view === "grid" ? renderGrid() : renderDetail()}
    </div>
  );
};

export default TemplateMode;
