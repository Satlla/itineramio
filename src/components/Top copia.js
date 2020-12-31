import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import "../css/components/list.css";
import { useParams } from "react-router-dom";
import Preloader from './Preloader';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';

function Listings({ title }) {

  const [listings, setListings] = useState([]);
  const [listingCategory, setListingCategory] = useState([]);
  const [loading, setLoading ] = useState(false);

  console.log(useParams());

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
      <div className="subnav">
        <div className="dropdown">
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
        </div>
        <div className="nav__list">
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
        </div>
      </div>
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
                <span className="category-listing"> {listings.category}</span>
              </div>
              <div className="slogan-listing">{listings.slogan}</div>

            </div>
          );
        })}

      </div>
    </div>
  );

}

export default Listings;
