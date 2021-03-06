import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import "../css/components/list.css";
import Preloader from "../components/Preloader";
import { useParams } from "react-router-dom";

function Listings({ title }) {

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);



  const getListings = async () => {

    db.collection("listings").onSnapshot((querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ ...doc.data(), id: doc.id });
      });
      setListings(docs);
    });
  };



  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getListings();
  }, []);

  return (
    <div>

      <h4 className="title-listing"> {title} </h4>

        {loading ? "" : <Preloader />}
      <div className="hero-listing">
        {listings.map((listings) => {
          return (
            <div className="card-listing mb-4">
              <a href="#" key={listings.name} alt="image">
                <img
                  key={listings.id}
                  src={listings.image}
                  alt={listings.image}

                />
              </a>
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
