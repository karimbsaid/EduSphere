/* eslint-disable react/prop-types */
import { useState } from "react";
import Button from "../ui/Button"; // Assurez-vous que votre composant Button est importé

const FilterCategories = ({ categories, onFilter }) => {
  const [activeCategories, setActiveCategories] = useState([]);

  const handleFilterClick = (category) => {
    // Vérifie si la catégorie est déjà active
    const isActive = activeCategories.includes(category);

    // Met à jour la liste des catégories actives
    if (isActive) {
      setActiveCategories(activeCategories.filter((item) => item !== category));
    } else {
      setActiveCategories([...activeCategories, category]);
    }

    onFilter(category);
  };

  return (
    <div className="flex flex-col  lg:flex-row space-x-4 space-y-2 sm:space-y-0">
      {categories.map((category) => (
        <Button
          className={`${
            activeCategories.includes(category)
              ? "text-white bg-black"
              : "text-black bg-gray-200"
          }`}
          key={category}
          label={category}
          onClick={() => handleFilterClick(category)}
        />
      ))}
    </div>
  );
};

export default FilterCategories;
