import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import "../css/components/list.css";
import { useParams } from "react-router-dom";
import Preloader from './Preloader';

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
      <h4 className="title-listing"> {title} </h4>
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
        <div className="nav-list">
          <ul className="nav">
            <li className="nav-item">
              <a className="nav-link active" href="#">
                Planes
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Homes
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Visitar
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
