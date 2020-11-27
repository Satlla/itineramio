import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import "../css/components/listingstable.css";
import { toast } from 'react-toastify';

function ListingsTable({ title }) {
  const [listings, setListings] = useState([]);

const onDeleteListing = async (id) => {
  if(  window.confirm('Estas seguro de querer eliminar este listing?')) {
 await db.collection('listings').doc(id).delete();
  }
  toast(`Se ha borrado el listing correctamente`, {
    type : 'error'
  })
};

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
    <div className="table-listing-list">
      {listings.map((listings) => {
        return (
          <div key={listings.id} className="table-item-listing">
            <div className="table-row_listing">
            <div className="table-listing-buttons">

                <h6 className="table-listing-name mt-4 ">{listings.name}</h6>
                <button className="btn btn btn-outline-success mt-4 mr-2">
                  {" "}
                  Edit
                </button>
                <button className="btn btn btn-outline-danger mt-4 mr-2"
                onClick= { () => onDeleteListing(listings.id)}>
                  {" "}
                  Borrar
                </button>
            </div>
                <a href="#" key={listings.name} alt="image">
                  <img className="table-listing-img"
                    key={listings.id}
                    src={listings.image}
                    alt={listings.image}
                  />
                </a>
              </div>
            </div>
 
        );
      })}
    </div>
  );
}

export default ListingsTable;
