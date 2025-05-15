import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ref, push, get, update } from "firebase/database";
import { database } from "./firebase";

const ExchangeForm = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const amount = query.get("amount");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [upi, setUpi] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [username, setUsername] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const pointMap = {
    50: 10,
    100: 20000,
    250: 50000,
    500: 100000,
    1000: 200000,
    1500: 300000,
  };
  const requiredPoints = pointMap[amount] || 0;

  useEffect(() => {
    const loggedInUser = localStorage.getItem("username");
    if (loggedInUser) {
      setUsername(loggedInUser);
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    const userRef = ref(database, `users/${username}`);
    get(userRef).then((snapshot) => {
      const data = snapshot.val();
      setTotalPoints(data?.points || 0);
    });
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalPoints < requiredPoints) {
      setPopupMessage("Insufficient Points to exchange this amount.");
      setShowPopup(true);
      return;
    }

    try {
      const paymentRef = ref(database, `payments`);
      await push(paymentRef, {
        username,
        name,
        mobile,
        upi,
        amount,
        status: "In Progress",
        timestamp: new Date().toISOString(),
      });

      const userRef = ref(database, `users/${username}`);
      await update(userRef, {
        points: totalPoints - requiredPoints,
      });

      setPopupMessage(
        "Order Successful! You will receive money in 3 working days."
      );
      setShowPopup(true);
    } catch (error) {
      setPopupMessage("Error: " + error.message);
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    if (popupMessage.startsWith("Order Successful")) {
      navigate("/transactions");
    }
  };

  return (
    <div className="exchange-form-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/exchange")}>
          ←
        </button>
        <h2>Withdraw ₹{amount}</h2>
      </div>

      <h2 style={{ textAlign: "center", margin: "15px" }}>
        Total Points: {totalPoints}
      </h2>
      <h3 style={{ textAlign: "center", margin: "0" }}>
        Required Points: {requiredPoints}
      </h3>

      <form className="exchange-form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        <label>Mobile Number</label>
        <input
          type="tel"
          required
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Enter mobile number"
        />

        <label>UPI ID</label>
        <input
          type="text"
          required
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
          placeholder="Enter UPI ID"
        />

        <button type="submit">Submit</button>
      </form>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>{popupMessage.startsWith("Error") ? "Error" : "Info"}</h3>
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

export default ExchangeForm;
