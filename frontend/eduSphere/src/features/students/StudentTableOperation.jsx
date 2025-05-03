import React, { useEffect, useRef, useState } from "react";
import DropDown from "../../ui/DropDownn";
import { FaFilter, FaSearch } from "react-icons/fa";
import FilterButtons from "../../components/FilterButtons";
import Input from "../../ui/Input";
import { useSearchParams } from "react-router-dom";

export default function StudentTableOperation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [querySearch, setQuerySearch] = useState("");
  const studentInputRef = useRef(null);
  const sort = searchParams.get("sort");

  useEffect(() => {
    function handleKeyDown(e) {
      // Recherche par nom d'étudiant
      if (
        document.activeElement === studentInputRef.current &&
        e.code === "Enter"
      ) {
        searchParams.set("search", querySearch);
        setSearchParams(searchParams);
      }
      if (e.code === "Enter") {
        studentInputRef.current.focus();
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
          <h1 className="text-3xl font-bold">Gestion des étudiants</h1>
          <p className="text-slate-500">Gérez les étudiants de la plateforme</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche par nom d'étudiant */}
          <div className="relative">
            <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              ref={studentInputRef}
              placeholder="Rechercher par nom d'étudiant..."
              className="pl-8 w-full"
              value={querySearch}
              onChange={(e) => setQuerySearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
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
              <DropDown.Item value="-student">sort par student</DropDown.Item>
              <DropDown.Item value="-cour">sort par cour</DropDown.Item>
            </DropDown.Content>
          </DropDown>
        </div>
      </div>
    </>
  );
}
