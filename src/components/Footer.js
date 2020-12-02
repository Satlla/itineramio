import React from "react";
import "../css/components/footer.css";
import logo from "../logo.png";
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import PinterestIcon from '@material-ui/icons/Pinterest';

function Footer() {
  return (
    <div className="container-footer mt-4 pt-4">
      <div className="cont-left">
        <ul className="footer-list">
          <li className="itineramio-footer">
            <a class="nav-link" href="#">
              <img src={logo} alt="" className="logo-footer" />
            </a>
          </li>
          <li>
            <p class="what-is">
              Itineramio es una comunidad de personas apasionadas por descubrir
              la infinidad de lugares gastronómicos de imprescindible visita en
              la ciudad de Alicante
            </p>
            <div className="Social-icons mb-4">
              <span> <InstagramIcon /> </span>
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
            <a class="nav-link" href="#">
              ¿Cómo funciona Itineramio?
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              News
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              Itineramio Pro
            </a>
          </li>
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
            <a class="nav-link" href="#">
              Privacidad y cookies
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              Quienes somos
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Footer;
