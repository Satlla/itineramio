import React from 'react';
import bg from '../assets/backgrounds/background.jpg';
import '../css/components/mainbanner.css';

function MainBanner() {
  return (
    <div className="banner-container mb-4">


      <img className="bannerimage" src={ bg } alt="itineramio" />
    </div>
  )
}

export default MainBanner
