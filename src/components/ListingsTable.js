import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import "../css/components/listingstable.css";
import { toast } from "react-toastify";
import '../css/components/dashboard.css'


function ListingsTable({ title }) {
  const [listings, setListings] = useState([]);

  const onDeleteListing = async (id) => {
    if (window.confirm("Estas seguro de querer eliminar este listing?")) {
      await db.collection("listings").doc(id).delete();
    }
    toast(`Se ha borrado el listing correctamente`, {
      type: "error",
    });
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

    <div className="main-container">

      <div className="container-table">
   
<h3> Tus Anuncios</h3>
      <div className="table-listing-list ">

      <table class="table ">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Nombre</th>
            <th scope="col">Editar</th>
            <th scope="col">Borrar</th>
          </tr>
        </thead>

        {listings.map((listings, index) => {
          return (
            <tbody>
              <tr>
          <th scope="row" > {index}</th>
                <td>{listings.name}</td>
                <td>
                  <button className="btn__edit">
                    {" "}
                    Editar
                  </button>
                </td>
                <td>
                  <button
                    className="btn__delete "
                    onClick={() => onDeleteListing(listings.id)}
                  >
                    {" "}
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          );
        })}
      </table>
      </div>
      </div>
    </div>
  );
}

export default ListingsTable;
