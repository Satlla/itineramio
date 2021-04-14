import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AddListing from "../components/AddListing";
import HeaderTransparent from "../components/HeaderTransparent";
import InformationListing from "../components/InformationListing";
import NavDashboard from "../components/NavDashboard";
import UserListings from "../components/UserListings";
import '../css/components/dashboard.css'
import profile from '../assets/profiles/alex.jpg'

function Dashboard() {
  return (
    <div>
      <HeaderTransparent />

      <div className="orbital__panel_dashboard">

        <div className="main__panel">
      <NavDashboard />
    <div className="profile__card" >

      <img src={profile} className="profile-img mb-2" alt="alex"></img>
        <h4 className="dear"> Buenas noches, Alejandro</h4>
    </div>
      <InformationListing />
      <AddListing />
        </div>

      </div>

    </div>
  );
}

export default Dashboard;

