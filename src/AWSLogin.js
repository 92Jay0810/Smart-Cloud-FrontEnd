import React, { useState } from "react";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signIn = (event) => {
    event.preventDefault();
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        console.log("Successfully logged in");
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
        <h2>AWS Cogonito登陸介面</h2>
        <h3>請先在Cogonito user pool建立使用者</h3>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
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
