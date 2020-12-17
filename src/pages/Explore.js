import React from "react";
import "../css/dashboard.css";
import FilterSubnav from "../components/FilterSubnav";
import Footer from '../components/Footer';
import Top from "../components/Top";
import HeaderTransparent from '../components/HeaderTransparent';


function Explore() {
  return (
    <div className="dashboard">
       <HeaderTransparent />
      <Top />

    </div>
  );
}

export default Explore;