import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Invite = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      navigate("/login"); // Redirect if not logged in
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const referralLink = `${window.location.origin}/register?ref=${username}`;

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(
      `Check out this awesome app: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    if (!username) {
      setPopupMessage("Please login first to generate your referral link.");
      setShowPopup(true);
      return;
    }

    navigator.clipboard.writeText(referralLink);
    setPopupMessage("Referral link copied to clipboard!");
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="invite-container">
      {/* Header */}
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Invite & Earn</h2>
      </div>

      {/* Referral Code Display */}
      <div className="referral-code-box">
        <h3>Referral Code:</h3>
        <p className="referral-code">{username}</p>
      </div>

      {/* Invite Actions */}
      <div className="invite-buttons">
        <button className="invite-button" onClick={handleShareWhatsapp}>
          Share via WhatsApp
        </button>
        <button className="invite-button" onClick={handleCopyLink}>
          Copy Link
        </button>
      </div>
      {/* Bottom Navigation */}
      <Navbar />

      {/* Popup Message */}
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

export default Invite;
