import React from "react";
import { Link } from "react-router-dom";
import './styles.css'

function Navigation() {
  return (
    <div className="navigation_layout">

<div className="title__container">

<p className="title__navigation"> Selecciona cualquiera de las siguientes secciones para ver un video explicativo del apartamento</p>
</div>

    <div className="categories__menu">
 
<div className="navigation__menu">
      <ul>
        <li>
          <Link to="/apartments/enriquetaloft/faq/checkin">
            <a className="menu__item"> Checkin</a>
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <a className="menu__item "> Checkout</a>
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <a className="menu__item "> Vitrocerámica</a>
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <a className="menu__item "> Climatización</a>
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <a className="menu__item "> Lavadora</a>
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <a className="menu__item "> Luces</a>
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <a className="menu__item "> Normas</a>
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <a className="menu__item "> Restaurantes</a>
          </Link>
        </li>

      </ul>

      </div>


</div>
    </div>
  );
}

export default Navigation;
