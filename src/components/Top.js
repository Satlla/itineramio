import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import "../css/components/list.css";
import Preloader from './Preloader';
import "../css/pages/plans.css";
import romantic from '../assets/pages/romantic.svg';
import museums from '../assets/pages/museum.svg';
import drinks from '../assets/pages/drinks.svg';
import traditional from '../assets/pages/traditional.svg';
import aniversary from '../assets/pages/aniversary.svg';
import family from '../assets/pages/family.svg';
import {FormattedMessage} from 'react-intl';


function Listings({ title }) {

  const [listings, setListings] = useState([]);
  const [listingCategory, setListingCategory] = useState([]);
  const [loading, setLoading ] = useState(false);

  function categoryTerm(listingCategory) {
    return function (x) {
      return x.category.includes(listingCategory) || !listingCategory;
    };

  }

  const getListings = async () => {

    db.collection("listings").onSnapshot((querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ ...doc.data(), id: doc.id });
      });
      setLoading(true)
      setListings(docs);

    });
  };

  useEffect(() => {
    getListings();
  }, []);

  return (
    <div>
    { loading ? "" : <Preloader />}
    {/* <div className="about__us">
      <div classname="about__cont">

      <h2 className="about__title"> Descubre itineramio</h2>
      <div className="slogan__container">
      <p className="slogan-bullet"> Lugares para visitar + gastronomía = Itineramios para compartir.</p>
      </div>
      </div>

    </div> */}
    <div className="plans__container">
    <div className="nav__plans">
      <div className="plan">
        <img className="plan__categoryImage" src={romantic} alt=""/>
        <div className="plan__content">
        <span onClick={() => setListingCategory("Top")}  className="plan__title">
          <FormattedMessage
          id="category.top"
          defaultMessage="Top"
          />
        </span>
        <span>
        <FormattedMessage
          id="category.top.slogan"
          defaultMessage="Lo mejor"
          />
        </span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={family} alt=""/>
        <div className="plan__content">
        <span onClick={() => setListingCategory("Desayunar")}  className="plan__title">
        <FormattedMessage
          id="category.breakfast"
          defaultMessage="Desayunar"
          />
           </span>
        <span>
        <FormattedMessage
          id="category.breakfast.slogan"
          defaultMessage="Lunch, Break..."
          />
        </span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={drinks} alt=""/>
        <div className="plan__content">
        <span onClick={() => setListingCategory("Tapas & Vinos")}  className="plan__title">
        <FormattedMessage
          id="category.apetizers"
          defaultMessage="Tapas & Vinos"
          />
          </span>
        <span>
        <FormattedMessage
          id="category.apetizers.slogan"
          defaultMessage="Vinos, Bermouth"
          />
           </span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={museums} alt=""/>
        <div className="plan__content">
        <span onClick={() => setListingCategory("Arrocerías")}  className="plan__title">
        <FormattedMessage
          id="category.rices"
          defaultMessage="Arroces"
          />
          </span>
        <span>
        <FormattedMessage
          id="category.rices.slogan"
          defaultMessage="Mejores Arroces"
          />

        </span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={traditional} alt=""/>
        <div className="plan__content">
        <span onClick={() => setListingCategory("Coffee & Relax")}  className="plan__title">
        <FormattedMessage
          id="category.coffee"
          defaultMessage="Coffee & Relax"
          />

          </span>
        <span>
        <FormattedMessage
          id="category.coffee.slogan"
          defaultMessage="Tardes Mágicas"
          />


        </span>
       </div>

      </div>
      <div className="plan">
        <img className="plan__categoryImage" src={aniversary} alt=""/>
        <div className="plan__content">
        <span onClick={() => setListingCategory("Copas")}  className="plan__title">
        <FormattedMessage
          id="category.drinks"
          defaultMessage="Copas"
          />
        </span>
        <span>
        <FormattedMessage
          id="category.drinks.slogan"
          defaultMessage="Cocktails & Combinados"
          />
        </span>
       </div>

      </div>

    </div>
     </div>
        {/* DropDown seleccionar categoría  */}
        {/* <div className="dropdown">
          <select
            className="dropdown-filter "
            name="listingcategory"
            onChange={(e) => setListingCategory(e.target.value)}
          >
            <option className="option-filter" value="Desayunar">
              Desayunar
            </option>
            <option value="Tapas & Vinos">Tapas & Vinos</option>
            <option value="Arrocerías">Arrocerías</option>
            <option value="Top">Top</option>
            <option value="Coffee & Relax">Coffee & Relax</option>
          </select>
        </div> */}


        {/*  Fin Dropdown seleccionar categoria */}
        {/* <div className="nav__list">
          <ul className="subnav__items">
            <Link to="/plans">
            <li className="nav__item">
              <a className="navigation__link active" href="#">
                <span className="nav__icon"><CenterFocusStrongIcon /> </span>
                <span className="title__nav  "> Plans</span>
              </a>
            </li>
            </Link>

            <li className="nav__item">
              <a className="navigation__link" href="#">
              <span className="nav__icon"> <HomeIcon /> </span>
              <span className="title__nav"> Homes </span>
              </a>
            </li>

            <li className="nav__item">
              <a className="navigation__link" href="#">
              <span className="nav__icon"><ExploreIcon /></span>
                <span className="title__nav"> Visitar</span>
              </a>
            </li>
          </ul>
        </div> */}
    
      <div className="hero-listing">
        {listings.filter(categoryTerm(listingCategory)).map((listings) => {
          return (
            <div className="card-listing mb-4">
              <Link to={`/listing/${listings.id}`}>
                <a href="#" key={listings.name} alt="image">
                  <img
                    key={listings.id}
                    src={listings.image}
                    alt={listings.image}
                  />
                </a>
              </Link>
              <div className="titcat">
                <span className="name-listing"> {listings.name} </span>
                
              </div>
              <div className="slogan-listing">{listings.slogan}</div>
              <span className="category-listing"> {listings.category}</span>

            </div>
          );
        })}

      </div>
    </div>
  );

}

export default Listings;
