import ProgressBar from "@ramonak/react-progress-bar";
import { jwtDecode } from "jwt-decode";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { CSSTransition } from "react-transition-group";
import close from "./assets/grey close.png";
import systemImg from "./assets/system.jpeg";
import userImg from "./assets/user.jpg";
import "./App.css";

const ArchitectResult = forwardRef(
  (
    {
      idToken,
      user_id,
      username,
      surveyData,
      tool,
      platform,
      session_id,
      onRefreshTokenCheck,
    },
    resetref
  ) => {
    // 讀取 cookie 的函數
    const getCookie = (name) => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
          return c.substring(nameEQ.length, c.length);
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
    // 重置函數
    const resetSurvey = useCallback(() => {
      setApiResponseReceived(false);
      seterrorMessage("");
      setImageUrl("");
      setsavecode("");
      setMessages([]);
      setDiagramXml("");
      // 清除相關的 cookie
      setCookie("apiResponseReceived", "", -1);
      setCookie("errorMessage", "", -1);
      setCookie("imageUrl", "", -1);
      setCookie("savecode", "", -1);
      setCookie("messages", "", -1);
      localStorage.removeItem("diagramXml");
      // 重置其他相關狀態
      setInputText("");
      setLoading(false);
      setFileName("");
      setShowDialog(false);
      setXmlUrl("");
      setProgress(0);
      clearInterval(progressRef);
      iframeInitialized.current = false;
    }, []);
    // 讓父元件能夠呼叫此 reset 方法重置對話記錄與輸入
    useImperativeHandle(resetref, () => ({
      reset() {
        resetSurvey();
      },
    }));

    //token過期呼叫
    const handleRefreshTokenCheck = () => {
      // 先執行當前組件的重置
      resetSurvey();
      console.log("Refreshcall in SurveyDisplay");
      onRefreshTokenCheck();
    };

    const [apiResponseReceived, setApiResponseReceived] = useState(() => {
      const saved = getCookie("apiResponseReceived");
      return saved ? JSON.parse(saved) : false;
    });
    const [errorMessage, seterrorMessage] = useState(() => {
      const saved = getCookie("errorMessage");
      return saved ? saved : "";
    });
    const [imageUrl, setImageUrl] = useState(() => {
      return getCookie("imageUrl") || "";
    });
    const [savecode, setsavecode] = useState(() => {
      return getCookie("savecode") || false;
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
      setCookie("apiResponseReceived", apiResponseReceived);
      setCookie("errorMessage", errorMessage);
      setCookie("imageUrl", imageUrl);
      setCookie("savecode", savecode);
      setCookie("messages", JSON.stringify(messages));
      // 特别处理 diagramXml，因为它可能很大
      if (diagramXml) {
        localStorage.setItem("diagramXml", diagramXml);
      }
    };

    // 在狀態更新時更新 cookie
    useEffect(() => {
      updateCookies();
    }, [
      apiResponseReceived,
      errorMessage,
      imageUrl,
      savecode,
      messages,
      diagramXml,
    ]);

    //csd-ca-lab
    const baseurl = "https://d2s0u5536e7dee.cloudfront.net";
    //const baseurl = "http://localhost:3001";
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
              // 忽略 "Endpoint request timed out"
              if (data.message === "Endpoint request timed out") {
                console.warn("忽略 timeout 錯誤:", data);
                return; // 直接 return，不繼續執行後續邏輯
              }
              if (data.body) {
                setXmlUrl(baseurl + "/diagram/" + data.body.s3_object_name);
                // 第一次的xml 收到要歡迎語
                if (!apiResponseReceived) {
                  setShowDialog(true);
                  setMessages([
                    {
                      sender: "System",
                      text:
                        "嗨 " +
                        username +
                        ",我是 Archie.歡迎修改您的Prompt，我會即時為您調整架構圖。",
                    },
                  ]);
                  setApiResponseReceived(true);
                  clearInterval(progressRef);
                } else {
                  //此為對話
                  if (data.body.ai_message) {
                    setLoading(false); //若為對話，AI要停止思考
                    setMessages([
                      ...messages,
                      {
                        sender: "System",
                        text: data.body.ai_message,
                      },
                    ]);
                    return;
                  } else {
                    setMessages([
                      ...messages,
                      {
                        sender: "System",
                        text: `AI已經更動圖片`,
                      },
                    ]);
                    setLoading(false); //若為對話，AI要停止思考
                  }
                }
              } else {
                //沒有databody，有錯誤
                if (!apiResponseReceived) {
                  setApiResponseReceived(true);
                  setShowDialog(true);
                  seterrorMessage(`Not found response data body`);
                  clearInterval(progressRef);
                } else {
                  setLoading(false); //若為對話，AI要停止思考
                  setMessages([
                    ...messages,
                    {
                      sender: "System",
                      text: "Not found response data body",
                    },
                  ]);
                }
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

    //一進來就執行
    useEffect(() => {
      handleSubmit();
    }, []);

    //注意url，可能在local測試或是s3測試，s3要放在cloudFront才能執行
    const handleSubmit = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000; // 當前時間 (秒)
      // 檢查 token 是否過期
      if (decodedToken.exp <= currentTime) {
        //超過4小時，就trigger AWSLogin去登出並跳警告
        handleRefreshTokenCheck();
        return;
      }
      try {
        let response = "";
        if (tool === "drawio") {
          await setupWebSocket();
          web_socket.send(JSON.stringify({ action: "message", ...surveyData }));
          return;
        } else {
          response = await fetch(url, {
            method: "POST",
            headers: {
              authorizationToken: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
            body: surveyData,
          });
        }
        const responseData = await response.json();
        const now = new Date();
        const timestamp =
          now.getFullYear().toString() + // 年份
          (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
          now.getDate().toString().padStart(2, "0") + // 日期
          now.getHours().toString().padStart(2, "0") + // 小时
          now.getMinutes().toString().padStart(2, "0") + // 分钟
          now.getSeconds().toString().padStart(2, "0") + // 秒
          now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
        console.log("responseData :", responseData);
        //確保body裡面是json讀取，後端可能誤傳string
        if (response.status === 504) {
          seterrorMessage(
            `The request to the API Gateway timed out. Please try again later.\nSession: ${session_id}\nResponse Time: ${timestamp}`
          );
          setApiResponseReceived(true);
          clearInterval(progressRef);
          return; // 退出函式，避免進一步處理
        }
        let data =
          typeof responseData.body === "string"
            ? JSON.parse(responseData.body)
            : responseData.body;
        console.log("responseData 的body：", data);
        setApiResponseReceived(true);
        clearInterval(progressRef);
        if (typeof data === "undefined") {
          seterrorMessage(
            `
          The response format is incorrect: Cannot find the body, data type is undefined.
          Session: ${session_id}
          Response Time: ${timestamp}
          `
          );
          return;
        }
        if (data?.error_message) {
          seterrorMessage(
            `
          Error: ${data.error_message}
          Session: ${session_id}
          Response Time: ${timestamp}
          `
          );
        }
        if (tool === "drawio" && data?.drawio_xml) {
          setDiagramXml(data.drawio_xml);
          console.log("drawio_xml received:", data.drawio_xml);
          setShowDialog(true);
          setMessages([
            {
              sender: "System",
              text:
                "Hi " +
                username +
                ",我是 Archie.歡迎修改您的Prompt，我會即時為您調整架構圖。",
            },
          ]);
        } else if (data?.s3_object_name && data?.s3_python_code) {
          console.log("s3_object_name found:", data.s3_object_name);
          setImageUrl(baseurl + "/diagram/" + data.s3_object_name); //新的路徑為diagram
          setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          setShowDialog(true);
          setMessages([
            {
              sender: "System",
              text:
                "Hi " +
                username +
                ",我是 Archie.歡迎修改您的Prompt，我會即時為您調整架構圖。",
            },
          ]);
        } else {
          console.log(
            "drawio_xml and s3_object_name and s3_python_code not found"
          );
        }
      } catch (error) {
        console.error("Error submitting survey:", error);
        setApiResponseReceived(true);
        clearInterval(progressRef);
        const now = new Date();
        const timestamp =
          now.getFullYear().toString() + // 年份
          (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
          now.getDate().toString().padStart(2, "0") + // 日期
          now.getHours().toString().padStart(2, "0") + // 小时
          now.getMinutes().toString().padStart(2, "0") + // 分钟
          now.getSeconds().toString().padStart(2, "0") + // 秒
          now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
        if (error.message.includes("504")) {
          seterrorMessage(`
          The request to the API Gateway timed out. Please try again later.
          Session: ${session_id}
          Response Time: ${timestamp}`);
        } else if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          seterrorMessage(`
          CORS policy error: The server is not allowing cross-origin requests.
          Session: ${session_id}
          Response Time: ${timestamp}
          又忘記這是Localhost了嗎?`);
        } else {
          seterrorMessage(`提交失敗，請稍後再試。
          Session: ${session_id}
          Response Time: ${timestamp}`);
        }
      }
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
    useEffect(() => {
      progressRef.current = setInterval(() => {
        setProgress((prev) => (prev < 280 ? prev + 1 : prev));
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
            console.log("fetch XmlUrl success");
          } else {
            console.error("HTTP 錯誤:", response.status);
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
          console.error("處理訊息時發生錯誤：", error);
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

    // 當message改變滑動到指定參考位置
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // HandleConversationSand
    const handleSend = async (isTransform = false) => {
      const accessToken = localStorage.getItem("accessToken");
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000; // 當前時間 (秒)
      // 檢查 token 是否過期
      if (decodedToken.exp < currentTime) {
        //超過4小時，就trigger AWSLogin去登出並跳警告
        handleRefreshTokenCheck();
        return;
      }
      let promptText = "";
      const newMessages = messages;
      if (isTransform) {
        const newPlatform = platform === "aws" ? "gcp" : "aws";
        promptText = generatePrompt(newPlatform);
        newMessages = [
          ...messages,
          { sender: username, text: `transforming to ${newPlatform}...` },
        ];
        setMessages(newMessages);
      } else {
        if (inputText.trim() !== "") return;
        newMessages = [...messages, { sender: username, text: inputText }];
        setMessages(newMessages);
      }
      setInputText("");
      setLoading(true);
      //更新xml
      if (tool === "drawio") {
        requestExport();
      }
      const conversationRequest = {
        prompt: isTransform ? promptText : inputText,
        session_id: session_id,
        user_id: user_id,
        tool: tool,
        xml: diagramXml,
      };
      console.log("傳送格式:\n", conversationRequest);
      let response = "";
      try {
        if (conversationRequest.tool === "drawio") {
          await setupWebSocket();
          web_socket.send(
            JSON.stringify({ action: "message", ...conversationRequest })
          );
          return;
        } else {
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorizationToken: `Bearer ${idToken}`,
            },
            body: JSON.stringify(conversationRequest),
          });
        }
        const responseData = await response.json();
        const now = new Date();
        const timestamp =
          now.getFullYear().toString() + // 年份
          (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
          now.getDate().toString().padStart(2, "0") + // 日期
          now.getHours().toString().padStart(2, "0") + // 小时
          now.getMinutes().toString().padStart(2, "0") + // 分钟
          now.getSeconds().toString().padStart(2, "0") + // 秒
          now.getMilliseconds().toString().padStart(3, "0"); // 毫秒
        console.log("responseData :", responseData);
        //  api gateway的錯誤
        if (response.status === 504) {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `向 API Gateway 請求逾時。請稍後重試.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          setLoading(false);
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
              text: `回覆格式不正確\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          setLoading(false);
        } else if (data.error_message) {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `Error occur: ${data.error_message}\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          setLoading(false);
        } else if (data?.ai_message) {
          if (data?.s3_object_name && data?.s3_python_code) {
            setImageUrl(baseurl + "/diagram/" + data.s3_object_name);
            setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          }

          setMessages([
            ...newMessages,
            { sender: "System", text: data.ai_message },
          ]);
          setLoading(false);
        } //如果只有圖片
        else if (data?.s3_object_name && data?.s3_python_code) {
          setImageUrl(baseurl + "/diagram/" + data.s3_object_name);
          setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `AI無反應但回傳影像\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          setLoading(false);
        } else {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `內部伺服器的回應格式錯誤\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          setLoading(false);
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
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `錯誤：無法取得回應。\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
          },
        ]);
        console.log(error);
        setLoading(false);
      }
    };

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
        handleSend(false); // 執行送出訊息的函數
        setInputText("");
      }
    };
    const CustomPromptTemplate = `transform to {platform}, make sure to follow the transformation and service mapping rules, and ensure all security and operational components present.`;
    // 定义一个函数来替换 {platform} 占位符
    const generatePrompt = (platform) => {
      return CustomPromptTemplate.replace("{platform}", platform);
    };
    return (
      <div className="App">
        <CSSTransition in={true} timeout={300} classNames="fade" unmountOnExit>
          <div className="survey-result-container">
            {apiResponseReceived ? (
              errorMessage ? (
                <>
                  <p className="error-message">{errorMessage}</p>
                </>
              ) : (
                <>
                  {diagramXml ? (
                    <>
                      {/* <div className="button-container"> */}
                      {/* <div className="platform-button-container">
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
                          </div> */}
                      {/* </div> */}
                      <iframe
                        ref={iframeRef}
                        id="drawio-frame"
                        src="https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&saveAndExit=1"
                        allowFullScreen
                        sandbox="allow-scripts allow-downloads allow-same-origin"
                        style={{ width: "100%" }}
                      ></iframe>
                    </>
                  ) : imageUrl ? (
                    <>
                      <div className="button-container">
                        <button onClick={handleSaveFile}>儲存圖片</button>
                        <button onClick={handleSaveCode}>儲存程式碼</button>
                        <button onClick={handleZoomOut}>🔍 -</button>
                        <button onClick={handleZoomIn}>🔍 +</button>
                        <div className="platform-button-container">
                          <button
                            onClick={handleSend(true)}
                            disabled={platform === "aws"}
                          >
                            AWS
                          </button>
                          <button
                            onClick={handleSend(true)}
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
                    <p className="error-message">
                      沒有架構圖回傳，圖片解析失敗
                    </p>
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
          </div>
        </CSSTransition>
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
                <button onClick={handleSend(true)}>
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path
                      fill="currentColor"
                      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                    ></path>
                  </svg>
                </button>
              </div>
              <p className="warning">
                AI可能會犯錯。請多次嘗試並仔細查看結果。
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);
export default ArchitectResult;
