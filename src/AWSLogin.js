import React, { useState } from "react";
import "./Login.css";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoRefreshToken,
} from "amazon-cognito-identity-js";

//csd-lab

// const poolData = {
//   UserPoolId: "ap-southeast-1_zPbHgCBA9",
//   ClientId: "71u7r00hbo6o2c6vu40h92sln7",
// };

// csd-ca-lab

const poolData = {
  UserPoolId: "ap-northeast-1_oplJt9drv",
  ClientId: "22cin8r8mik6i94mln9385iegs",
};

const userPool = new CognitoUserPool(poolData);

const AWSLogin = ({ onLogin }) => {
  const [isEmailLogin, setIsEmailLogin] = useState(false); // 是否使用emails
  const [identifier, setIdentifier] = useState(""); // 儲存usrname or email
  const [password, setPassword] = useState("");
  const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  const REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes in milliseconds
  const signIn = (event) => {
    event.preventDefault();
    const authenticationDetails = new AuthenticationDetails({
      Username: identifier,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: identifier,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        console.log("Successfully logged in");
        // 获取 Access Token
        const accessToken = result.getAccessToken().getJwtToken();
        const IdToken = result.getIdToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();

        console.log("accessToken：", accessToken);
        console.log("idToken：", IdToken);
        console.log("refreshToken：", refreshToken);

        // 儲存初始登入時間
        const loginTime = Date.now();
        localStorage.setItem("loginTime", loginTime.toString());

        // 将 Access Token 存储在 localStorage 中
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("IdToken", IdToken);
        localStorage.setItem("refreshToken", refreshToken);

        // 設置自動刷新
        const refreshInterval = setInterval(() => {
          const currentTime = Date.now();
          const initialLoginTime = parseInt(
            localStorage.getItem("loginTime") || "0"
          );
          const timeElapsed = currentTime - initialLoginTime;

          // 檢查是否在4小時session內
          if (timeElapsed < SESSION_DURATION) {
            refreshSession(cognitoUser);
          } else {
            // 4小時到期，清除所有狀態
            clearInterval(refreshInterval);
            handleSessionExpiration();
          }
        }, REFRESH_INTERVAL);

        // 儲存interval ID以便之後清除
        localStorage.setItem("refreshIntervalId", refreshInterval.toString());

        // 在這裡處理成功登錄後的邏輯，例如重定向到主頁
        onLogin();
      },
      onFailure: (err) => {
        console.error("Failed to login", err);
        if (err.name === "NotAuthorizedException") {
          alert("Incorrect username or password. Please try again.");
        } else if (err.name === "UserNotFoundException") {
          alert("This user does not exist. Please check your username.");
        } else {
          alert("An error occurred: " + (err.message || JSON.stringify(err)));
        }
      },
    });
  };
  //刷新token使用的function
  const refreshSession = (cognitoUser) => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    cognitoUser.refreshSession(
      new CognitoRefreshToken({ RefreshToken: refreshToken }),
      (err, session) => {
        if (err) {
          console.error("Failed to refresh session", err);
          return;
        }

        const newAccessToken = session.getAccessToken().getJwtToken();
        const newIdToken = session.getIdToken().getJwtToken();

        // 更新 tokens 和 refreshCount
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("idToken", newIdToken);

        console.log("Token refreshed successfully");
      }
    );
  };
  const handleSessionExpiration = () => {
    // 清除所有相關的存儲和狀態
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loginTime");

    const intervalId = localStorage.getItem("refreshIntervalId");
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      localStorage.removeItem("refreshIntervalId");
    }

    alert("Your session has expired (4 hours). Please log in again.");
    window.location.reload();
  };
  return (
    <div className="login-container">
      <form onSubmit={signIn}>
        <h1>AWS Cognito Login</h1>
        <p>Please create user in Cognito user pool before login</p>
        <h3>Choose a Login identifier</h3>
        <div className="button-group">
          <button
            type="button"
            className={!isEmailLogin ? "active" : ""}
            onClick={() => setIsEmailLogin(false)}
          >
            Username
          </button>
          <button
            type="button"
            className={isEmailLogin ? "active" : ""}
            onClick={() => setIsEmailLogin(true)}
          >
            Email
          </button>
        </div>
        <input
          type={isEmailLogin ? "email" : "text"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={isEmailLogin ? "Email" : "Username"}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default AWSLogin;
