import ProgressBar from "@ramonak/react-progress-bar";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useContext,
} from "react";
import { CSSTransition } from "react-transition-group";
import "../App.css";
import { AppContext } from "../AppContext";
const Drawio = forwardRef(({ username }, ref) => {
  const {
    apiResponseReceived,
    error_message,
    xmlUrl,
    diagramXml,
    setDiagramXml,
  } = useContext(AppContext);
  // 重置函數,一進來就reset
  useEffect(() => {
    setProgress(0);
    clearInterval(progressRef.current);
    iframeInitialized.current = false;
  }, []);
  const resetSurvey = useCallback(() => {
    // 重置其他相關狀態
    setProgress(0);
    clearInterval(progressRef);
    clearInterval(iframeRef);
    iframeInitialized.current = false;
  }, []);
  // 讓父元件能夠呼叫此 reset 方法重置對話記錄與輸入
  useImperativeHandle(ref, () => ({
    // 若使用者進行對話，則進行PostMessage得到xml
    requestExport() {
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
        console.log("requestExport sent from external call");
      }
    },
    getCurrentXml() {
      return diagramXml;
    },
  }));

  //ConversationDialog
  const iframeRef = useRef(null);
  const iframeInitialized = useRef(false);

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
  //遞增圖片進度條
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
            case "load":
              console.warn("load事件觸發");
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

  return (
    <div className="App">
      <CSSTransition in={true} timeout={300} classNames="fade" unmountOnExit>
        <div className="survey-result-container">
          {apiResponseReceived ? (
            error_message ? (
              <>
                <p className="error-message">{error_message}</p>
              </>
            ) : (
              <>
                {diagramXml ? (
                  <iframe
                    ref={iframeRef}
                    id="drawio-frame"
                    src="https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&saveAndExit=1"
                    allowFullScreen
                    sandbox="allow-scripts allow-downloads allow-same-origin"
                    style={{ width: "100%" }}
                  ></iframe>
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
        </div>
      </CSSTransition>
    </div>
  );
});
export default Drawio;
