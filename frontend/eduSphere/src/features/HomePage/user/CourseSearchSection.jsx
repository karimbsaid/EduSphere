/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import Button from "../../../ui/Button";
import DropDown from "../../../ui/DropDownn";
import Badge from "../../../ui/Badge";
import Input from "../../../ui/Input";
import {
  FaBriefcase,
  FaBullhorn,
  FaChevronRight,
  FaCode,
  FaPaintBrush,
  FaSearch,
} from "react-icons/fa";

export function CourseSearchSection({ filters, onFilterChange }) {
  const categories = [
    { id: 1, name: "Programming", value: "PROGRAMMING", icon: <FaCode /> },
    { id: 2, name: "Design", value: "DESIGN", icon: <FaPaintBrush /> },
    { id: 3, name: "Business", value: "BUSINESS", icon: <FaBriefcase /> },
    { id: 4, name: "Marketing", value: "MARKETING", icon: <FaBullhorn /> },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <Badge
            text="Trouvez votre prochain cours"
            style="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20"
          />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Que souhaitez-vous apprendre aujourd&apos;hui ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explorez notre catalogue de plus de 10 000 cours dans tous les
            domaines et à tous les niveaux.
          </p>
        </div>

        <div className="mb-8 relative">
          <Input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Rechercher un cours, une compétence ou un instructeur..."
            icon={FaSearch}
            className="pl-12 py-6 text-lg rounded-full shadow-md"
          />
          <Button
            label="Rechercher"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black text-white"
          />
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Catégories populaires</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                onClick={(v) => onFilterChange("category", category.value)}
                key={category.id}
                label={category.name}
                icon={() => <span>{category.icon}</span>}
                className={`rounded-full border ${
                  filters.category === category.value
                    ? "bg-black text-white"
                    : "bg-white text-black"
                } transition-colors`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DropDown
            value={filters.level}
            onValueChange={(v) => onFilterChange("level", v)}
          >
            <DropDown.Button label="Niveau" />
            <DropDown.Content>
              <DropDown.Item value="level">Tous les niveaux</DropDown.Item>
              <DropDown.Item value="BEGINNER">Débutant</DropDown.Item>
              <DropDown.Item value="INTERMEDIATE">Intermédiaire</DropDown.Item>
              <DropDown.Item value="AVANCE">Avancé</DropDown.Item>
            </DropDown.Content>
          </DropDown>

          <DropDown
            value={filters.duration}
            onValueChange={(v) => onFilterChange("duration", v)}
          >
            <DropDown.Button label="Duration" />
            <DropDown.Content>
              <DropDown.Item value="tous">Toutes les durées</DropDown.Item>
              <DropDown.Item value="short">Moins de 3 heures</DropDown.Item>
              <DropDown.Item value="medium">3-10 heures</DropDown.Item>
              <DropDown.Item value="long">Plus de 10 heures</DropDown.Item>
            </DropDown.Content>
          </DropDown>

          <DropDown
            value={filters.price}
            onValueChange={(v) => onFilterChange("price", v)}
          >
            <DropDown.Button label="price" />
            <DropDown.Content>
              <DropDown.Item value="tous">tous</DropDown.Item>
              <DropDown.Item value="free">Gratuit</DropDown.Item>
              <DropDown.Item value="paid">Payant</DropDown.Item>
              <DropDown.Item value="low">Moins de 20 tnd</DropDown.Item>
              <DropDown.Item value="medium">20 tnd - 50 tnd</DropDown.Item>
              <DropDown.Item value="high">Plus de 50 tnd</DropDown.Item>
            </DropDown.Content>
          </DropDown>
        </div>
      </div>
    </section>
  );
}
export default CourseSearchSection;
