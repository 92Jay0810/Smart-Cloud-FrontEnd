import React, { useState, useEffect, useCallback } from "react";
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

const AWSLogin = ({ onLogin }) => {
  const [isEmailLogin, setIsEmailLogin] = useState(false); // 是否使用emails
  const [identifier, setIdentifier] = useState(""); // 儲存usrname or email
  const [password, setPassword] = useState("");

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

        // 将 Access Token 存储在 localStorage 中
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("IdToken", IdToken);

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
        <h1>歡迎來到 Smart Archie </h1>
        <p>若無Cognito 帳號，請聯繫smart archie客服團隊</p>
        {/* <p>請使用 AWS Cognito 登入，登入前請在 Cognito 中建立用戶</p> */}
        <h3>請選擇登入方式</h3>
        <div className="button-group">
          <button
            type="button"
            className={!isEmailLogin ? "active" : ""}
            onClick={() => setIsEmailLogin(false)}
          >
            用戶名稱
          </button>
          <button
            type="button"
            className={isEmailLogin ? "active" : ""}
            onClick={() => setIsEmailLogin(true)}
          >
            Email地址
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
        <button type="submit">登入</button>
      </form>
      
    </div>
  );
};

export default AWSLogin;
