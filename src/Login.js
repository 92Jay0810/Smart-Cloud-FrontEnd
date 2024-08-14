import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 只要有輸入用戶名稱和密碼即可
    if (username && password) {
      // 設置 cookie，有效期為 1 天
      document.cookie = "loggedIn=true; max-age=86400; path=/";
      onLogin();
    } else {
      alert("請輸入用戶名稱和密碼");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>測試通道</h2>
        <h3>供快速測試使用</h3>
        <input
          type="text"
          placeholder="使用者名稱"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">登入</button>
      </form>
    </div>
  );
}

export default Login;
