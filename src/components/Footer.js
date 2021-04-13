import React from "react";
import { Link } from "react-router-dom";
import "../css/components/footer.css";
import logo from "../logo.png";
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import PinterestIcon from '@material-ui/icons/Pinterest';


function Footer() {
  window.scrollTo(0, 0);


  return (
    <div className="container-footer mt-4 pt-4">
      <div className="cont-left">
        <ul className="footer-list">
          <li className="itineramio-footer">
          <Link className="navbar-brand" to="/">
          <img className="logo" src={logo} alt="" />
          </Link>
          </li>
          <li>
            <p class="what-is">
              Itineramio es una comunidad de personas apasionadas por descubrir
              la infinidad de lugares gastronómicos de imprescindible visita en
              la ciudad de Alicante
            </p>
            <div className="Social-icons mb-4">
              <a className="link__rss" href ="https://www.instagram.com/itineramio/" > <InstagramIcon /> </a>
              <span className="ml-2"> <TwitterIcon /> </span>
              <span className="ml-2" > <FacebookIcon /> </span>
              <span className="ml-2"> <PinterestIcon /> </span>
            </div>
          </li>
        </ul>
      </div>
      <div className="cont-center">
        <ul className="footer-list">
          <p ClassName="footer-list-title"> ACERCA DE</p>
          <li>
            <Link to="/como-funciona">
            <a class="nav-link"> ¿Qué es  Itineramio? </a>

            </Link>
          </li>
          {/* <li>
            <Link to="/plans">
            <a class="nav-link"> ¿Qué es Plans? </a>

            </Link>
          </li> */}
          <li>
            <a class="nav-link" href="#">
              Estándares de calidad
            </a>
          </li>
        </ul>
      </div>

      <div className="cont-right">
        <ul className="footer-list">
          <p ClassName="footer-list-title"> LEGAL</p>
          <li>
            <a class="nav-link" href="#">
              Condiciones de uso
            </a>
          </li>
          <li>
            <Link to="/privacity">
            <a class="nav-link"> Privacidad y Cookies </a>

            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Footer;
