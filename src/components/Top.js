import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import "../css/components/list.css";
import Preloader from "./Preloader";
import romantic from "../assets/pages/romantic.svg";
import museums from "../assets/pages/museum.svg";
import drinks from "../assets/pages/drinks.svg";
import traditional from "../assets/pages/traditional.svg";
import aniversary from "../assets/pages/aniversary.svg";
import gastrobar from "../assets/pages/gastrobar.svg";
import carta from "../assets/pages/carta.svg";
import family from "../assets/pages/family.svg";
import { FormattedMessage } from "react-intl";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";

function Listings({ title }) {
  const [listings, setListings] = useState([]);
  const [listingCategory, setListingCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  

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
      setLoading(true);
      setListings(docs);
    });

  };

  useEffect(() => {
    getListings();

  }, []);

  return (
    <div>
      {loading ? "" : <Preloader />}

    <section className="title__top__container">
       <h2 className="title__top"> Descubre los mejores restaurantes cerca de tí</h2>
    </section>
      <div className="plans__container">
        <div className="nav__plans">
          <div className="plan">
            <img className="plan__categoryImage" src={romantic} alt="" />
            <div className="plan__content">
              <span
                onClick={() => setListingCategory("Top")}
                className="plan__title"
              >
                <FormattedMessage id="category.top" defaultMessage="Top" />
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
            <img className="plan__categoryImage" src={family} alt="" />
            <div className="plan__content">
              <span
                onClick={() => setListingCategory("Desayunar")}
                className="plan__title"
              >
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
            <img className="plan__categoryImage" src={drinks} alt="" />
            <div className="plan__content">
              <span
                onClick={() => setListingCategory("Tapas & Vinos")}
                className="plan__title"
              >
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
            <img className="plan__categoryImage" src={museums} alt="" />
            <div className="plan__content">
              <span
                onClick={() => setListingCategory("Arrocerías")}
                className="plan__title"
              >
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
            <img className="plan__categoryImage" src={traditional} alt="" />
            <div className="plan__content">
              <span
                onClick={() => setListingCategory("Coffee & Relax")}
                className="plan__title"
              >
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
            <img className="plan__categoryImage" src={aniversary} alt="" />
            <div className="plan__content">
              <span
                onClick={() => setListingCategory("Copas")}
                className="plan__title"
              >
                <FormattedMessage id="category.drinks" defaultMessage="Copas" />
              </span>
              <span>
                <FormattedMessage
                  id="category.drinks.slogan"
                  defaultMessage="Cocktails & Combinados"
                />
              </span>
            </div>
          </div>

          <div className="plan">
            <img className="plan__categoryImage" src={gastrobar} alt="" />
            <div className="plan__content">
              <span
                onClick={() => setListingCategory("Gastrobar")}
                className="plan__title"
              >
                <FormattedMessage id="category.gastrobar" defaultMessage="Gastrobar" />
              </span>
              <span>
                <FormattedMessage
                  id="category.gastrobar.slogan"
                  defaultMessage="Alta cocina en raciones pequeñas"
                />
              </span>
            </div>
          </div>

          <div className="plan">
            <img className="plan__categoryImage" src={carta} alt="" />
            <div className="plan__content">
              <span
                onClick={() => setListingCategory("A la carta")}
                className="plan__title"
              >
                <FormattedMessage id="category.alacarta" defaultMessage="A la Carta" />
              </span>
              <span>
                <FormattedMessage
                  id="category.alacarta.slogan"
                  defaultMessage="Restaurante tradicional"
                />
              </span>
            </div>
          </div>

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
                <span className="name-listing"> {listings.name} {}</span>
              </div>
              <div className="slogan-listing">{listings.slogan}</div>
              <span className="category-listing"> {listings.category}</span>
              <span className="number">
                {" "}
                <strong>{listings?.itins}</strong>/100{" "}
                <span className="rating__icon">
                  <AllInclusiveIcon />
                </span>
              </span>



            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Listings;
