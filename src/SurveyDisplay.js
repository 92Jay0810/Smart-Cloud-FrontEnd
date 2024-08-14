import React, { useState, useRef, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./SurveyDisplay.css";
import userImg from "./assets/user.jpg";
import systemImg from "./assets/system.jpeg";
const survey = [
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
        options: ["是", "否"],
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
        options: ["Active/Active", "Active/Standby"],
      },
    ],
  },
  {
    category: "Security 安全",
    questions: [
      {
        question: "是否需要硬體安全模組(HSM) ?",
        options: ["是", "否"],
      },
      {
        question: "是否有高安全需求？",
        options: ["是", "否"],
      },
      {
        question: "是否有個資需要額外保護？",
        options: ["是", "否"],
      },
    ],
  },
];

function SurveyDisplay() {
  const [answers, setAnswers] = useState({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const surveyContainerRef = useRef(null);
  //禁止CSSTransition使用findDOMNode，改用Ref，還能改進效能，為每個survey內的類別去Ref
  const categoryRefs = useRef(survey.map(() => React.createRef()));
  const baseurl = "https://d1fnvwdkrkz29m.cloudfront.net";
  const url = baseurl + "/api/diagram-as-code";
  //const url = "http://localhost:3001";
  const [imageUrl, setImageUrl] = useState("");
  //ConversationDialog
  const [showDialog, setShowDialog] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  //saveDialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState("");

  // 從 cookie 讀取答案
  useEffect(() => {
    const savedAnswers = getCookie("surveyAnswers");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

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
  //最後注意是否有清除cookie
  const handleSubmit = async () => {
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
      const formattedAnswers = {
        ...transformAnswers(answers),
        timestamp: timestamp, // 加入自定义格式的时间戳
      };
      console.log("轉換後的答案：", formattedAnswers);
      //用Cognito登陸成功，會回傳access Token，儲放在localStorage
      const accessToken = localStorage.getItem("accessToken");
      try {
        let response = "";
        if (accessToken) {
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(formattedAnswers),
          });
        } else {
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedAnswers),
          });
        }
        const responseData = await response.json();
        const data = responseData.body;
        console.log(data);
        setApiResponse(data);
        if (data?.s3_object_name) {
          setImageUrl(
            baseurl + "/diagram-as-code-output/" + data.s3_object_name
          );
        }
        // 清除 cookie 中的答案
        setCookie("surveyAnswers", "", -1);
      } catch (error) {
        console.error("Error submitting survey:", error);
        setApiResponse({ error: "提交失敗，請稍後再試。" });
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
      "0-0": ["SharedVpc", "SelfBuildVpc"],
      "0-1": ["OpenServiceYes", "OpenServiceNo"],
      "0-2": ["CloudDns", "SelfBuildDns", "DnsNo"],
      "0-3": ["ExternalServiceYes", "ExternalServiceNo"],
      "0-4": ["WebCacheYes", "WebCacheNo"],
      "0-5": [
        "ConnectionOnpremise",
        "ConnectionSamePlatform",
        "ConnectionCrossPlatform",
      ],
      "1-0": [
        "ArchitectureMicroservices",
        "ArchitectureNtier",
        "ArchitectureEbaf",
        "ArchitectureMonolith",
      ],
      "1-1": ["ServiceLess10", "ServiceOver10"],
      "1-2": ["Stateful", "Statless"],
      "1-3": ["GpuYes", "GpuNo"],
      "2-0": [
        "DatabasePostgreSql",
        "DatabaseMysql",
        "DatabaseMssql",
        "DatabaseNoSql",
      ],
      "2-1": ["DataCacheYes", "DataCacheNo"],
      "2-2": ["HighAvailabilityYes", "HighAvailabilityNo"],
      "3-0": ["ShareStroageYes", "ShareStroageNo"],
      "3-1": ["DocumentOver1GbYes", "DocumentOver2GbNo"],
      "3-2": ["StorageActive", "StroageStandby"],
      "4-0": ["HsmYes", "HsmNo"],
      "4-1": ["HighSecuityYes", "HighSecuityNo"],
      "4-2": ["PersonalInformationYes", "PersonalInformationNo"],
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

  const handleSaveFile = () => {
    setShowSaveDialog(true);
  };

  const saveFile = async () => {
    if (apiResponse && imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const temp_url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = temp_url;
        link.download = fileName;
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
  // HandleConversationSand
  const handleSend = async () => {
    if (inputText.trim() !== "") {
      const newMessages = [...messages, { sender: "User", text: inputText }];
      setMessages(newMessages);
      setInputText("");
      setLoading(true);
      try {
        const response = await fetch(url + "/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: inputText }),
        });
        const responseData = await response.json();
        const data = responseData.body;
        console.log(data);
        if (data.errorMessage) {
          setMessages([
            ...newMessages,
            { sender: "System", text: "Error occur " + data.errorMessage },
          ]);
        } else {
          if (data.s3_object_name) {
            setImageUrl(
              baseurl + "/diagram-as-code-output/" + data.s3_object_name
            );
            setMessages([
              ...newMessages,
              { sender: "System", text: data.AIMessage },
            ]);
          } else {
            setMessages([
              ...newMessages,
              { sender: "System", text: "no image fetch" + data.AIMessage },
            ]);
          }
        }
      } catch (error) {
        setMessages([
          ...newMessages,
          { sender: "System", text: "Error: Failed to fetch response." },
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
  if (submitted) {
    return (
      <div className="App">
        <CSSTransition
          in={submitted}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <div className="survey-result-container">
            <h1>感謝您完成調查！</h1>
            {apiResponse ? (
              apiResponse.errorMessage ? (
                <>
                  <p className="error-message">{apiResponse.errorMessage}</p>
                </>
              ) : (
                <>
                  <h2>恭喜!，您的架構圖如下</h2>
                  {apiResponse.s3_object_name ? (
                    <>
                      <div className="button-container">
                        <button onClick={handleSaveFile}>Save File</button>
                        <button onClick={handleModifyPromptClick}>
                          Modity Prompt
                        </button>
                      </div>

                      <div className=".survey-result-content">
                        <div className="survey-image-container">
                          <img
                            src={imageUrl}
                            alt="Survey Result"
                            className="survey-image"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="error-message">圖片解析失敗</p>
                  )}
                </>
              )
            ) : (
              <p>您的架構圖正在產生</p>
            )}
          </div>
        </CSSTransition>
        {showSaveDialog && (
          <div className="save-dialog">
            <div className="save-dialog-content">
              <h3>Save File</h3>
              <input
                type="text"
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
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
            <h3>Modify Your Prompt</h3>
            <div className="dialog-content">
              <div className="dialog-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`dialog-message ${msg.sender.toLowerCase()}`}
                  >
                    <img
                      src={msg.sender === "User" ? userImg : systemImg}
                      alt={`${msg.sender}Img`}
                      className="avatar"
                    />
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                ))}
                {loading && (
                  <div className="thinking-dialog">
                    <div className="message-content">
                      <img src={systemImg} alt={systemImg} className="avatar" />
                      <strong>System:</strong>{" "}
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
              </div>
              <textarea
                placeholder="Enter your new prompt here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>
              <div className="dialog-buttons">
                <button onClick={handleSend}>Send</button>
                <button onClick={() => setShowDialog(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentCategory = survey[currentCategoryIndex];
  return (
    <div className="survey-container" ref={surveyContainerRef}>
      <h1>雲端架構圖服務調查</h1>
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
            <h2>
              {currentCategoryIndex + 1}.{currentCategory.category}
            </h2>
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
          <button className="next-button" onClick={handleNext}>
            下一頁
          </button>
        ) : (
          <button className="submit-button" onClick={handleSubmit}>
            提交問卷
          </button>
        )}
      </div>
    </div>
  );
}

export default SurveyDisplay;
