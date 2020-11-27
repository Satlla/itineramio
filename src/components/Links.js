import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import "../css/components/listing.css";

function Links( { title }) {
  const [links, setLinks] = useState([]);

  const getLinks = async () => {
    db.collection("links").onSnapshot((querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ ...doc.data(), id: doc.id });
      });
      setLinks(docs);
    });
  };

  useEffect(() => {
    getLinks();
  }, []);

  return (
    <div>
      <h4 className="listing-title"> { title } </h4>
      <div className="row">
      {links.map((links) => {
        return (
          <div className="row_listings">

            <div className="row_listing">
              <a href="#" key={links.name} alt="image" />
              <img
                key={links.id}
                src={links.image}
                alt={links.image}
              />
              <h6 className="listing-name">{links.name}</h6>
              <p className="listing-slogan">{links.slogan} </p>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}

export default Links;
