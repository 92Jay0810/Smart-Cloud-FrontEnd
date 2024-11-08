import React, { useState, useEffect } from "react";
import "./Login.css";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
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

const AWSLogin = ({ onLogin, RefreshTokenCheckTrigger }) => {
  const [isEmailLogin, setIsEmailLogin] = useState(false); // 是否使用emails
  const [identifier, setIdentifier] = useState(""); // 儲存usrname or email
  const [password, setPassword] = useState("");

  //Session Expiration Related
  const [showModal, setShowModal] = useState(true);

  const handleSessionExpiration = () => {
    // 清除所有相關的存儲和狀態
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");

    //Old Version of Session Expiration
    alert("Your session has expired (4 hours). Please log in again.");
    window.location.reload();
    //New Version
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const checkSession = () => {
      const accessToken = localStorage.getItem("accessToken");
      const idToken = localStorage.getItem("idToken");

      if (accessToken && idToken) {
        const decodedToken = jwtDecode(idToken);
        const currentTime = Math.floor(Date.now() / 1000); // 當前時間（秒）

        // 檢查 idToken 的 exp（過期時間）是否已過
        if (decodedToken.exp <= currentTime) {
          handleSessionExpiration();
        }
      }
    };

    // 畫面載入時自動刷新
    checkSession();
  }, [handleSessionExpiration, RefreshTokenCheckTrigger]);

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

        console.log("accessToken：", accessToken);
        console.log("idToken：", IdToken);

        // 儲存初始登入時間
        const loginTime = Date.now();
        localStorage.setItem("loginTime", loginTime.toString());

        // 将 Access Token 存储在 localStorage 中
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("IdToken", IdToken);
        localStorage.setItem("refreshToken", refreshToken);

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
      {showModal && (
        <>
          {/* 背景遮罩 */}
          <div className="modal_overlay" onClick={closeModal}></div>
          <div className="modal">
            <div className="modal_content">
              <p>The session token has expired, please try to login again.</p>
              <button className="buttons" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
      ;
    </div>
  );
};

export default AWSLogin;
