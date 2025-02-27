import ProgressBar from "@ramonak/react-progress-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./App.css";
import { v4 as uuidv4 } from "uuid";

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

function Survey({ username, user_id, onSubmit }) {
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
    // 清除相關的 cookie
    setCookie("survey_answers", "", -1);
    // 重置其他相關狀態
    setAnswers({});
    setCurrentCategoryIndex(0);
  }, []);

  //service
  const [answers, setAnswers] = useState(() => {
    const savedAnswers = getCookie("survey_answers");

    return savedAnswers ? JSON.parse(savedAnswers) : {};
  }, []);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const categoryRefs = useRef(survey.map(() => React.createRef()));
  const surveyContainerRef = useRef(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // 服務確認頁面
  // 更新 cookie 的函數
  const updateCookies = () => {
    setCookie("survey_answers", JSON.stringify(answers));
  };

  // 在狀態更新時更新 cookie
  useEffect(() => {
    updateCookies();
  }, [answers]);

  //處理選擇選項
  const handleOptionSelect = (categoryIndex, questionIndex, optionIndex) => {
    const newAnswers = {
      ...answers,
      [`${categoryIndex}-${questionIndex}`]: optionIndex,
    };
    setAnswers(newAnswers);
    // 將新的答案保存到 cookie 中
    setCookie("survey_answers", JSON.stringify(newAnswers), 7); // 保存 7 天
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
    const totalQuestions = survey.reduce(
      (sum, category) => sum + category.questions.length,
      0
    );
    if (Object.keys(answers).length === totalQuestions) {
      console.log("提交的答案：", answers);
      let TransformAsnwers = transformAnswers(answers);
      const newSessionId = uuidv4();
      console.log("New Session ID generated:", newSessionId);
      const SubmitAnswers = {
        query: TransformAsnwers,
        session_id: newSessionId,
        user_id: user_id,
        tool: TransformAsnwers["5-0"],
      };
      const platformValue = TransformAsnwers["0-0"];
      const toolValue = TransformAsnwers["5-0"];
      console.log("傳送格式:\n", SubmitAnswers);
      resetSurvey();
      onSubmit(SubmitAnswers, toolValue, platformValue, newSessionId);
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

  const currentCategory = survey[currentCategoryIndex];
  //算進度條進度
  const totalQuestions = survey.reduce(
    (sum, category) => sum + category.questions.length,
    0
  );
  const answeredQuestions = Object.keys(answers).length;
  // 計算進度百分比
  const progressPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );
  return (
    <div className="survey-container" ref={surveyContainerRef}>
      <h1>Hi {username}! 歡迎使用一般模式!</h1>
      <h2>
        以下問卷內容將分為 6
        個部分，雲端平台、網路、運算、資料庫、儲存、繪圖工具。
        <br />
        請依照指示完成要求，我們將為您設計客製化的雲端架構圖。
      </h2>
      <div className="progress-bar-container">
        <ProgressBar
          completed={progressPercentage}
          bgColor="#10b981"
          labelColor="#ffffff"
          height="8px"
          width="100%" // 确保进度条使用容器的宽度
          labelSize="12px"
          maxCompleted={100}
          labelClassName="hidden-label"
        />
        <span className="progress-percentage">{progressPercentage}%</span>
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

export default Survey;
