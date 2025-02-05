// TemplateMode.jsz
import React, { useState, useEffect, useCallback, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import "./TemplateMode.css";
import { jwtDecode } from "jwt-decode";
import userImg from "./assets/user.jpg";
import systemImg from "./assets/system.jpeg";
import loadingImg from "./assets/loading1.gif";
import close from "./assets/grey close.png";
import { v4 as uuidv4 } from "uuid";

const TemplateMode = ({
  idToken,
  user_id,
  username,
  onRefreshTokenCheck,
  handleBackPrortalPage,
  handleLogout,
}) => {
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
    setsavecode("");
    setPlatform("");
    setTool("");
    setMessages([]);
    setDiagramXml("");
    const newSessionId = uuidv4();
    console.log("New Session ID generated:", newSessionId);
    setSession_id(newSessionId);
    // 清除相關的 cookie
    setCookie("session_id", newSessionId);
    setCookie("submitted", "", -1);
    setCookie("apiResponseReceived", "", -1);
    setCookie("savecode", "", -1);
    setCookie("platform", "", -1);
    setCookie("tool", "", -1);
    setCookie("messages", "", -1);
    setCookie("diagramXml", "", -1);
    // 重置其他相關狀態
    setShowDialog(false);
    setInputText("");
    setXmlUrl("");
  }, []);
  const handleRefreshTokenCheck = () => {
    // 先執行當前組件的重置
    resetSurvey();
    console.log("Refreshcall in SurveyDisplay");
    onRefreshTokenCheck();
  };
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
  const [apiResponseReceived, setApiResponseReceived] = useState(() => {
    const saved = getCookie("apiResponseReceived");
    return saved ? JSON.parse(saved) : false;
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
  const [diagramXml, setDiagramXml] = useState(() => {
    const diagramxml = getCookie("diagramXml");
    return diagramxml ? diagramxml : false;
  });

  // xmlUrl
  const [xmlUrl, setXmlUrl] = useState("");

  // 更新 cookie 的函數
  const updateCookies = () => {
    setCookie("submitted", submitted);
    setCookie("apiResponseReceived", apiResponseReceived);
    setCookie("savecode", savecode);
    setCookie("platform", platform);
    setCookie("tool", tool);
    setCookie("messages", JSON.stringify(messages));
    setCookie("session_id", session_id);
    setCookie("diagramXml", diagramXml);
  };

  // 在狀態更新時更新 cookie
  useEffect(() => {
    updateCookies();
  }, [submitted, savecode, platform, tool, messages, session_id, diagramXml]);
  // 重置函數

  const [selectedStation, setSelectedStation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const workstations = [
    {
      id: 1,
      caption: "現代化 WEB 站台架構",
      subtitle: "平台：GCP",
      subtitle2: "作者：Frankie",
      content:
        "這個架構圖適用於動態模板渲染、高流量網站，支持用戶通過 DNS Provider 訪問，請求先進入 External HTTPS Load Balancer，負責分發 API 請求至 Cloud Run 服務，並提供對多模板靜態資源的支持（存於 Cloud Storage）， 整合 Observability進行全方位運維監控，Artifact Registry 管理容器模板，Key Management Service 確保加密安全性，支持高效開發和運營。",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/WEBAPI/template.drawio.png",
      backendAPI: "WEBAPI",
    },
    {
      id: 2,
      caption: "適用情境：公開資料查詢服務",
      content:
        "Lorem ipsum dolor sit amet, an utinam vidisse insolens sea, ei putant audiam necessitatibus qui. Vel ocurreret conceptam ut, probo altera perpetua cum cu, te dictas laboramus expetendis mel. Qui viris eloquentiam reprehendunt te. Tempor interesset cum eu. Cum nemore splendide moderatius ei, quot lorem has ad, in mel dico expetenda liberavisse.",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/open_data_service/open_data_service.png",
      backendAPI: "open_data_service",
    },
    {
      id: 3,
      caption: "適用情境：內部員工教育平台",
      content:
        "Lorem ipsum dolor sit amet, an utinam vidisse insolens sea, ei putant audiam necessitatibus qui. Vel ocurreret conceptam ut, probo altera perpetua cum cu, te dictas laboramus expetendis mel. Qui viris eloquentiam reprehendunt te. Tempor interesset cum eu. Cum nemore splendide moderatius ei, quot lorem has ad, in mel dico expetenda liberavisse.",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/education_platform/education_platform.png",
      backendAPI: "education_platform",
    },
    {
      id: 4,
      caption: "適用情境：資料自動化蒐集平台",
      content:
        "Lorem ipsum dolor sit amet, an utinam vidisse insolens sea, ei putant audiam necessitatibus qui. Vel ocurreret conceptam ut, probo altera perpetua cum cu, te dictas laboramus expetendis mel. Qui viris eloquentiam reprehendunt te. Tempor interesset cum eu. Cum nemore splendide moderatius ei, quot lorem has ad, in mel dico expetenda liberavisse.",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/collection_system/collection_system.png",
      backendAPI: "collection_system",
    },
    {
      id: 5,
      caption: "適用情境：轉址等小型服務",
      content:
        "Lorem ipsum dolor sit amet, an utinam vidisse insolens sea, ei putant audiam necessitatibus qui. Vel ocurreret conceptam ut, probo altera perpetua cum cu, te dictas laboramus expetendis mel. Qui viris eloquentiam reprehendunt te. Tempor interesset cum eu. Cum nemore splendide moderatius ei, quot lorem has ad, in mel dico expetenda liberavisse.",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/short_link/short_link.png",
      backendAPI: "short_link",
    },
    {
      id: 6,
      caption: "串接不同資訊Chatbot",
      subtitle: "平台：AWS",
      subtitle2: "作者：Smart Archie",
      content:
        "這個架構圖適用於需要整合各類雲端服務的聊天機器人系統，尤其是針對使用 AWS 進行部署和運行的場景。架構圖包含了多個重要的 AWS 元件，如 VPC、EKS (Elastic Kubernetes Service)、RDS MySQL、S3、Route 53 等，適合建立一個高可用性、可擴展且安全的聊天機器人後端基礎設施。此架構有助於將不同的資訊源（例如資料庫、API 服務和聊天服務）整合到一個統一的系統中，提供快速、穩定的互動體驗。",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/chatbot/chatbot.png",
      backendAPI: "chatbot",
    },
  ];

  const handleStationClick = (station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStation(null);
    setIsModalOpen(false);
  };

  const handleNextStep = async (imageUrl, code, template) => {
    setSelectedStation(null);
    setTool("drawio");
    setsavecode(code);
    setPlatform("aws");
    setSubmitted(true);
    //以下丟API
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() + // 年份
      (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
      now.getDate().toString().padStart(2, "0") + // 日期
      now.getHours().toString().padStart(2, "0") + // 小时
      now.getMinutes().toString().padStart(2, "0") + // 分钟
      now.getSeconds().toString().padStart(2, "0") + // 秒
      now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
    const SubmitAnswers = {
      template: template,
      timestamp: timestamp,
      session_id: session_id,
      user_id: user_id,
      tool: "drawio",
    };
    console.log("傳送格式:\n", SubmitAnswers);
    try {
      await setupWebSocket();
      web_socket.send(JSON.stringify({ action: "message", ...SubmitAnswers }));
      return;
    } catch (error) {
      console.error("Error submitting survey:", error);
    }
  };
  //當xmlUrl獲取成功時，會往s3獲取xml
  useEffect(() => {
    const fetchXml = async () => {
      try {
        const response = await fetch(xmlUrl);
        if (response.ok) {
          const xmlContent = await response.text();
          setDiagramXml(xmlContent);
          // 第一次的xml 收到要歡迎語
          if (!apiResponseReceived) {
            setShowDialog(true);
            setMessages([
              {
                sender: "System",
                text:
                  "Hi " +
                  username +
                  ", I'm Archie. Feel free to modify your prompts,and I'll adjust the architecture diagram for you in real time.",
              },
            ]);
            setApiResponseReceived(true);
          } else {
            //此為對話
            const now = new Date();
            const timestamp =
              now.getFullYear().toString() + // 年份
              (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
              now.getDate().toString().padStart(2, "0") + // 日期
              now.getHours().toString().padStart(2, "0") + // 小时
              now.getMinutes().toString().padStart(2, "0") + // 分钟
              now.getSeconds().toString().padStart(2, "0") + // 秒
              now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
            setMessages([
              ...messages,
              {
                sender: "System",
                text: `AI no response but return image\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
              },
            ]);
            setLoading(false); //若為對話，AI要停止思考
          }
        } else {
          console.error("HTTP error:", response.status);
        }
      } catch (error) {
        console.error("Error fetching XML:", error);
      }
    };

    if (xmlUrl) {
      console.log(xmlUrl);
      fetchXml();
    }
  }, [xmlUrl]);

  //處理draw io
  useEffect(() => {
    const loadDiagram = () => {
      if (!iframeRef.current || !diagramXml) return;
      const message = {
        action: "load",
        xml: diagramXml,
      };
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify(message),
        "https://embed.diagrams.net"
      );
    };
    const handleMessage = (event) => {
      try {
        //驗證來源
        if (
          event.data.length > 0 &&
          event.origin === "https://embed.diagrams.net"
        ) {
          const msg = JSON.parse(event.data);
          console.log("Received message:", msg);
          switch (msg.event) {
            case "init":
              if (diagramXml) {
                loadDiagram();
              } else {
                console.warn("diagramXml 尚未設置，無法載入圖表");
              }
              break;
            case "export":
            case "save":
              console.log("已更新XML");
              if (msg.xml && msg.xml !== diagramXml) {
                setDiagramXml(msg.xml);
              }
              break;
            default:
              console.warn("未处理的事件:", msg.event);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [diagramXml]);

  // 若使用者進行對話，則進行PostMessage得到xml
  const requestExport = () => {
    if (iframeRef.current) {
      const message = {
        action: "export",
        format: "xmlsvg",
        xml: true,
        spin: "Saving...",
      };
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify(message),
        "https://embed.diagrams.net"
      );
      console.log("requestExport sent");
    }
  };

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

  //csd-ca-lab
  const baseurl = "https://d2s0u5536e7dee.cloudfront.net";
  const url = baseurl + "/api/diagram-as-code";
  //const url = "http://localhost:3001";
  const WEBSOCKET_API =
    "wss://ops0k8xtuk.execute-api.ap-northeast-1.amazonaws.com/production/";
  let web_socket;

  //websocket
  function connectWebSocket() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WEBSOCKET_API);

      ws.onopen = () => {
        web_socket = ws;
        console.log("WebSocket connection established!");
        resolve();
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };
    });
  }

  async function setupWebSocket() {
    if (web_socket) {
      return;
    }

    await connectWebSocket()
      .then(() => {
        web_socket.onmessage = (evt) => {
          // trigger when websocket received message
          if (evt.data && typeof evt.data != Object) {
            const data = JSON.parse(evt.data);
            console.log("Received:", data);
            if (data.body) {
              setXmlUrl(baseurl + "/diagram/" + data.body.s3_object_name);
            }
          }
        };

        web_socket.onclose = () => {
          // trigger when connection get closed
          web_socket = null;
          // 可以在這裡處理重連邏輯
          console.log("Connection closed");
        };

        web_socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      })
      .catch((error) => {
        console.error("Failed to connect:", error);
      });
  }

  //ConversationDialog
  const [showDialog, setShowDialog] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);

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
      //更新xml
      requestExport();
      const conversationRequest = {
        prompt: inputText,
        session_id: session_id,
        timestamp: timestamp,
        user_id: user_id,
        tool: tool,
        xml: diagramXml,
      };
      console.log("傳送格式:\n", conversationRequest);
      try {
        await setupWebSocket();
        web_socket.send(
          JSON.stringify({ action: "message", ...conversationRequest })
        );
        return;
      } catch (error) {
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `Error: Failed to fetch response.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
          },
        ]);
        console.log(error);
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
  //按下轉換按鈕
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
      //更新xml
      requestExport();
      const transformationRequest = {
        prompt: promptText,
        session_id: session_id,
        timestamp: timestamp,
        user_id: user_id,
        tool: tool,
        xml: diagramXml,
      };
      console.log("傳送格式:\n", transformationRequest);
      try {
        await setupWebSocket();
        web_socket.send(
          JSON.stringify({ action: "message", ...transformationRequest })
        );
        return;
      } catch (error) {
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `Error: Failed to fetch response.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
          },
        ]);
        console.log(error);
      }
    }
  };

  if (submitted) {
    return (
      <div className="App">
        <div className="header-container">
          <button onClick={handleBack} className="back-button">
            返回
          </button>
          <button onClick={handleLogoutButton} className="next-button">
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
            {apiResponseReceived ? (
              <>
                <h1>Nice, {username}! Here is your architecture:</h1>
                <h2>
                  This architecture diagram is generated based on the technical
                  requirements you provided.
                </h2>
                {diagramXml ? (
                  <>
                    <div className="button-container">
                      <button onClick={handleModifyPromptClick}>
                        Modify Prompt
                      </button>
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
                    <iframe
                      ref={iframeRef}
                      id="drawio-frame"
                      src="https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&saveAndExit=1"
                      allowFullScreen
                      sandbox="allow-scripts allow-downloads allow-same-origin"
                      style={{ width: "100%" }}
                    ></iframe>
                  </>
                ) : (
                  <p className="error-message">沒有架構圖回傳，圖片解析失敗</p>
                )}
              </>
            ) : (
              <>
                <h1>Thank you, {username}!</h1>
                <h2>
                  We are designing your architecture now, please wait a moment.
                </h2>

                <div className="loading-container">
                  <img
                    src={loadingImg}
                    alt="Loading..."
                    className="loading-gif"
                  />
                </div>
              </>
            )}
          </div>
        </CSSTransition>
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
        <button onClick={handleBack} className="backk-button">
          返回
        </button>
        <button onClick={handleLogoutButton} className="next-button">
          登出
        </button>
      </div>
      <h1 className="image-grid-title">嗨 {username}! 請選擇您想使用的模板</h1>
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
                      selectedStation.image,
                      selectedStation.code,
                      selectedStation.backendAPI
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
};

export default TemplateMode;
