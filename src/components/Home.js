import React from "react";
import "../css/dashboard.css";
import FilterSubnav from "./FilterSubnav";
import MainBanner from "../components/MainBanner";
import Bullets from "../components/Bullets";
import Discover from "../components/Discover";
import Top from "../components/Top";
import Header from '../components/Header';


function Home() {
  return (
    <div className="dashboard">
       <Header />
      <MainBanner />
      <Top />
      <Bullets />
      <Discover />
    </div>
  );
}

export default Home;
