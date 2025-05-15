import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, get } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const handleLogin = async () => {
    const { username, password } = credentials;

    if (!username || !password) {
      showPopupMessage("Please enter both username/email and password");
      return;
    }

    try {
      if (username.includes("@")) {
        // Login with email
        const userCred = await signInWithEmailAndPassword(
          auth,
          username,
          password
        );
        const email = userCred.user.email;

        // 🔍 Find matching username in DB
        const usersRef = ref(database, "users");
        const snapshot = await get(usersRef);
        let actualUsername = null;
        snapshot.forEach((child) => {
          if (child.val().email === email) {
            actualUsername = child.key;
          }
        });

        if (!actualUsername) {
          showPopupMessage("User data not found in database.");
          return;
        }

        const userData = snapshot.val()[actualUsername];
        localStorage.setItem("username", actualUsername); // ✅ store username
        localStorage.setItem("user", JSON.stringify(userData));
        showPopupMessage("Login successful!");
      } else {
        // Login with username
        const userRef = ref(database, "users/" + username);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          showPopupMessage("User not found!");
          return;
        }

        const userData = snapshot.val();
        if (userData.password !== password) {
          showPopupMessage("Incorrect password");
          return;
        }

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("username", username);
        showPopupMessage("Login successful!");
      }
    } catch (error) {
      showPopupMessage("Login failed: " + error.message);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    if (popupMessage === "Login successful!") navigate("/");
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <div className="login-form">
        <label className="input-label">Username or Email:</label>
        <input
          name="username"
          type="text"
          className="input-field"
          value={credentials.username}
          onChange={handleChange}
        />
        <label className="input-label">Password:</label>
        <input
          name="password"
          type="password"
          className="input-field"
          value={credentials.password}
          onChange={handleChange}
        />
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
        <div className="register-redirect">
          Don't have an account?{" "}
          <span className="register-link" onClick={() => navigate("/register")}>
            Register
          </span>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Info</h3>
            <p>{popupMessage}</p>
            <button className="collect-btn" onClick={handleClosePopup}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
