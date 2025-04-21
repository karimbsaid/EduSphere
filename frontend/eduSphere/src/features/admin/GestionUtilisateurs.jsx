/* eslint-disable react/prop-types */
import { FaSearch, FaFilter } from "react-icons/fa"; // Assure-toi que tu as installé react-icons
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import DropDown from "../../ui/DropDownn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import Modal from "../../ui/ModalOff";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/authContext";
import UserForm from "./UserForm";

function formatDate(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() retourne 0-11
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
const GestionUtilisateurs = ({
  users,
  totalUsers,
  totalPages,
  onChangePage,
  currentPage,
  onSearch,
}) => {
  console.log(users);
  const { user } = useAuth();
  const { permissions } = user;

  const handleAddUser = () => {
    console.log("Utilisateur à ajouter :");
    // Appelle ton API ou fonction ici
  };
  const inputRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Enter" &&
        document.activeElement === inputRef.current
      ) {
        onSearch(inputRef.current.value);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSearch]);

  return (
    <Card className="space-y-4">
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
            />
          </div>
          <Modal>
            <Modal.Open opens="window">
              <Button>open</Button>
            </Modal.Open>
            <Modal.Window name="window">
              <UserForm />
            </Modal.Window>
          </Modal>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge text="Tous" className="cursor-pointer" />
            <Badge text="Étudiants" className="cursor-pointer" />
            <Badge text="Instructeurs" className="cursor-pointer" />
            <Badge text="Administrateurs" className="cursor-pointer" />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date d&apos;inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* <img
                        src={user?.additionalDetail.photo}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      /> */}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-slate-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge text={user.role} />
                  </TableCell>
                  <TableCell>{formatDate(user.dateInscription)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Modal>
                        <Modal.Trigger>Éditer</Modal.Trigger>

                        <Modal.Content>
                          <Modal.Header>Ajouter un utilisateur</Modal.Header>
                          <Modal.Body>
                            <UserForm user={user} />
                          </Modal.Body>

                          <Modal.Footer>
                            <Button
                              label="Annuler"
                              variant="ghost"
                              closeOnClick
                            />
                            <Button
                              label="Ajouter"
                              onClick={handleAddUser}
                              closeOnClick={true}
                            />
                          </Modal.Footer>
                        </Modal.Content>
                      </Modal>

                      <Button
                        variant="ghost"
                        label="supprimer"
                        size="sm"
                        className="text-red-500"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Affichage de 1 à 5 sur {totalUsers} utilisateurs
          </div>
          <div className="flex">
            <Button
              label="Précédent"
              onClick={() => onChangePage(currentPage - 1)}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page, i) => (
                <Button
                  label={page}
                  className={`${
                    currentPage === page
                      ? " bg-black text-white"
                      : "bg-white text-black "
                  }`}
                  key={i}
                  onClick={() => onChangePage(page)}
                />
              )
            )}
            <Button
              label="Suivant"
              onClick={() => onChangePage(currentPage + 1)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GestionUtilisateurs;
