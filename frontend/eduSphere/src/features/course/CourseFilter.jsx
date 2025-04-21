/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from "react";
import Input from "../../ui/Input";
import DropDown from "../../ui/DropDownn";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { HiMiniStar, HiOutlineStar } from "react-icons/hi2";
import { HiX } from "react-icons/hi";
export default function CourseFilter({ filters, onFilterChange }) {
  const handleClearFilter = () => {
    onFilterChange("price", "tous");
    onFilterChange("level", "");
    onFilterChange("averageRating", "tous");
    onFilterChange("category", "all");
    onFilterChange("search", "");
    onFilterChange("duration", "tous");
  };
  const inputRef = useRef(null);
  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        document.activeElement === inputRef.current
      ) {
        onFilterChange("search", inputRef.current.value);
      }
    },
    [onFilterChange]
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div>
          <h3 className="font-medium mb-2">Recherche</h3>
          <Input ref={inputRef} placeholder="Rechercher des cours..." />
        </div>

        <div>
          <h3 className="font-medium mb-2">Catégorie</h3>
          <DropDown
            value={filters.category}
            onValueChange={(v) => onFilterChange("category", v)}
          >
            <DropDown.Button label="category" />
            <DropDown.Content>
              <DropDown.Item value="all">Toutes</DropDown.Item>
              <DropDown.Item value="development">Développement</DropDown.Item>
              <DropDown.Item value="design">Design</DropDown.Item>
              <DropDown.Item value="business">Business</DropDown.Item>
              <DropDown.Item value="marketing">Marketing</DropDown.Item>
            </DropDown.Content>
          </DropDown>
        </div>

        <div>
          <h3 className="font-medium mb-2">Prix</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="gratuit"
                checked={filters.price === "free"}
                onChange={(e) =>
                  onFilterChange("price", e.target.checked ? "free" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="gratuit">gratuit</label>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="payant"
                checked={filters.price === "paid"}
                onChange={(e) =>
                  onFilterChange("price", e.target.checked ? "paid" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="payant">Payant</label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="low"
                checked={filters.price === "low"}
                onChange={(e) =>
                  onFilterChange("price", e.target.checked ? "low" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="low">moin de 20</label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="medium"
                checked={filters.price === "medium"}
                onChange={(e) =>
                  onFilterChange("price", e.target.checked ? "medium" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="medium">entre 20 et 50</label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="high"
                checked={filters.price === "high"}
                onChange={(e) =>
                  onFilterChange("price", e.target.checked ? "high" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="high">50 et plus</label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Niveau</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="level_debutant"
                checked={filters.level === "BEGINNER"}
                onChange={(e) =>
                  onFilterChange("level", e.target.checked ? "BEGINNER" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="level_debutant">Débutant</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="intermediaire_level"
                checked={filters.level === "INTERMEDIATE"}
                onChange={(e) =>
                  onFilterChange(
                    "level",
                    e.target.checked ? "INTERMEDIATE" : ""
                  )
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="intermediaire_level">Intermédiaire</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="level_avance"
                checked={filters.level === "AVANCE"}
                onChange={(e) =>
                  onFilterChange("level", e.target.checked ? "AVANCE" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
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
                type="checkbox"
                id="high_rating"
                checked={filters.averageRating === "HIGH"}
                onChange={(e) =>
                  onFilterChange(
                    "averageRating",
                    e.target.checked ? "HIGH" : ""
                  )
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
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
                type="checkbox"
                id="medium_rating"
                checked={filters.averageRating === "MEDIUM"}
                onChange={(e) =>
                  onFilterChange(
                    "averageRating",
                    e.target.checked ? "MEDIUM" : ""
                  )
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
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
                type="checkbox"
                checked={filters.averageRating === "LOW"}
                onChange={(e) =>
                  onFilterChange("averageRating", e.target.checked ? "LOW" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
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
                type="checkbox"
                id="short_duration"
                checked={filters.duration === "short"}
                onChange={(e) =>
                  onFilterChange("duration", e.target.checked ? "short" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="short_duration">moin de 3 heures</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="medium_duration"
                checked={filters.duration === "medium"}
                onChange={(e) =>
                  onFilterChange("duration", e.target.checked ? "medium" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="medium_duration">entre 3 et 10 heures</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="high_duration"
                checked={filters.duration === "high"}
                onChange={(e) =>
                  onFilterChange("duration", e.target.checked ? "high" : "")
                }
                className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
              />
              <label htmlFor="high_duration">10 heures et plus</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
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
      </div>
    </div>
  );
}
