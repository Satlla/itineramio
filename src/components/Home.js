import React from 'react';
import { Link } from 'react-router-dom';
import '../css/dashboard.css';
import FilterSubnav from './FilterSubnav';
import Listings from './Listings';
function Home() {
  return (
    <div className="dashboard">

      <FilterSubnav />
      <Listings />



    </div>

  )
}

export default Home
