import React, { useEffect, useState } from "react";

function AddTags() {

  return (
    <div className="mt-2">
      <label className="tags_listing" for="tags">
        {" "}
        ¿Qué hace especial este emplazamiento?
      </label>
      <div className="tags-input mb-4">
        <ul id="tags">
          <li className="tag">
            <span className="tag-title">{}</span>
            <span className="tag-close-icon">x</span>
          </li>
        </ul>
        <input type="text" placeholder="Press enter to add tags" />
      </div>
    </div>
  );
}

export default AddTags;
