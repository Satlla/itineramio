import React from 'react';
import '../css/dashboard.css';
import FilterSubnav from './FilterSubnav';
import Listings from './Listings';
import MainBanner from '../components/MainBanner';
import Bullets from '../components/Bullets';



function Home() {
  return (
    <div className="dashboard">
      < MainBanner />
      <FilterSubnav />
      <Listings />
      <Bullets />

    </div>

  )
}

export default Home
