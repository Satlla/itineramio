
import React from "react";
import { Link } from "react-router-dom";
import VideoWashing from  '../assets/videos/washingmachinecasazulvid.mp4';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import '../../styles.css';

function Washingmachinecasazul() {
  window.scrollTo(0, 0);
  return (
    <div>
         <div className="cabecera">
        <Link className="header__whyus" to="/apartments/casazul/faq">
          <ChevronLeftIcon/> volver
        </Link>
      </div>


    <div className="layout__container">
      <div className="video__container">

        <video className="video-item" width="100%" height="100% "  controls >
          <source src={VideoWashing} type="video/mp4"/>
        </video>
      </div>
    </div>
    </div>
  );
}

export default Washingmachinecasazul;