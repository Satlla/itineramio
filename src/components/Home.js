import React from "react";
import "../css/dashboard.css";
import FilterSubnav from "./FilterSubnav";
import Bullets from "../components/Bullets";
import Discover from "../components/Discover";
import Top from "../components/Top";
import HeaderTransparent from '../components/HeaderTransparent';


function Home() {
  return (
    <div className="dashboard">
       <HeaderTransparent />
      <Discover />
      <Top />
      <Bullets />
    </div>
  );
}

export default Home;
