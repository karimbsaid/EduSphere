import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Input from "../../ui/Input";
import Modal from "../../ui/ModalOff";
import Button from "../../ui/Button";
import UserForm from "./UserForm";
import { useSearchParams } from "react-router-dom";
import FilterButtons from "../../components/FilterButtons";
import { useAuth } from "../../context/authContext";

export default function UserTableOperation() {
  const { user: authenifiedUser } = useAuth();
  const { permissions } = authenifiedUser;
  const [searchParams, setSearchParams] = useSearchParams();
  const [querySearch, setQuerySearch] = useState("");
  const inputRef = useRef(null);
  const filterOptions = [
    { value: "all", label: "Tous" },
    { value: "admin", label: "Administrateur" },
    { value: "instructor", label: "Instructeur" },
    { value: "student", label: "Etudiant" },
  ];

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
          <h1>Gestion des utilisateurs</h1>
          <h2>Gérez les utilisateurs de la plateforme</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              ref={inputRef}
              placeholder="Rechercher des utilisateurs..."
              className="pl-8 w-full"
              value={querySearch}
              onChange={(e) => setQuerySearch(e.target.value)}
            />
          </div>
          {permissions?.includes("addUser") && (
            <Modal>
              <Modal.Open opens="addUser">
                <Button label="ajouter un utilisateur" />
              </Modal.Open>
              <Modal.Window name="addUser">
                <UserForm />
              </Modal.Window>
            </Modal>
          )}
        </div>
      </div>

      <FilterButtons options={filterOptions} filterField="role" />
    </>
  );
}
