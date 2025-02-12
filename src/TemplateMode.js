// TemplateMode.jsz
import ProgressBar from "@ramonak/react-progress-bar";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import "./TemplateMode.css";
import { jwtDecode } from "jwt-decode";
import userImg from "./assets/user.jpg";
import systemImg from "./assets/system.jpeg";
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
    localStorage.removeItem("diagramXml");
    // 重置其他相關狀態
    setShowDialog(false);
    setInputText("");
    setXmlUrl("");
    setProgress(0);
    clearInterval(progressRef);
    iframeInitialized.current = false;
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
    const savedDiagram = localStorage.getItem("diagramXml");
    return savedDiagram || false;
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
    // 特别处理 diagramXml，因为它可能很大
    if (diagramXml) {
      localStorage.setItem("diagramXml", diagramXml);
    }
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
        "簡介：這個架構圖適用於高流量的動態網站，使用External HTTPS Load Balancing結合Cloud Armor，比傳統的單一負載均衡器提供更完整的流量控制和安全防護。並透過 Cloud Run 部署 API 服務，具備自動擴縮容能力且更符合成本效益。且透過Cloud Storage管理靜態資源，Cloud SQL處理資料存儲，比起全部存放在應用服務器更有效率。Artifact Registry 管理容器影像。",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/WEBAPI/template.drawio.png",
      backendAPI: "WEBAPI",
    },
    {
      id: 2,
      caption: "無伺服器WEB應用架構",
      subtitle: "平台：GCP",
      subtitle2: "作者：Rich",
      content:
        "簡介：這個架構圖呈現無伺服器 Web 應用架構。流量透過 External Application Load Balancer 進入，並由 Cloud Armor 提供 WAF 保護。前端和後端 API 皆使用 Cloud Run 無伺服器運行，內部透過 IAM Permissions 進行權限管理。使用 Firestore 取代關聯式資料庫 (如 Cloud SQL)，提供更適合無伺服器應用的 NoSQL 結構，減少維護成本。敏感資訊則由 Secret Manager 管理。",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/serverless_web_application/serverless_web_application.png",
      backendAPI: "serverless_web_application",
    },
    {
      id: 3,
      caption: "事件驅動架構ETL",
      subtitle: "平台：GCP",
      subtitle2: "作者：Rich",
      content:
        "簡介：這個架構圖以事件驅動為核心，當用戶上傳檔案到Cloud Storage後，會觸發事件通知到Pub/Sub系統，再根據需求分流到批次處理(Batch Processing)或串流處理(Stream Data Processing)。最終數據會存入Data Warehouse。整體架構具備完整的營運管理功能，並對敏感資料進行特別管理。",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/event_driven_ETL/event_driven_ETL.png",
      backendAPI: "event_driven_ETL",
    },
    {
      id: 4,
      caption: "資料庫架構CDC",
      subtitle: "平台：GCP",
      subtitle2: "作者：Rich",
      content:
        "簡介：這個架構圖使用 Database Migration Service 進行CDC串流處理，能即時捕獲源資料庫的變更，相比傳統的批次同步，可更快保持資料一致性。透過 Cloud VPN 和 VPN Gateway 建立加密通道，確保地端到雲端的資料傳輸安全。Cloud SQL 作為資料庫，具自動擴展和備份功能，比自建資料庫更容易管理和維護。且此架構圖明確區分本地端和雲端，通過嚴格的網路隔離和存取控制，確保資料安全性和合規性。",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/database_CDC/database_CDC.png",
      backendAPI: "database_CDC",
    },
    {
      id: 5,
      caption: "內部員工教育平台",
      subtitle: "平台：AWS",
      subtitle2: "作者：Smart Archie",
      content:
        "簡介：這個架構圖適用於內部員工教育平台等系統。後端採用EKS管理容器化服務，並使用EFS和ElastiCache存儲課程資源和快取，使用CloudFront和ELB處理內容分發，相比傳統單一伺服器部署，提供更快速和穩定的課程存取體驗。並搭配使用CloudWatch 監控系統狀態，X-Ray 輔助問題排查。",
      image:
        "https://d2s0u5536e7dee.cloudfront.net/template/education_platform/education_platform.png",
      backendAPI: "education_platform",
    },
    {
      id: 6,
      caption: "串接不同資訊Chatbot",
      subtitle: "平台：AWS",
      subtitle2: "作者：Smart Archie",
      content:
        "簡介：這個架構圖適用於需整合各類服務的聊天機器人系統，透過Route 53處理用戶請求，經由公開和私有子網路的分層設計提升安全性。系統使用NAT Gateway管理網路流量，並運用ElastiCache提供快取服務，相較於直接存取資料庫顯著提升響應速度和減輕資料庫負載。後端採用RDS MySQL儲存資料，提供自動備份和擴展功能。最後整合CloudWatch 監控系統狀態和安全管理(IAM、WAF)機制，確保安全性。",
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
    const SubmitAnswers = {
      template: template,
      session_id: session_id,
      user_id: user_id,
      tool: "drawio",
    };
    console.log("傳送格式:\n", SubmitAnswers);
    try {
      let response = "";
      response = await fetch(url, {
        method: "POST",
        headers: {
          authorizationToken: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(SubmitAnswers),
      });
      const responseData = await response.json();
      console.log("responseData :", responseData);
      const now = new Date();
      const timestamp =
        now.getFullYear().toString() + // 年份
        (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
        now.getDate().toString().padStart(2, "0") + // 日期
        now.getHours().toString().padStart(2, "0") + // 小时
        now.getMinutes().toString().padStart(2, "0") + // 分钟
        now.getSeconds().toString().padStart(2, "0") + // 秒
        now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
      if (response.status === 504) {
        window.alert(
          `The request to the API Gateway timed out. Please try again later.\nSession: ${session_id}\nResponse Time: ${timestamp}`
        );
        return; // 退出函式，避免進一步處理
      }
      if (responseData.body) {
        setXmlUrl(baseurl + "/diagram/" + responseData.body.s3_object_name);
        return; // 退出函式，避免進一步處理
      }
    } catch (error) {
      const now = new Date();
      const timestamp =
        now.getFullYear().toString() + // 年份
        (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
        now.getDate().toString().padStart(2, "0") + // 日期
        now.getHours().toString().padStart(2, "0") + // 小时
        now.getMinutes().toString().padStart(2, "0") + // 分钟
        now.getSeconds().toString().padStart(2, "0") + // 秒
        now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
      console.error("Error submitting survey:", error);
      window.alert(
        `The request has error：${error}.\nSession: ${session_id}\nResponse Time: ${timestamp}`
      );
    }
  };
  //生成圖片進度條
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const progress_text = [
    "",
    "請稍候",
    "正在確認您選擇的服務",
    "圖片生成架構中",
    "架構圖排版美化中",
    "正在確認最後的細節！",
    "您的圖即將生成請稍候",
  ];
  useEffect(() => {
    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev < 7 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(progressRef.current);
  }, []);
  //當xmlUrl獲取成功時，會往s3獲取xml
  useEffect(() => {
    const fetchXml = async () => {
      try {
        console.log("fetch XmlUrl");
        const response = await fetch(xmlUrl);
        if (response.ok) {
          const xmlContent = await response.text();
          setDiagramXml(xmlContent);
          console.log("fetch XmlUrl success");
          // 如果 iframe 已初始化，直接發送 load (對話)
          // 如果還沒初始化，就等待init事件後發送
          if (iframeInitialized.current && iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({
                action: "load",
                xml: xmlContent,
              }),
              "https://embed.diagrams.net"
            );
          }
          // 第一次的xml 收到要歡迎語
          if (!apiResponseReceived) {
            clearInterval(progressRef);
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
                text: `AI無反應但回傳圖片\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
              },
            ]);
            setLoading(false); //若為對話，AI要停止思考
          }
        } else {
          console.error("HTTP 錯誤：", response.status);
        }
      } catch (error) {
        console.error("取得 XML 時發生錯誤：", error);
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
                iframeInitialized.current = true;
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
              console.warn("未處理的事件:", msg.event);
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
  const WEBSOCKET_API = "wss://d2s0u5536e7dee.cloudfront.net/production/";
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
    if (web_socket && web_socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket 已經連線，不重複建立");
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

        web_socket.onclose = (event) => {
          console.warn(`WebSocket 連線中斷 (${event.code})，將嘗試重新連線`);
          web_socket = null;
          setTimeout(() => {
            setupWebSocket();
          }, 3000); // 3 秒後重新連線
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
  const iframeInitialized = useRef(false);

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
      //更新xml
      requestExport();
      const conversationRequest = {
        prompt: inputText,
        session_id: session_id,
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
        const timestamp =
          now.getFullYear().toString() + // 年份
          (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
          now.getDate().toString().padStart(2, "0") + // 日期
          now.getHours().toString().padStart(2, "0") + // 小时
          now.getMinutes().toString().padStart(2, "0") + // 分钟
          now.getSeconds().toString().padStart(2, "0") + // 秒
          now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `錯誤：無法取得回應\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
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
        { sender: username, text: `轉換至 ${newPlatform}...` },
      ];
      setMessages(newMessages);
      setInputText("");
      setLoading(true);
      const now = new Date();
      //更新xml
      requestExport();
      const transformationRequest = {
        prompt: promptText,
        session_id: session_id,
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
        const timestamp =
          now.getFullYear().toString() + // 年份
          (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
          now.getDate().toString().padStart(2, "0") + // 日期
          now.getHours().toString().padStart(2, "0") + // 小时
          now.getMinutes().toString().padStart(2, "0") + // 分钟
          now.getSeconds().toString().padStart(2, "0") + // 秒
          now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `錯誤：無法取得回應.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
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
                <h1>{username}! 這是您的架構圖:</h1>
                <h2>此架構圖是根據模板選擇產生的。</h2>
                {diagramXml ? (
                  <>
                    <div className="button-container">
                      <button onClick={handleModifyPromptClick}>
                        修改prompt
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
                  我們正在設計您的架構圖，請稍等片刻，我們將在這裡為您提供即時的架構圖生成進度。
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
                    labelColor="#ffffff"
                    height="30px"
                    width="100%" // 确保进度条使用容器的宽度
                    labelSize="16px"
                    maxCompleted={7}
                    customLabel={progress_text[progress]}
                    labelAlignment="center" // 使文字居中对齐
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
                AI 可能會犯錯。請多次嘗試並仔細檢查結果。
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
