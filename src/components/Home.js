import React from "react";
import "../css/dashboard.css";
import FilterSubnav from "./FilterSubnav";
import Bullets from "../components/Bullets";
import Discover from "../components/Discover";
import Top from "../components/Top";
import HeaderTransparent from '../components/HeaderTransparent';
import Estandares from "./Estandares";
import ExperiencesCarousel from "../components/Experiences/ExperiencesCarousel"



function Home() {
  return (

    <div className="dashboard">
       <HeaderTransparent />
      <Discover />
      <Top />
      <ExperiencesCarousel/>
      <Bullets />
      < Estandares />
    </div>


  );
}

export default Home;
