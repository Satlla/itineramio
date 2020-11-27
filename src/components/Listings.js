import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import "../css/components/list.css";

function Listings({ title }) {
  const [listings, setListings] = useState([]);

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
    getListings();
  }, []);

  return (
    <div>
      <h4 className="title-listing"> {title} </h4>

      <div className="hero-listing">
      {listings.map((listings) => {
        return (

        <div className="card-listing">
        <a href="#" key={listings.name} alt="image">
              <img
                key={listings.id}
                src={listings.image}
                alt={listings.image}

              />
        </a>
              <div className="titcat">
                <span className="name-listing"> {listings.name} </span>
                <span className="category-listing"> Romantic</span>
              </div>
              <div className="slogan-listing">
                {listings.slogan}
              </div>
              </div>
          );
        })}
  </div>

</div>

  );
}

export default Listings;
