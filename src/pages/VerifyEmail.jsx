import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import { database } from "./firebase";
import { ref, get, set } from "firebase/database";
import Navbar from "../components/Navbar";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [rewardGiven, setRewardGiven] = useState(false);

  useEffect(() => {
    const checkAndSyncVerification = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      await reload(auth.currentUser);
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      setIsVerified(updatedUser.emailVerified);

      if (updatedUser.emailVerified) {
        const username = localStorage.getItem("username");
        if (username) {
          const userRef = ref(database, "users/" + username);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            await set(userRef, {
              ...userData,
              emailVerified: true,
            });
          }
        }

        setMessage("Email verified successfully!");
        await giveReferralReward();
        setTimeout(() => navigate("/profile"), 2000);
      }
    };

    checkAndSyncVerification();
  }, [navigate]);

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification(user);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error) {
      setMessage("Error sending email: " + error.message);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      await reload(user);
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      setIsVerified(updatedUser.emailVerified);

      if (updatedUser.emailVerified) {
        const username = localStorage.getItem("username");
        if (username) {
          const userRef = ref(database, "users/" + username);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            await set(userRef, {
              ...userData,
              emailVerified: true,
            });
          }
        }

        setMessage("Email verified successfully!");
        await giveReferralReward();
        setTimeout(() => navigate("/profile"), 2000);
      } else {
        setMessage(
          "Email is still not verified. Please check and refresh again."
        );
      }
    } catch (error) {
      setMessage("Failed to refresh status: " + error.message);
    }
  };

  const giveReferralReward = async () => {
    if (rewardGiven) return;

    const username = localStorage.getItem("username");
    if (!username) return;

    const userRef = ref(database, "users/" + username);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      const referredBy = userData.referredBy;

      if (referredBy) {
        const referrerRef = ref(database, "users/" + referredBy);
        const referrerSnapshot = await get(referrerRef);

        if (referrerSnapshot.exists()) {
          const referrerData = referrerSnapshot.val();
          const currentPoints = referrerData.points || 0;

          await set(referrerRef, {
            ...referrerData,
            points: currentPoints + 1000,
          });

          setMessage((prev) => prev + " Referrer rewarded 1000 points!");
          setRewardGiven(true);
        }
      }
    }
  };

  return (
    <div className="verify-container">
      <h2>Email Verification</h2>
      <p>
        {isVerified
          ? "Your email is verified ✅"
          : "We have sent a mail to you Please verify your email address."}
      </p>

      {!isVerified && (
        <div className="verify-actions">
          <button className="verify-btn" onClick={handleSendVerification}>
            Send Verification Email Again
          </button>
          <button className="verify-btn" onClick={handleRefreshStatus}>
            Refresh Verification Status
          </button>
        </div>
      )}

      {message && (
        <div className="info-message">
          <p>{message}</p>
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default VerifyEmail;
