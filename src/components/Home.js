import React from 'react';
import '../css/dashboard.css';
import FilterSubnav from './FilterSubnav';
import Listings from './Listings';
import MainBanner from '../components/MainBanner';



function Home() {
  return (
    <div className="dashboard">
      < MainBanner />
      <FilterSubnav />
      <Listings title=" Recomendados"  />

    </div>

  )
}

export default Home
