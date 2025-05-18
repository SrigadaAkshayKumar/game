import React, { useState, useEffect } from "react";
import BottomNav from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

const Exchange = () => {
  const options = [50, 100, 250, 500, 1000, 1500];
  const point = [10, 20000, 50000, 100000, 200000, 300000]; // corrected last value to 300000
  const navigate = useNavigate();

  const [totalPoints, setTotalPoints] = useState(0);
  const [username, setUsername] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Get username from localStorage (or Firebase Auth in real app)
  useEffect(() => {
    const loggedInUser = localStorage.getItem("username");
    if (loggedInUser) {
      setUsername(loggedInUser);
    }
  }, []);

  // Realtime points sync from Firebase
  useEffect(() => {
    if (!username) return;
    const userRef = ref(database, `users/${username}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setTotalPoints(data?.points || 0);
    });

    return () => unsubscribe();
  }, [username]);

  const handleSelectAmount = (amount, requiredPoints) => {
    if (totalPoints < requiredPoints) {
      setShowAlert(true);
    } else {
      navigate(`/exchange/form?amount=${amount}`);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  return (
    <div className="exchange-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Withdraw</h2>
      </div>
      <h3>Total Points: {totalPoints}</h3>
      <h1>Select Amount Here</h1>

      <div className="exchange-grid">
        {options.map((amount, idx) => (
          <div key={idx} className="exchange-card">
            <p>
              {point[idx]} <br />
              Points
            </p>
            <button
              className="exchange-button"
              onClick={() => handleSelectAmount(amount, point[idx])}
            >
              {amount} Rs
            </button>
          </div>
        ))}
      </div>

      {showAlert && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Insufficient Points!</h3>
            <p>You need more points to withdraw this amount.</p>
            <button className="collect-btn" onClick={closeAlert}>
              OK
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Exchange;
