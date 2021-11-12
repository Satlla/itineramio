import React, { useEffect, useState } from "react";
import "../../css/components/commentBox.css";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FormattedMessage } from "react-intl";

function ExperienceCommentBox() {
  const { experienceId } = useParams();

  const [commentMessage, setCommentMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [title, setTitle] = useState("");

  const sendComment = (e) => {
    e.preventDefault();

    db.collection("experiences").doc(experienceId).collection("comments").add({
      comment: commentMessage,
      username: userName,
      title: title,
      userImage: "",
      // timestamp: db.fieldValue.serverTimestamp(),
    });
    toast("Se ha añadido el tu comentario correctamente", {
      type: "success",
      autoClose: 1000,
    });
  };

  return (
    <div className="commentBox">
      <h5>
        <FormattedMessage
          id="comment.writecomment"
          defaultMessage="Escribe tu comentario"
        />{" "}
      </h5>
      <form action="">
        <div className="comment__input">
          <input
            onChange={(e) => setUserName(e.target.value)}
            className="comment__name"
            value={userName}
            type="text"
            placeholder=" Tu nombre"
          />

          <input
            onChange={(e) => setTitle(e.target.value)}
            className="comment__name"
            value={title}
            type="text"
            placeholder=" Escribe un título"
          />

          <textarea
            onChange={(e) => setCommentMessage(e.target.value)}
            className="input__comment"
            type="text"
            placeholder="Describe tu experiencia en el establecimiento"
          />
        </div>
        <button onClick={sendComment} type="submit" className="btn-comment">
        <FormattedMessage
          id="comment.send"
          defaultMessage="Enviar"
        />{" "}
        </button>
      </form>
    </div>
  );
}

export default ExperienceCommentBox;
