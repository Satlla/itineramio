import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";
import Checkin from "../../../assets/icons/checkin.svg";
import Vitro from "../../../assets/icons/vitroceramic.svg";
import Checkout from "../../../assets/icons/checkout.svg";
import Wifi from "../../../assets/icons/wifi.svg";
import Washingmachine from "../../../assets/icons/washingmachine.svg";
import Climatization from "../../../assets/icons/climatization.svg";
import Eat from "../../../assets/icons/eat.svg";
import Phones from "../../../assets/icons/smartphone.svg";
import Rules from "../../../assets/icons/yellow-card.svg";
import Tv from "../../../assets/icons/tv-screen.svg";


function Navigationazul() {
  return (
    <div className="navigation_layout">
      <div className="title__container">
        <p className="title__navigation">
          {" "}
          Selecciona cualquiera de las siguientes secciones para ver un vídeo
          explicativo del apartamento
        </p>
      </div>

      <div className="categories__menu">
        <div className="navigation__menu">
          <ul>
            <Link to="/apartments/casazul/faq/checkincasazul">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={Checkin} alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Checkin</a>
                </div>
              </li>
            </Link>
            <Link to="/apartments/casazul/faq/checkoutcasazul">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={Checkout} alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Checkout</a>
                </div>
              </li>
            </Link>

            <Link to="/apartments/casazul/faq/vitrocasazul">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={Vitro} alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Vitrocerámica</a>
                </div>
              </li>
            </Link>

            <Link to="/apartments/casazul/faq/wificasazul">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={Wifi} alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Wifi</a>
                </div>
              </li>
            </Link>

            <Link to="/apartments/casazul/faq/washingmachinecasazul">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={Washingmachine} alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Lavadora </a>
                </div>
              </li>
            </Link>
            <Link to="/apartments/casazul/faq/rulescasazul">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={ Rules } alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Normas </a>
                </div>
              </li>
            </Link>

            {/* <Link to="/apartments/enriqueta4/faq/climatizatione4">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={Climatization} alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Climatización</a>
                </div>
              </li>
            </Link>
*/}
            <Link to="/">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={Eat} alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Restaurantes</a>
                </div>
              </li>
            </Link> 

            <Link to="/apartments/casazul/faq/phonescasazul">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={Phones} alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> Teléfonos</a>
                </div>
              </li>
            </Link>

            <Link to="/apartments/casazul/faq/tvcasazul">
              <li className="item__button">
                <div className="">
                  <img className="item__icon" src={ Tv } alt="" />
                </div>

                <div className="mt-2">
                  <a className="menu__item"> TV</a>
                </div>
              </li>
            </Link>


          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navigationazul;
