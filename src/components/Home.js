import React from 'react';
import '../css/dashboard.css';
import FilterSubnav from './FilterSubnav';
import Listings from './Listings';
import MainBanner from '../components/MainBanner';
import Bullets from '../components/Bullets';
import Discover from '../components/Discover';



function Home() {
  return (
    <div className="dashboard">
      < MainBanner />
      <FilterSubnav />
      <Listings />
      <Bullets />
      <Discover />

    </div>

  )
}

export default Home
