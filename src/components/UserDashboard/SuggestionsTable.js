import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import "../../css/components/listingstable.css";
import { toast } from "react-toastify";
import "../../css/components/dashboard.css";

function SuggestionTable({ title }) {
  const [recommendations, setRecommendations] = useState([]);

  const onDeleteListing = async (id) => {
    if (window.confirm("¿Estás seguro de querer eliminar esta sugerencia?")) {
      await db.collection("recommendations").doc(id).delete();
    }
    toast(`Se ha borrado la sugerencia correctamente`, {
      type: "error",
    });
  };

  const getRecommendations = async () => {
    db.collection("recommendations").onSnapshot((querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ ...doc.data(), id: doc.id });
      });
      setRecommendations(docs);
    });
  };

  useEffect(() => {
    getRecommendations();
  }, []);

  return (
    <div className="main-container">
      <div className="container-table">
        <h3> Sugerencias de usuarios</h3>
        <div className="table-listing-list ">
          <table class="table ">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Usuario</th>
                <th scope="col">Establecimiento</th>
                <th scope="col">Borrar</th>
              </tr>
            </thead>

            {recommendations.map((recomendations, index) => {
              return (
                <tbody>
                  <tr>
                    <th scope="row"> {index}</th>
                    <td>{recomendations.name}</td>
                    <td>{recomendations.recommendation}</td>

                    <td>
                      <button
                        className="btn__delete "
                        onClick={() => onDeleteListing(recomendations.id)}
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

export default SuggestionTable;
