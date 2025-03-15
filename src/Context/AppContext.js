import React, { createContext, useState, useEffect, useCallback } from "react";

// 創建一個 Context
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ArchitectResult底下  統一在這重製
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
  const [diagramXml, setDiagramXml] = useState(() => {
    const savedDiagram = localStorage.getItem("diagramXml");
    return savedDiagram || false;
  });

  //不用寫進cookie的變數
  const [showDialog, setShowDialog] = useState(false);
  //有收到api 就打開對話框
  useEffect(() => {
    setShowDialog(true);
  }, [apiResponseReceived]);

  // 更新 cookie 的函數
  const updateCookies = () => {
    setCookie("apiResponseReceived", apiResponseReceived);
    setCookie("error_message", error_message);
    setCookie("imageUrl", imageUrl);
    setCookie("savecode", savecode);
    setCookie("messages", JSON.stringify(messages));
    setCookie("xmlUrl", xmlUrl);
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
    error_message,
    imageUrl,
    savecode,
    xmlUrl,
    messages,
    diagramXml,
  ]);

  const resetArchitectResult = useCallback(() => {
    setApiResponseReceived(false);
    seterror_message("");
    setImageUrl("");
    setsavecode("");
    setXmlUrl("");
    setMessages([]);
    setDiagramXml("");
    // 清除相關的 cookie
    setCookie("apiResponseReceived", "", -1);
    setCookie("error_message", "", -1);
    setCookie("imageUrl", "", -1);
    setCookie("savecode", "", -1);
    setCookie("xmlUrl", "", -1);
    setCookie("messages", "", -1);
    localStorage.removeItem("diagramXml");

    //其他狀態
    setShowDialog(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        apiResponseReceived,
        setApiResponseReceived,
        error_message,
        seterror_message,
        imageUrl,
        setImageUrl,
        savecode,
        setsavecode,
        messages,
        setMessages,
        xmlUrl,
        setXmlUrl,
        diagramXml,
        setDiagramXml,
        resetArchitectResult,
        showDialog,
        setShowDialog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
