import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import WatchAds from "./pages/WatchAds";
import PlayAndEarn from "./pages/PlayAndEarn";
import SpinAndWin from "./pages/SpinAndWin";
import Profile from "./pages/Profile";
import Exchange from "./pages/Exchange";
import Invite from "./pages/Invite";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ExchangeForm from "./pages/ExchangeForm";
import TransactionHistory from "./pages/TransactionHistory";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/watchads" element={<WatchAds />} />
        <Route path="/playandearn" element={<PlayAndEarn />} />
        <Route path="/spinandwin" element={<SpinAndWin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/exchange/form" element={<ExchangeForm />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />
      </Routes>
    </Router>
  );
}

export default App;
