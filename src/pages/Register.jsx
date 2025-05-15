import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, get, set } from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

// Disposable email domain blacklist
const blacklistedDomains = [
  "tempmail.com",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "fakeinbox.com",
  "maildrop.cc",
  "getnada.com",
  "yopmail.com",
];

const Register = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    username: "",
    password: "",
  });

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showPopupMsg = (msg) => {
    setPopupMessage(msg);
    setShowPopup(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if email is disposable
  const isDisposableEmail = async (email) => {
    const domain = email.split("@")[1]?.toLowerCase();

    if (!domain) return true;
    if (blacklistedDomains.includes(domain)) return true;

    try {
      const response = await fetch(
        `https://disposable.debounce.io/?email=${email}`
      );
      const data = await response.json();
      return data.disposable === "true";
    } catch (err) {
      console.warn("Disposable email check failed, allowing as fallback.");
      return false; // Fail-safe
    }
  };

  const handleRegister = async () => {
    const { name, email, mobile, username, password } = formData;

    if (!name || !email || !mobile || !username || !password) {
      showPopupMsg("Please fill all the fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(email)) {
      showPopupMsg("Invalid email address");
      return;
    }

    if (!mobileRegex.test(mobile)) {
      showPopupMsg("Invalid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);

    // Check for disposable email
    const isDisposable = await isDisposableEmail(email);
    if (isDisposable) {
      showPopupMsg("Disposable/temporary email addresses are not allowed.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if username already exists
      const userRef = ref(database, "users/" + username);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        showPopupMsg("Username already exists");
        setIsSubmitting(false);
        return;
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);

      // Save user in Realtime Database
      await set(userRef, {
        name,
        email,
        mobile,
        username,
        password,
        emailVerified: false,
        points: 0,
        referredBy: null,
        referralUsed: false,
      });

      showPopupMsg("Verification email sent! Please verify your email.");
    } catch (err) {
      // Check Firebase Auth error codes
      if (err.code === "auth/email-already-in-use") {
        showPopupMsg("Email is already in use. Please try logging in.");
      } else if (err.code === "auth/weak-password") {
        showPopupMsg("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        showPopupMsg("Invalid email format.");
      } else {
        showPopupMsg("Registration failed: " + err.message);
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    if (popupMessage.includes("verify")) {
      navigate("/login");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Enter Below Details</h2>
      <div className="register-form">
        <label className="input-label">Name :</label>
        <input
          name="name"
          type="text"
          className="input-field"
          value={formData.name}
          onChange={handleChange}
        />
        <label className="input-label">Email :</label>
        <input
          name="email"
          type="email"
          className="input-field"
          value={formData.email}
          onChange={handleChange}
        />
        <label className="input-label">Mobile :</label>
        <input
          name="mobile"
          type="text"
          className="input-field"
          value={formData.mobile}
          onChange={handleChange}
        />
        <label className="input-label">Username :</label>
        <input
          name="username"
          type="text"
          className="input-field"
          value={formData.username}
          onChange={handleChange}
        />
        <label className="input-label">Password :</label>
        <input
          name="password"
          type="password"
          className="input-field"
          value={formData.password}
          onChange={handleChange}
        />
        <h3 style={{ margin: "0" }}>Please remember the password</h3>
        <button
          className="register-button"
          onClick={handleRegister}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        <div className="login-redirect">
          Already Registered?{" "}
          <span className="login-link" onClick={() => navigate("/login")}>
            Login
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

export default Register;
