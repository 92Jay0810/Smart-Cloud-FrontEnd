import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./Login.css";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "ap-southeast-1_zPbHgCBA9",
  ClientId: "71u7r00hbo6o2c6vu40h92sln7",
};

const userPool = new CognitoUserPool(poolData);

const AWSLogin = ({ onLogin }) => {
  const [isEmailLogin, setIsEmailLogin] = useState(false); // 是否使用emails
  const [identifier, setIdentifier] = useState(""); // 儲存usrname or email
  const [password, setPassword] = useState("");

  // 检查是否存在有效的 access token 並且去做自動登陸
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; //換算成秒

        if (decodedToken.exp > currentTime) {
          // Token有效，可以自動登陸
          onLogin();
        } else {
          // Token過期，直接移除。
          localStorage.removeItem("accessToken");
          alert("Session expired, please log in again.");
        }
      } catch (error) {
        console.error("Failed to decode token", error);
        localStorage.removeItem("accessToken");
      }
    }
  }, [onLogin]);

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
        console.log("accessToken：" + accessToken);
        // 将 Access Token 存储在 localStorage 中
        localStorage.setItem("accessToken", accessToken);
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
        <h1>AWS Cogonito Login</h1>
        <p>please create user in Cogonito user pool before login</p>
        <h3>choose a Login identifier</h3>
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
