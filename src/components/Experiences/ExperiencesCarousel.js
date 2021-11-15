import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import "../../css/components/experiencesCarousel.css";
import Preloader from "../Preloader";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router-dom";
import ExperienceDetails from '../../pages/ExperienceDetails'

function ExperiencesCarousel({ title }) {
  const { experienceId, experienceName } = useParams();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [experienceComments, setExperienceComments] = useState([]);


  db.collection("experiences")
      .doc(experienceId)
      .collection("comments")
      // .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) =>
        setExperienceComments(snapshot.docs.map((doc) => doc.data()))
      );

  const getExperiences = async () => {
    db.collection("experiences").onSnapshot((querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ ...doc.data(), id: doc.id });
      });
      setLoading(true);
      setExperiences(docs);
    });

  };

  useEffect(() => {
    getExperiences();

  }, []);

  return (
    <div>
      {loading ? "" : <Preloader />}

    <section className="carousel m-3 mt-4">

       <h2 className="title__top">

       <FormattedMessage
       id="experience.title"
       defaultMessage="Experiencias en Alicante"
      />

          </h2>
       <p className="ml-3">
         <FormattedMessage
         id="experiences.subtitle"
         defaultMessage="Descubre experiencias únicas, organizadas por gente local de la ciudad"

         />

          </p>
    </section>

      <div className="experience-hero">
        {experiences.map((experiences) => {
          return (
            <div className="experience-image mb-4 ">
              <Link to={`/experience/${experiences.id}`}>
                <a href="#" key={experiences.name} alt="image">
                  <img
                    key={experiences.id}
                    src={experiences.image}
                    alt={experiences.image}
                  />
                </a>
              </Link>
              <div className="experience-info">


              <div className="titcat">
                <span className="name-listing"> {experiences.name} {}</span>
              </div>
              <div className="slogan-listing">{experiences.slogan}</div>
              <div className="category-hours">
              <span className="category-listing"> {experiences.category}</span>

              <span className="number">
                {" "}
                <strong>{experiences.duration}</strong>{" "} horas

              </span>
              </div>
              </div>



            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExperiencesCarousel;
