import React, { useState, useRef, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./SurveyDisplay.css";

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
  //const url = "https://d1fnvwdkrkz29m.cloudfront.net/api/diagram-as-code";
  const url = "http://localhost:3001";

  const [showDialog, setShowDialog] = useState(false);

  const handleModifyPromptClick = () => {
    setShowDialog(true);
  };

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
  const handleOptionSelect = (categoryIndex, questionIndex, option) => {
    const newAnswers = {
      ...answers,
      [`${categoryIndex}-${questionIndex}`]: option,
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
      const formattedAnswers = transformAnswers(answers);
      console.log("轉換後的答案：", formattedAnswers);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedAnswers),
        });

        const data = await response.json();
        setApiResponse(data);
        // 清除 cookie 中的答案
        //setCookie("surveyAnswers", "", -1);
      } catch (error) {
        console.error("Error submitting survey:", error);
        setApiResponse({ error: "提交失敗，請稍後再試。" });
        // 清除 cookie 中的答案
        //setCookie("surveyAnswers", "", -1);
      }
    } else {
      alert("請回答所有問題後再提交！");
    }
  };

  //將Answers格式轉換，交給後端
  const transformAnswers = (answers) => {
    const result = {};
    const componentMappings = {
      "是否需要用到GPU?": "GPU",
      "資料是否需要快取記憶？": "Cache",
      "資料是否需要高可用配置?": "HighAvailabilityDatabase",
      "系統是否需要使用共享儲存裝置？(如NFS)": "SharedStorage",
      "系統是否有大於1GB的檔案存放(如文件、圖片、影片、音樂)？":
        "LargeFileStorage",
      "儲存是否需高可用配置？": "HighAvailabilityStorage",
      "是否需要硬體安全模組(HSM) ?": "HSM",
      "是否有高安全需求？": "HighSecurity",
      "是否有個資需要額外保護？": "PersonalDataProtection",
      "系統是否公開服務給外部網路(Internet)？": "PublicService",
      "系統是否本身無公開位址(Public IP)，但需要存取到外部網路(Internet)？":
        "NAT",
      "系統是否需要靜態網頁快取(Cache)？": "StaticWebCache",
    };

    const translations = {
      共用VPC: "Shared VPC",
      自建VPC: "Build own VPC",
      雲端DNS服務: "Cloud service",
      自建地端DNS服務: "On-premise service",
      "On-premise": "On-premise",
      GCP: "GCP",
      "AWS/ Other": "AWS/Other",
      Microservices: "Microservices",
      "N-tier": "N-tier",
      eBAF: "eBAF",
      Monolith: "Monolith",
      "服務數量 < 10": "number of cloud services <10",
      "服務數量 > 10": "number of cloud services >10",
      Stateful: "Stateful",
      Stateless: "Stateless",
      PostgreSQL: "PostgreSQL",
      MySQL: "MySQL",
      "MS SQL": "MS SQL",
      NoSQL: "NoSQL",
      "Active/Active": "Active/Active",
      "Active/Standby": "Active/Standby",
    };

    survey.forEach((category, categoryIndex) => {
      //取得前面英文 Category
      const categoryName = category.category.split(" ")[0];
      const components = new Set();

      category.questions.forEach((question, questionIndex) => {
        const answer = answers[`${categoryIndex}-${questionIndex}`];
        if (answer) {
          if (answer === "是" && componentMappings[question.question]) {
            components.add(componentMappings[question.question]);
          } else if (answer !== "否") {
            components.add(translations[answer] || answer);
          }
        }
      });

      if (components.size > 0) {
        result[categoryName] = Array.from(components);
      }
    });

    return result;
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
              apiResponse.errorCode ? (
                <>
                  <p className="error-message">
                    {getErrorMessage(apiResponse.errorCode)}
                  </p>
                  <p>errorCode：{apiResponse.errorCode}</p>
                </>
              ) : (
                <>
                  <h2>恭喜!，您的架構圖如下</h2>
                  {apiResponse.imageSrc ? (
                    <>
                      <div className="button-container">
                        <button>Save File</button>
                        <button onClick={handleModifyPromptClick}>
                          Modity Prompt
                        </button>
                      </div>

                      <div className=".survey-result-content">
                        <div className="survey-image-container">
                          <img
                            src={apiResponse.imageSrc}
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
        {showDialog && (
          <div className="dialog-container">
            <h3>Modify Your Prompt</h3>
            {/* Your dialog content goes here */}
            <textarea placeholder="Enter your new prompt here..."></textarea>
            <button onClick={() => setShowDialog(false)}>Close</button>
          </div>
        )}
      </div>
    );
  }

  function getErrorMessage(errorCode) {
    switch (errorCode) {
      case "101":
        return "用戶登錄錯誤: 請檢查您的用戶名和密碼。";
      case "201":
        return "Bad Request，LLM請求格式錯誤";
      case "202":
        return "Request Timeout， LLM回應時間過長";
      case "301":
        return "編譯錯誤，請再多嘗試，或連繫IT團隊，";
      default:
        return "內部伺服器錯誤: 發生未知錯誤。";
    }
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
                        option
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleOptionSelect(
                          currentCategoryIndex,
                          questionIndex,
                          option
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
