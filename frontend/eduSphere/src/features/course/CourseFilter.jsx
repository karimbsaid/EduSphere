/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from "react";
import Input from "../../ui/Input";
import DropDown from "../../ui/DropDownn";
import Button from "../../ui/Button";
import { HiMiniStar, HiOutlineStar } from "react-icons/hi2";
import { useSearchParams } from "react-router-dom";
export default function CourseFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(searchParams);
  const onFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(filterType, value);
    setSearchParams(params);
  };
  const handleClearFilter = () => {
    setSearchParams({});
  };
  const inputRef = useRef(null);
  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        document.activeElement === inputRef.current
      ) {
        const value = inputRef.current.value.trim();

        const params = new URLSearchParams(searchParams); // faire une copie
        if (value) {
          params.set("search", value);
        } else {
          params.delete("search"); // supprimer correctement
        }
        setSearchParams(params); // mettre à jour avec la copi
      }
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Filtres</h2>
        <Button onClick={handleClearFilter} label="Réinitialiser les filtres" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 justify-items-center">
        <div className="w-full">
          <h3 className="font-medium mb-2">Recherche</h3>
          <Input ref={inputRef} placeholder="Rechercher des cours..." />
        </div>

        <div>
          <h3 className="font-medium mb-2">Catégorie</h3>
          <DropDown
            value={searchParams.get("category") || "tous"}
            onValueChange={(v) => onFilterChange("category", v)}
          >
            <DropDown.Button label="category" />
            <DropDown.Content>
              <DropDown.Item value="tous">Toutes</DropDown.Item>
              <DropDown.Item value="PROGRAMMING">Développement</DropDown.Item>
              <DropDown.Item value="DESIGN">Design</DropDown.Item>
              <DropDown.Item value="BUSINESS">Business</DropDown.Item>
              <DropDown.Item value="MARKETING">Marketing</DropDown.Item>
            </DropDown.Content>
          </DropDown>
        </div>

        <div>
          <h3 className="font-medium mb-2">Prix</h3>
          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="tous"
                name="price"
                value="tous"
                checked={
                  !searchParams.get("price") ||
                  searchParams.get("price") === "tous"
                }
                onChange={(e) => onFilterChange("price", e.target.value)}
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="tous">Tous</label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="gratuit"
                name="price"
                value="free"
                checked={searchParams.get("price") === "free"}
                onChange={(e) => onFilterChange("price", e.target.value)}
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="gratuit">Gratuit</label>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="payant"
                name="price" // 🔥 même name pour grouper
                value="paid"
                checked={searchParams.get("price") === "paid"}
                onChange={(e) => onFilterChange("price", e.target.value)}
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="payant">Payant</label>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="low"
                name="price"
                checked={searchParams.get("price") === "low"}
                onChange={(e) =>
                  onFilterChange("price", e.target.checked ? "low" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="low">moin de 20</label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="medium"
                name="price"
                checked={searchParams.get("price") === "medium"}
                onChange={(e) =>
                  onFilterChange("price", e.target.checked ? "medium" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="medium">entre 20 et 50</label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="high"
                name="price"
                checked={searchParams.get("price") === "high"}
                onChange={(e) =>
                  onFilterChange("price", e.target.checked ? "high" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="high">50 et plus</label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Niveau</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="all_level"
                name="level"
                value="tous"
                checked={
                  !searchParams.get("level") ||
                  searchParams.get("level") === "tous"
                }
                onChange={(e) => onFilterChange("level", e.target.value)}
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="all_level">Tous</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="level_debutant"
                name="level"
                checked={searchParams.get("level") === "BEGINNER"}
                onChange={(e) =>
                  onFilterChange("level", e.target.checked ? "BEGINNER" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="level_debutant">Débutant</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="intermediaire_level"
                name="level"
                checked={searchParams.get("level") === "INTERMEDIATE"}
                onChange={(e) =>
                  onFilterChange(
                    "level",
                    e.target.checked ? "INTERMEDIATE" : ""
                  )
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="intermediaire_level">Intermédiaire</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="level_avance"
                name="level"
                checked={searchParams.get("level") === "AVANCE"}
                onChange={(e) =>
                  onFilterChange("level", e.target.checked ? "AVANCE" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="level_avance">Avancé</label>e
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Notation</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="all_rating"
                name="rating"
                value="tous"
                checked={
                  !searchParams.get("averageRating") ||
                  searchParams.get("averageRating") === "tous"
                }
                onChange={(e) =>
                  onFilterChange("averageRating", e.target.value)
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="all_rating">Tous</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="high_rating"
                name="rating"
                checked={searchParams.get("averageRating") === "HIGH"}
                onChange={(e) =>
                  onFilterChange(
                    "averageRating",
                    e.target.checked ? "HIGH" : ""
                  )
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="high_rating" className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HiMiniStar color="yellow" key={star} />
                ))}
                5 uniquement
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="medium_rating"
                name="rating"
                checked={searchParams.get("averageRating") === "MEDIUM"}
                onChange={(e) =>
                  onFilterChange(
                    "averageRating",
                    e.target.checked ? "MEDIUM" : ""
                  )
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label
                htmlFor="medium_rating"
                className="flex items-center gap-1"
              >
                {[1, 2, 3, 4].map((star) => (
                  <HiMiniStar color="yellow" key={star} />
                ))}
                <HiOutlineStar />
                <span>4.0 & plus</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="low_rating"
                type="radio"
                name="rating"
                checked={searchParams.get("averageRating") === "LOW"}
                onChange={(e) =>
                  onFilterChange("averageRating", e.target.checked ? "LOW" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="low_rating" className="flex items-center gap-1">
                {[1, 2, 3].map((star) => (
                  <HiMiniStar color="yellow" key={star} />
                ))}
                {[1, 2].map((star) => (
                  <HiOutlineStar key={star} />
                ))}
                <span>3.0 & plus</span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Duration</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="all_duration"
                name="duration"
                value="tous"
                checked={
                  !searchParams.get("duration") ||
                  searchParams.get("duration") === "tous"
                }
                onChange={(e) => onFilterChange("duration", e.target.value)}
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="all_duration">Tous</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="short_duration"
                name="duration"
                checked={searchParams.get("duration") === "short"}
                onChange={(e) =>
                  onFilterChange("duration", e.target.checked ? "short" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="short_duration">moin de 3 heures</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="medium_duration"
                name="duration"
                checked={searchParams.get("duration") === "medium"}
                onChange={(e) =>
                  onFilterChange("duration", e.target.checked ? "medium" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="medium_duration">entre 3 et 10 heures</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="high_duration"
                name="duration"
                checked={searchParams.get("duration") === "high"}
                onChange={(e) =>
                  onFilterChange("duration", e.target.checked ? "high" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded-full checked:bg-black checked:border-black"
              />
              <label htmlFor="high_duration">10 heures et plus</label>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="flex justify-between items-center mt-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(searchParams).map(([key, value]) => {
            if (!value || value === "all" || value === "tous") return null;

            let displayValue = value; // Default value

            if (key === "price")
              displayValue = value === "free" ? "Gratuit" : "Payant";
            if (key === "averageRating") {
              displayValue =
                value === "HIGH"
                  ? "5.0"
                  : value === "MEDIUM"
                  ? "4.0 & plus"
                  : value === "LOW"
                  ? "3.0 & plus"
                  : value;
            }

            return (
              <Badge
                key={key}
                text={displayValue} // Show only the value
                icon={HiX} // Close icon (optional)
                onIconClick={() => onFilterChange(key, "")}
                style="px-3 py-1"
                onClick={() =>
                  onFilterChange(key, key === "search" ? "" : "tous")
                }
              />
            );
          })}
        </div>
      </div> */}
    </div>
  );
}
