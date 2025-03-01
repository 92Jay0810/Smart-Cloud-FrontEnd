import { jwtDecode } from "jwt-decode";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import Dac from "./Dac";
import Chatbot from "./Chatbot";
import { CSSTransition } from "react-transition-group";
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
      seterror_message("");
      setImageUrl("");
      setsavecode("");
      setXmlUrl("");
      setMessages([]);
      // 清除相關的 cookie
      setCookie("apiResponseReceived", "", -1);
      setCookie("error_message", "", -1);
      setCookie("imageUrl", "", -1);
      setCookie("savecode", "", -1);
      setCookie("xmlUrl", "", -1);
      setCookie("messages", "", -1);
      // 重置其他相關狀態
      setXmlUrl("");
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
    const [error_message, seterror_message] = useState(() => {
      const saved = getCookie("error_message");
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
    const [xmlUrl, setXmlUrl] = useState(() => {
      return getCookie("xmlUrl") || "";
    });

    // 更新 cookie 的函數
    const updateCookies = () => {
      setCookie("apiResponseReceived", apiResponseReceived);
      setCookie("error_message", error_message);
      setCookie("imageUrl", imageUrl);
      setCookie("savecode", savecode);
      setCookie("messages", JSON.stringify(messages));
    };

    // 在狀態更新時更新 cookie
    useEffect(() => {
      updateCookies();
    }, [
      apiResponseReceived,
      error_message,
      imageUrl,
      savecode,
      xmlUrl,
      messages,
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
                } else {
                  //此為對話
                  if (data.body.ai_message) {
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
                  }
                }
              } else {
                //沒有databody，有錯誤
                if (!apiResponseReceived) {
                  setApiResponseReceived(true);
                  seterror_message(`Not found response data body`);
                } else {
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

    //一進來就執行
    useEffect(() => {
      first_generate_dac();
    }, []);

    //注意url，可能在local測試或是s3測試，s3要放在cloudFront才能執行
    const first_generate_dac = async () => {
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
        if (tool === "drawio") {
          await setupWebSocket();
          web_socket.send(JSON.stringify({ action: "message", ...surveyData }));
          return;
        }
        const response = await fetch(url, {
          method: "POST",
          headers: {
            authorizationToken: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: surveyData,
        });

        const responseData = await response.json();
        console.log("responseData :", responseData);

        // Create timestamp inline where needed
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:T.]/g, "")
          .slice(0, 17);
        // End progress and mark as received
        setApiResponseReceived(true);
        if (response.status === 504) {
          seterror_message(
            `The request to the API Gateway timed out. Please try again later.\nSession: ${session_id}\nResponse Time: ${timestamp}`
          );
          return; // 退出函式，避免進一步處理
        }
        // Parse response body if needed
        const data =
          typeof responseData.body === "string"
            ? JSON.parse(responseData.body)
            : responseData.body;
        console.log("responseData 的body：", data);

        // Handle undefined data
        if (!data) {
          seterror_message(
            `The response format is incorrect: Cannot find the body, data type is undefined.\nSession: ${session_id}\nResponse Time: ${timestamp}`
          );
          return;
        }
        if (data?.error_message) {
          seterror_message(
            `
          Error: ${data.error_message}
          Session: ${session_id}
          Response Time: ${timestamp}
          `
          );
        }
        if (data?.s3_object_name && data?.s3_python_code) {
          console.log("s3_object_name found:", data.s3_object_name);
          setImageUrl(baseurl + "/diagram/" + data.s3_object_name); //新的路徑為diagram
          setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          setMessages([
            {
              sender: "System",
              text:
                "Hi " +
                username +
                ",我是 Archie.歡迎修改您的Prompt，我會即時為您調整架構圖。",
            },
          ]);
          return;
        }
        console.log(
          "drawio_xml and s3_object_name and s3_python_code not found"
        );
      } catch (error) {
        console.error("Error submitting survey:", error);
        setApiResponseReceived(true);
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:T.]/g, "")
          .slice(0, 17);
        if (error.message.includes("504")) {
          seterror_message(`
          The request to the API Gateway timed out. Please try again later.
          Session: ${session_id}
          Response Time: ${timestamp}`);
        } else if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          seterror_message(`
          CORS policy error: The server is not allowing cross-origin requests.
          Session: ${session_id}
          Response Time: ${timestamp}
          又忘記這是Localhost了嗎?`);
        } else {
          seterror_message(`提交失敗，請稍後再試。
          Session: ${session_id}
          Response Time: ${timestamp}`);
        }
      }
    };

    const handle_message = async (user_message /*isTransform = false*/) => {
      const accessToken = localStorage.getItem("accessToken");
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000; // 當前時間 (秒)
      // 檢查 token 是否過期
      if (decodedToken.exp < currentTime) {
        //超過4小時，就trigger AWSLogin去登出並跳警告
        handleRefreshTokenCheck();
        return;
      }
      /*
      let promptText = "";
      if (isTransform) {
        const newPlatform = platform === "aws" ? "gcp" : "aws";
        promptText = generatePrompt(newPlatform);
        newMessages = [
          ...messages,
          { sender: username, text: `transforming to ${newPlatform}...` },
        ];
        setMessages(newMessages);
      }*/
      let newMessages = [...messages];
      newMessages = [...messages, { sender: username, text: user_message }];
      setMessages(newMessages);
      //更新xml
      /*if (tool === "drawio") {
        requestExport();
      }*/
      //prompt: isTransform ? promptText : user_message
      const conversationRequest = {
        prompt: user_message,
        session_id: session_id,
        user_id: user_id,
        tool: tool,
        //xml: diagramXml,
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
        }
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorizationToken: `Bearer ${idToken}`,
          },
          body: JSON.stringify(conversationRequest),
        });
        const responseData = await response.json();
        console.log("responseData :", responseData);
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:T.]/g, "")
          .slice(0, 17);
        //  api gateway的錯誤
        if (response.status === 504) {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `向 API Gateway 請求逾時。請稍後重試.\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          return; // 退出函式，避免進一步處理
        }
        // Parse response body if needed
        const data =
          typeof responseData.body === "string"
            ? JSON.parse(responseData.body)
            : responseData.body;
        console.log("responseData 的body：", data);
        // Handle undefined data
        if (!data) {
          seterror_message(
            `The response format is incorrect: Cannot find the body, data type is undefined.\nSession: ${session_id}\nResponse Time: ${timestamp}`
          );
          return;
        }
        if (data?.error_message) {
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `Error occur: ${data.error_message}\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          return;
        }
        if (data?.ai_message) {
          if (data?.s3_object_name && data?.s3_python_code) {
            setImageUrl(baseurl + "/diagram/" + data.s3_object_name);
            setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          }

          setMessages([
            ...newMessages,
            { sender: "System", text: data.ai_message },
          ]);
          return;
        }
        //如果只有圖片
        if (data?.s3_object_name && data?.s3_python_code) {
          setImageUrl(baseurl + "/diagram/" + data.s3_object_name);
          setsavecode(baseurl + "/diagram/" + data.s3_python_code);
          setMessages([
            ...newMessages,
            {
              sender: "System",
              text: `AI無反應但回傳影像\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
            },
          ]);
          return;
        }
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `內部伺服器的回應格式錯誤\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
          },
        ]);
      } catch (error) {
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:T.]/g, "")
          .slice(0, 17);
        setMessages([
          ...newMessages,
          {
            sender: "System",
            text: `錯誤：無法取得回應。\nSession ID: ${session_id}\nTimestamp: ${timestamp}`,
          },
        ]);
        console.log(error);
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
          <div>
            <div className="survey-result-container">
              {tool === "diagrams" ? (
                <Dac
                  username={username}
                  apiResponseReceived={apiResponseReceived}
                  imageUrl={imageUrl}
                  error_message={error_message}
                  savecode={savecode}
                  platform={platform}
                  ref={resetref}
                />
              ) : (
                <div className="survey-result-container">
                  <h1>test</h1>
                </div>
              )}
            </div>
            <Chatbot
              idToken={idToken}
              username={username}
              session_id={session_id}
              apiResponseReceived={apiResponseReceived}
              messages={messages}
              handle_message={handle_message} // Pass handle_message function to Chatbot
              ref={resetref}
            />
          </div>
        </CSSTransition>
      </div>
    );
  }
);
export default ArchitectResult;
