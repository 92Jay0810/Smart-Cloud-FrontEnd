import React, { useState, useRef, useEffect, useCallback } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./SurveyDisplay.css";
import { jwtDecode } from "jwt-decode";
import userImg from "./assets/user.jpg";
import systemImg from "./assets/system.jpeg";
import close from "./assets/grey close.png";
import { v4 as uuidv4 } from "uuid";
import loadingImg from "./assets/loading1.gif";
const survey = [
  {
    category: "Cloud Platform 雲端平台",
    questions: [
      {
        question: "系統要使用哪個平台？",
        options: ["AWS", "GCP"],
      },
    ],
  },
  {
    category: "Networking 網路",
    questions: [
      {
        question: "系統是否需要共用VPC或自建VPC？",
        options: ["共用VPC", "自建VPC"],
      },
      {
        question: "系統是否公開服務給外部網路(Internet)？",
        options: ["是", "否"],
      },
      {
        question: "系統是否需要域名服務(DNS)？",
        options: ["雲端DNS服務", "自建地端DNS服務", "否"],
      },
      {
        question:
          "系統是否本身無公開位址(Public IP)，但需要存取到外部網路(Internet)？",
        options: ["是", "否"],
      },
      {
        question: "系統是否需要靜態網頁快取(Cache)？",
        options: ["是", "否"],
      },
      {
        question: "系統是否須與其他系統串接？",
        options: ["On-premise", "GCP", "AWS/ Other"],
      },
    ],
  },
  {
    category: "Computing 運算",
    questions: [
      {
        question: "系統現行的應用系統架構為何？ ",
        options: ["Microservices", "N-tier", "eBAF", "Monolith"],
      },
      {
        question: "系統涵蓋的服務數量？ ",
        options: ["服務數量 < 10", "服務數量 > 10"],
      },
      {
        question: "Stateful or Stateless?",
        options: ["Stateful", "Stateless"],
      },
      {
        question: "是否需要用到GPU?",
        options: ["是", "否"],
      },
    ],
  },
  {
    category: "Database 資料庫",
    questions: [
      {
        question: "系統需要使用哪種資料庫(DB)？",
        options: ["PostgreSQL", "MySQL", "MS SQL", "NoSQL"],
      },
      {
        question: "資料是否需要快取記憶？",
        options: ["是", "否"],
      },
      {
        question: "資料是否需要高可用配置?",
        options: ["Active/Active", "Active/Standby", "否"],
      },
    ],
  },
  {
    category: "Storage 儲存",
    questions: [
      {
        question: "系統是否需要使用共享儲存裝置？(如NFS)",
        options: ["是", "否"],
      },
      {
        question: "系統是否有大於1GB的檔案存放(如文件、圖片、影片、音樂)？",
        options: ["是", "否"],
      },
      {
        question: "儲存是否需高可用配置？ ",
        options: ["Active/Active", "Active/Standby", "否"],
      },
    ],
  },
  {
    category: "tool 繪圖工具",
    questions: [
      {
        question: "請選擇架構圖的繪圖工具",
        options: ["Diagrams", "Draw.io"],
      },
    ],
  },
];

function SurveyDisplay({
  idToken,
  user_id,
  username,
  handleBackPrortalPage,
  onRefreshTokenCheck,
  handleLogout,
}) {
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
  // 重置函數
  const resetSurvey = useCallback(() => {
    setSubmitted(false);
    setApiResponseReceived(false);
    seterrorMessage("");
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
    setCookie("apiResponseReceived", "", -1);
    setCookie("errorMessage", "", -1);
    setCookie("imageUrl", "", -1);
    setCookie("savecode", "", -1);
    setCookie("platform", "", -1);
    setCookie("tool", "", -1);
    setCookie("messages", "", -1);
    setCookie("surveyAnswers", "", -1);
    // 重置其他相關狀態
    setAnswers({});
    setCurrentCategoryIndex(0);
    setShowDialog(false);
    setInputText("");
    setLoading(false);
    setShowDialog(false);
    setFileName("");
  }, []);

  //返回按鈕
  const handleBack = useCallback(() => {
    resetSurvey(); // 先執行當前組件的重置
    handleBackPrortalPage(); // 返回服務選擇頁面
  }, [resetSurvey, handleBackPrortalPage]);

  //service
  const [answers, setAnswers] = useState(() => {
    const savedAnswers = getCookie("surveyAnswers");

    return savedAnswers ? JSON.parse(savedAnswers) : {};
  }, []);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const categoryRefs = useRef(survey.map(() => React.createRef()));
  const surveyContainerRef = useRef(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // 服務確認頁面

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
  // 更新 cookie 的函數
  const updateCookies = () => {
    setCookie("submitted", submitted);
    setCookie("apiResponseReceived", apiResponseReceived);
    setCookie("errorMessage", errorMessage);
    setCookie("imageUrl", imageUrl);
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
  }, [
    submitted,
    apiResponseReceived,
    errorMessage,
    imageUrl,
    savecode,
    platform,
    tool,
    messages,
    session_id,
    diagramXml,
  ]);

  //fetch url and show image

  //csd-ca-lab
  const baseurl = "https://d2s0u5536e7dee.cloudfront.net";
  const url = baseurl + "/api/diagram-as-code";
  //const url = "http://localhost:3001";

  //ConversationDialog
  const [showDialog, setShowDialog] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);

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

  //處理選擇選項
  const handleOptionSelect = (categoryIndex, questionIndex, optionIndex) => {
    const newAnswers = {
      ...answers,
      [`${categoryIndex}-${questionIndex}`]: optionIndex,
    };
    setAnswers(newAnswers);
    // 將新的答案保存到 cookie 中
    setCookie("surveyAnswers", JSON.stringify(newAnswers), 7); // 保存 7 天
  };

  //當頁數變更時，往上滑動頁面
  useEffect(() => {
    if (surveyContainerRef.current) {
      surveyContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentCategoryIndex]);

  const handleNext = () => {
    if (currentCategoryIndex < survey.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  //注意url，可能在local測試或是s3測試，s3要放在cloudFront才能執行
  const handleSubmit = async () => {
    setShowConfirmDialog(false); // 關閉對話框
    const accessToken = localStorage.getItem("accessToken");
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000; // 當前時間 (秒)
    // 檢查 token 是否過期
    if (decodedToken.exp <= currentTime) {
      //超過4小時，就trigger AWSLogin去登出並跳警告
      handleRefreshTokenCheck();
      return;
    }
    const totalQuestions = survey.reduce(
      (sum, category) => sum + category.questions.length,
      0
    );
    if (Object.keys(answers).length === totalQuestions) {
      setSubmitted(true);
      console.log("提交的答案：", answers);
      const now = new Date();
      const timestamp =
        now.getFullYear().toString() + // 年份
        (now.getMonth() + 1).toString().padStart(2, "0") + // 月份
        now.getDate().toString().padStart(2, "0") + // 日期
        now.getHours().toString().padStart(2, "0") + // 小时
        now.getMinutes().toString().padStart(2, "0") + // 分钟
        now.getSeconds().toString().padStart(2, "0") + // 秒
        now.getMilliseconds().toString().padStart(3, "0"); // 毫秒

      let TransformAsnwers = transformAnswers(answers);
      const SumbitAnswers = {
        query: TransformAsnwers,
        timestamp: timestamp,
        session_id: session_id,
        user_id: user_id,
        tool: TransformAsnwers["5-0"],
      };
      setPlatform(SumbitAnswers.query["0-0"]);
      setTool(SumbitAnswers.tool);
      console.log("傳送格式:\n", SumbitAnswers);
      try {
        let response = "";
        response = await fetch(url, {
          method: "POST",
          headers: {
            authorizationToken: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(SumbitAnswers),
        });
        const responseData = await response.json();
        console.log("responseData :", responseData);
        //確保body裡面是json讀取，後端可能誤傳string
        if (response.status === 504) {
          seterrorMessage(
            `The request to the API Gateway timed out. Please try again later.\nSession: ${session_id}\nResponse Time: ${timestamp}`
          );
          setApiResponseReceived(true);
          return; // 退出函式，避免進一步處理
        }
        let data =
          typeof responseData.body === "string"
            ? JSON.parse(responseData.body)
            : responseData.body;
        console.log("responseData 的body：", data);
        setApiResponseReceived(true);

        if (typeof data === "undefined") {
          seterrorMessage(
            `
          The response format is incorrect: Cannot find the body, data type is undefined.
          Session: ${session_id}
          Response Time: ${timestamp}
          `
          );

          setApiResponseReceived(true);
        }
        if (data?.errorMessage) {
          seterrorMessage(
            `
          Error: ${data.errorMessage}
          Session: ${session_id}
          Response Time: ${timestamp}
          `
          );
        }
        if (SumbitAnswers.tool === "drawio" && data?.drawio_xml) {
          setDiagramXml(data.drawio_xml);
          console.log("drawio_xml received:", data.drawio_xml);
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
                ", I'm Archie. Feel free to modify your prompts,and I'll adjust the architecture diagram for you in real time.",
            },
          ]);
        } else {
          console.log(
            "drawio_xml and s3_object_name and s3_python_code not found"
          );
        }
        // 清除 cookie 中的答案
        setCookie("surveyAnswers", "", -1);
      } catch (error) {
        console.error("Error submitting survey:", error);
        setApiResponseReceived(true);
        if (error.message.includes("504")) {
          seterrorMessage(`
          The request to the API Gateway timed out. Please try again later.
          Session: ${session_id}
          Response Time: ${timestamp}`);
        } else {
          seterrorMessage(`提交失敗，請稍後再試。
          Session: ${session_id}
          Response Time: ${timestamp}`);
        }
        // 清除 cookie 中的答案
        setCookie("surveyAnswers", "", -1);
      }
    } else {
      alert("請回答所有問題後再提交！");
    }
  };

  //將Answers格式轉換，交給後端
  const transformAnswers = (answers) => {
    const result = {};
    const mappings = {
      "0-0": ["aws", "gcp"],
      "1-0": ["SharedVpc", "SelfBuildVpc"],
      "1-1": ["OpenServiceYes", "OpenServiceNo"],
      "1-2": ["CloudDns", "SelfBuildDns", "DnsNo"],
      "1-3": ["ExternalServiceYes", "ExternalServiceNo"],
      "1-4": ["WebCacheYes", "WebCacheNo"],
      "1-5": [
        "ConnectionOnpremise",
        "ConnectionSamePlatform",
        "ConnectionCrossPlatform",
      ],
      "2-0": [
        "ArchitectureMicroservices",
        "ArchitectureNtier",
        "ArchitectureEbaf",
        "ArchitectureMonolith",
      ],
      "2-1": ["ServiceLess10", "ServiceOver10"],
      "2-2": ["Stateful", "Stateless"],
      "2-3": ["GpuYes", "GpuNo"],
      "3-0": [
        "DatabasePostgreSql",
        "DatabaseMysql",
        "DatabaseMssql",
        "DatabaseNoSql",
      ],
      "3-1": ["DataCacheYes", "DataCacheNo"],
      "3-2": ["HighAvailableActive", "HighAvailableStandby", "HighAvailableNo"],
      "4-0": ["ShareStorageYes", "ShareStorageNo"],
      "4-1": ["DocumentOver1GbYes", "DocumentOver2GbNo"],
      "4-2": ["StorageActive", "StorageStandby", "StorageNo"],
      "5-0": ["diagrams", "drawio"],
    };
    Object.keys(answers).forEach((key) => {
      const optionID = answers[key];
      const mappedOptions = mappings[key];

      if (mappedOptions && mappedOptions[optionID] !== undefined) {
        result[key] = mappedOptions[optionID];
      }
    });
    return result;
  };
  // 顯示確認對話框
  const handleConfirmSubmit = () => {
    setShowConfirmDialog(true);
  };
  // 關閉確認對話框
  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };
  const renderAnswerSummary = () => {
    return Object.keys(answers).map((key) => {
      const [categoryIndex, questionIndex] = key.split("-");
      const question = survey[categoryIndex].questions[questionIndex];
      const selectedOption = question.options[answers[key]];
      return (
        <div key={key}>
          <p>
            <strong>{question.question}</strong>: {selectedOption}
          </p>
        </div>
      );
    });
  };
  //處理draw io
  const loadDiagram = () => {
    if (!iframeRef.current || !diagramXml) return;
    const message = {
      action: "load",
      xml: diagramXml,
    };
    iframeRef.current.contentWindow.postMessage(JSON.stringify(message), "*");
  };
  //處理draw io
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "init") {
          loadDiagram();
        }
      } catch (error) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [diagramXml]);

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
        console.error("Error downloading the file:", error);
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
        console.error("Error downloading the file:", error);
        setShowSaveDialog(false);
      }
    }
  };

  // 當message改變滑動到指定參考位置
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // HandleConversationSand
  //對話目前未處裡 XML的回應
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
    //textarea.style.height = "auto"; // 先重設高度
    //textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`; // 根據內容調整高度，最多4行（大約100px）
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
            {apiResponseReceived ? (
              errorMessage ? (
                <>
                  <p className="error-message">{errorMessage}</p>
                </>
              ) : (
                <>
                  <h1>Nice, {username}! Here is your architecture:</h1>
                  <h2>
                    This architecture diagram is generated based on the
                    technical requirements you provided.
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
                      ></iframe>
                    </>
                  ) : imageUrl ? (
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
                    <p className="error-message">
                      沒有架構圖回傳，圖片解析失敗
                    </p>
                  )}
                </>
              )
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

  const currentCategory = survey[currentCategoryIndex];
  return (
    <div className="survey-container" ref={surveyContainerRef}>
      <h1>Hi {username}! Welcome to Smart Archie!</h1>
      <h2>
        Please provide the technical requirements below, and we'll design a
        custom cloud architecture diagram just for you.
      </h2>
      <div className="header-container">
        <button onClick={handleBack} className="back-button">
          返回
        </button>
        <button onClick={handleLogout} className="next-button">
          登出
        </button>
      </div>
      <TransitionGroup>
        <CSSTransition
          key={currentCategoryIndex}
          timeout={300}
          classNames="slide"
          nodeRef={categoryRefs.current[currentCategoryIndex]}
        >
          <div
            ref={categoryRefs.current[currentCategoryIndex]}
            className="category-container"
          >
            <h1>
              {currentCategoryIndex + 1}.{currentCategory.category}
            </h1>
            {currentCategory.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="question-container">
                <h3>
                  {questionIndex + 1}.{question.question}
                </h3>
                <div className="options-container">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      className={`option-button ${
                        answers[`${currentCategoryIndex}-${questionIndex}`] ===
                        optionIndex
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleOptionSelect(
                          currentCategoryIndex,
                          questionIndex,
                          optionIndex
                        )
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CSSTransition>
      </TransitionGroup>
      <div className="navigation-buttons">
        <button
          className="previous-button"
          onClick={handlePrevious}
          disabled={currentCategoryIndex === 0}
        >
          上一頁
        </button>
        {currentCategoryIndex < survey.length - 1 ? (
          <button className="nextt-button" onClick={handleNext}>
            下一頁
          </button>
        ) : (
          <button className="submit-button" onClick={handleConfirmSubmit}>
            提交問卷
          </button>
        )}
      </div>
      {showConfirmDialog && (
        <>
          <div
            className="confirm-dialog_overlay"
            onClick={handleCancelSubmit}
          ></div>
          <div className="confirm-dialog">
            <h1>確認您的答案及選擇</h1>
            {renderAnswerSummary()}
            <div className="navigation-buttons">
              <button className="submit-button" onClick={handleCancelSubmit}>
                取消
              </button>
              <button className="submit-button" onClick={handleSubmit}>
                確認提交
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SurveyDisplay;
