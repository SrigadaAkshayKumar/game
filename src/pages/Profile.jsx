import React, { useEffect, useState } from "react";
import AdBanner from "../components/Adbanner";
import BottomNav from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, get, set } from "firebase/database";

const Popup = ({ message, onClose, title = "Info" }) => {
  if (!message) return null;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>{title}</h3>
        <p>{message}</p>
        <button className="collect-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [referralInput, setReferralInput] = useState("");
  const [referralStatus, setReferralStatus] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const username = localStorage.getItem("username");

    if (!storedUser || !username) {
      setShowPopup(true);
      setEmailVerified(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchUserData = async () => {
      try {
        const userRef = ref(database, "users/" + username);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          if (!data.emailVerified) {
            setShowPopup(true);
            setEmailVerified(false);
          } else {
            setEmailVerified(true);
            setPoints(data.points || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleReferralSubmit = async () => {
    if (!referralInput) {
      setReferralStatus("Enter a referral username.");
      return;
    }

    const currentUsername = localStorage.getItem("username");
    if (referralInput === currentUsername) {
      setReferralStatus("You can't refer yourself.");
      return;
    }

    const currentRef = ref(database, "users/" + currentUsername);
    const referredRef = ref(database, "users/" + referralInput);

    const [currentSnap, referredSnap] = await Promise.all([
      get(currentRef),
      get(referredRef),
    ]);

    if (!currentSnap.exists() || !referredSnap.exists()) {
      setReferralStatus("Invalid referral code.");
      return;
    }

    const currentData = currentSnap.val();
    if (currentData.referralUsed) {
      setReferralStatus("You have already used a referral code.");
      return;
    }

    const referrerData = referredSnap.val();

    await set(currentRef, {
      ...currentData,
      referredBy: referralInput,
      referralUsed: true,
      points: (currentData.points || 0) + 1000,
    });

    await set(referredRef, {
      ...referrerData,
      points: (referrerData.points || 0) + 1000,
    });

    setReferralStatus("Referral successful! You both earned 1000 points.");
    setPoints((currentData.points || 0) + 1000);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/verifyemail"); // Go to verification page
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };

  if (!user)
    return (
      <>
        <Popup message="Please login first!" onClose={handlePopupClose} />
      </>
    );

  return (
    <div className="profile-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Profile</h2>
      </div>
      <AdBanner slot="profile" />
      <div className="profile-content">
        <div className="profile-card">
          <h2 className="profile-name">{user.name || "N/A"}</h2>
          <p className="profile-email">{user.email || "N/A"}</p>
          <p className="profile-mobile">{user.mobile || "N/A"}</p>
          <hr style={{ margin: "10px 0" }} />
          <p className="profile-points">Total Points: {points}</p>
          <p className="profile-earning">
            Earnings: ₹{(points / 200).toFixed(2)}
          </p>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="logout-button"
            onClick={() => navigate("/transactions")}
          >
            View Transaction History
          </button>

          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="Enter referral code (username)"
              className="input-field"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value)}
              disabled={!emailVerified}
            />
            <button
              className="register-button"
              onClick={handleReferralSubmit}
              disabled={!emailVerified}
            >
              Submit Referral
            </button>
            {referralStatus && (
              <p style={{ marginTop: "10px" }}>{referralStatus}</p>
            )}
            {!emailVerified && (
              <p style={{ color: "red", marginTop: "10px" }}>
                You must verify your email to submit a referral code.
              </p>
            )}
          </div>
        </div>

        <BottomNav />
      </div>

      {showPopup && (
        <Popup
          message="Please verify your email first!"
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
};

export default Profile;
