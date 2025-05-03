import React, { useEffect, useRef, useState } from "react";
// import Modal from "../../ui/ModalOff";
import Button from "../../ui/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaFilter, FaSearch } from "react-icons/fa";
import Input from "../../ui/Input";
import FilterButtons from "../../components/FilterButtons";
import DropDown from "../../ui/DropDownn";

export default function CourseTableOperation() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [querySearch, setQuerySearch] = useState("");
  const inputRef = useRef(null);
  const sort = searchParams.get("sort") || "totalStudents";
  const filterOptions = [
    { value: "tous", label: "Tous" },
    { value: "published", label: "Publié" },
    { value: "pending", label: "en attente" },
    { value: "draft", label: "brouillon" },
  ];

  const handleCreateCourseNav = () => {
    navigate("/my-courses/add");
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (document.activeElement === inputRef.current && e.code === "Enter") {
        searchParams.set("search", querySearch);
        setSearchParams(searchParams);
      }
      if (e.code === "Enter") {
        inputRef.current.focus();
        setQuerySearch("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [querySearch, searchParams, setSearchParams]);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Gestion des cours
          </h1>
          <p className="text-slate-700">Gérez les cours de la plateforme</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              ref={inputRef}
              placeholder="Rechercher des cours..."
              className="pl-8 w-full"
              value={querySearch}
              onChange={(e) => setQuerySearch(e.target.value)}
            />
          </div>
          <Button label="ajouter un cour" onClick={handleCreateCourseNav} />
        </div>
      </div>
      <div className="flex justify-between">
        <FilterButtons options={filterOptions} filterField="status" />
        <div className="flex items-center gap-2">
          <FaFilter className="h-4 w-4" />
          <DropDown
            value={sort}
            onValueChange={(v) => {
              searchParams.set("sort", v);
              setSearchParams(searchParams);
            }}
          >
            <DropDown.Button label="Filtrer par" />
            <DropDown.Content>
              <DropDown.Item value="-createdAt">
                Récemment ajoutés
              </DropDown.Item>
              <DropDown.Item value="-totalStudent">
                Plus Populaires
              </DropDown.Item>
              <DropDown.Item value="-revenu">Revenu généré</DropDown.Item>
            </DropDown.Content>
          </DropDown>
        </div>
      </div>
    </>
  );
}
