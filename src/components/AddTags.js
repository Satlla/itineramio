import { useState } from "react";
import "../css/components/tags.css";

export default function AddTags() {
  const [tags, setTags] = useState([]);
  
  const addTag = (e) => {
    if (e.key === "Enter") {
   
        setTags([...tags, e.target.value]);
        e.target.value = "";
        console.log(tags)
      
    }
  };
  const removeTags = indexToRemove => {
    setTags([...tags.filter((_, index) => index !== indexToRemove)]);
  };

  return (
    <div className="AddTags mt-4">

      <div className="tag-container">
  
          <ul>

        {tags.map((tag, index) => (

            <li key={index} className="tag">#
              {tag} <span onClick={() => removeTags(tag)}>x</span>
            </li>
        ))}
          </ul>
        <input
        type="text"
        name="listingstags"
        placeholder="Introduce tags"
         onKeyDown={addTag}
         />
      </div>
    </div>
  );
}
