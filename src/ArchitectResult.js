import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useContext, useCallback } from "react";
import Dac from "./Dac";
import Drawio from "./Drawio";
import Chatbot from "./Chatbot";
import { CSSTransition } from "react-transition-group";
import "./App.css";
import { AppContext } from "./AppContext";
function ArchitectResult({
  idToken,
  user_id,
  username,
  surveyData,
  tool,
  platform,
  session_id,
  onRefreshTokenCheck,
  handleBack,
  handleLogoutButton,
}) {
  const {
    apiResponseReceived,
    setApiResponseReceived,
    error_message,
    seterror_message,
    messages,
    setMessages,
    setImageUrl,
    setsavecode,
    xmlUrl,
    setXmlUrl,
    resetArchitectResult,
  } = useContext(AppContext);
  //token過期呼叫
  const handleRefreshTokenCheck = () => {
    // 先執行當前組件的重置
    resetArchitectResult();
    console.log("Refreshcall in SurveyDisplay");
    onRefreshTokenCheck();
  };
  //返回按鈕
  const handleArchitectBack = useCallback(() => {
    resetArchitectResult();
    handleBack();
  }, [resetArchitectResult]);

  //登出按鈕
  const handleArchitectLogoutButton = () => {
    resetArchitectResult();
    handleLogoutButton();
  };

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
                  setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "System", text: data.body.ai_message },
                  ]);
                  return;
                } else {
                  setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "System", text: "AI已經更動圖片" },
                  ]);
                }
              }
            } else {
              //沒有databody，有錯誤
              if (!apiResponseReceived) {
                setApiResponseReceived(true);
                if (data.message.includes("Internal server error")) {
                  seterror_message(`Internal server error`);
                } else {
                  seterror_message(`Not found response data body`);
                }
              } else {
                if (data.message && data.message === "Internal server error") {
                  setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                      sender: "System",
                      text: data.message.includes("Internal server error")
                        ? "Internal server error"
                        : "Not found response data body",
                    },
                  ]);
                } else {
                  setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                      sender: "System",
                      text: "Not found response data body",
                    },
                  ]);
                }
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

  //一進來就執行，根據工具選擇不同處理函式
  useEffect(() => {
    if (tool === "drawio") {
      first_generate_drawio();
    } else {
      first_generate_dac();
    }
  }, []);

  //第一次生成dac
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
      const response = await fetch(url, {
        method: "POST",
        headers: {
          authorizationToken: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
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
      console.log("drawio_xml and s3_object_name and s3_python_code not found");
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

  //第一次生成drawio
  const first_generate_drawio = async () => {
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
      await setupWebSocket();
      web_socket.send(JSON.stringify({ action: "message", ...surveyData }));
      return;
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

  // 根據 tool 的值選擇相應的處理函數
  const handle_message = (message) => {
    const accessToken = localStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000; // 當前時間 (秒)
    // 檢查 token 是否過期
    if (decodedToken.exp < currentTime) {
      //超過4小時，就trigger AWSLogin去登出並跳警告
      handleRefreshTokenCheck();
      return;
    }
    if (tool === "diagrams") {
      handle_dac_message(message);
    } else {
      handle_drawio_message(message);
    }
  };
  const handle_dac_message = async (user_message /*isTransform = false*/) => {
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
    const newMessages = [{ sender: username, text: user_message }];
    // Update messages with the user message
    setMessages((prevMessages) => [...prevMessages, ...newMessages]);

    //prompt: isTransform ? promptText : user_message
    const conversationRequest = {
      prompt: user_message,
      session_id: session_id,
      user_id: user_id,
      tool: tool,
    };
    console.log("傳送格式:\n", conversationRequest);
    let response = "";
    try {
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

  const drawioRef = useRef(null);

  const handle_drawio_message = async (
    user_message /*isTransform = false*/
  ) => {
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

    const newMessages = [{ sender: username, text: user_message }];

    // Update messages with the user message
    setMessages((prevMessages) => [...prevMessages, ...newMessages]);

    //更新xml
    if (drawioRef.current) {
      drawioRef.current.requestExport();
      // 给一点时间让 XML 更新
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    // 获取最新的 XML
    const currentXml = drawioRef.current
      ? drawioRef.current.getCurrentXml()
      : null;

    //prompt: isTransform ? promptText : user_message
    const conversationRequest = {
      prompt: user_message,
      session_id: session_id,
      user_id: user_id,
      tool: tool,
      xml: currentXml,
    };
    console.log("傳送格式:\n", conversationRequest);
    try {
      await setupWebSocket();
      web_socket.send(
        JSON.stringify({ action: "message", ...conversationRequest })
      );
      return;
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
      <div className="header-container">
        <button onClick={handleArchitectBack} className="back-button">
          返回
        </button>
        <button onClick={handleArchitectLogoutButton} className="next-button">
          登出
        </button>
      </div>
      <CSSTransition in={true} timeout={300} classNames="fade" unmountOnExit>
        <div>
          <div className="survey-result-container">
            {tool === "diagrams" ? (
              <Dac username={username} platform={platform} />
            ) : (
              <Drawio
                username={username}
                apiResponseReceived={apiResponseReceived}
                xmlUrl={xmlUrl}
                error_message={error_message}
                ref={drawioRef}
              />
            )}
          </div>
          <Chatbot
            handle_message={handle_message} // Pass handle_message function to Chatbot
          />
        </div>
      </CSSTransition>
    </div>
  );
}

export default ArchitectResult;
