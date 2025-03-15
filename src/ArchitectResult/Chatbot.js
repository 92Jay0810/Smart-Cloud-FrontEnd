import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import close from "../assets/grey close.png";
import systemImg from "../assets/system.jpeg";
import userImg from "../assets/user.jpg";
import "../App.css";
import { AppContext } from "../Context/AppContext";
function Chatbot({ handle_message }) {
  const { apiResponseReceived, messages } = useContext(AppContext);
  // 重置函數,一進來就reset
  useEffect(() => {
    // 重置其他相關狀態
    setInputText("");
    setLoading(false);
    setShowDialog(false);
  }, []);
  // 重置函數
  const resetSurvey = useCallback(() => {
    // 重置其他相關狀態
    setInputText("");
    setLoading(false);
    setShowDialog(false);
  }, []);

  //ConversationDialog
  const [showDialog, setShowDialog] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 當message改變滑動到指定參考位置
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setInputText("");
      setLoading(true);
      //不管dac、drawio，API都在ArchitectResult處理
      handle_message(inputText); // Send the message to ArchitectResult
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowDialog(true);
  }, [apiResponseReceived]);

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
      handleSendMessage();
      //handleSend(false); // 執行送出訊息的函數
      setInputText("");
    }
  };

  return (
    <div>
      {apiResponseReceived && showDialog && (
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
                      alt={`${msg.sender === "System" ? "System" : "User"}Img`}
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
                    <img src={systemImg} alt={`SystemImg`} className="avatar" />
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
              <button onClick={() => handleSendMessage()}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                  ></path>
                </svg>
              </button>
            </div>
            <p className="warning">AI可能會犯錯。請多次嘗試並仔細查看結果。</p>
          </div>
        </div>
      )}
      {!showDialog && (
        <button
          className="chatbot-open-button"
          onClick={() => setShowDialog(true)}
        >
          <img src={systemImg} alt="Chat" />
        </button>
      )}
    </div>
  );
}

export default Chatbot;
