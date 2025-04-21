/* eslint-disable react/prop-types */
import { FaSearch, FaFilter } from "react-icons/fa";
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
import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/authContext";

const GestionCour = ({
  course,
  setSearchParams,
  searchParams,
  currentPage,
  totalCourses,
  limit,
}) => {
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { permissions } = user;
  const status = searchParams.get("status");

  // Memoized handleKeyDown to avoid re-creations
  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        document.activeElement === inputRef.current
      ) {
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          params.set("search", inputRef.current.value);
          params.set("page", "1");
          return params;
        });
      }
    },
    [setSearchParams]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleBadgeSelect = useCallback(
    (value) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("status", value);
        params.set("page", "1");
        return params;
      });
    },
    [setSearchParams]
  );

  const handleChangePage = useCallback(
    (page) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", page);
        return params;
      });
    },
    [setSearchParams]
  );

  const totalPages = Math.ceil(totalCourses / limit);

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1>Gestion des cours</h1>
          <h2>Gérez les cours de la plateforme</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              ref={inputRef}
              placeholder="Rechercher des cours..."
              className="pl-8 w-full"
              defaultValue={searchParams.get("search") || ""}
            />
          </div>
          {permissions["createCourse"] && <Button label="Ajouter un cour" />}
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            {["ALL", "published", "pending", "draft"].map((statusOption) => (
              <Badge
                key={statusOption}
                text={
                  statusOption === "ALL"
                    ? "Tous"
                    : statusOption.charAt(0).toUpperCase() +
                      statusOption.slice(1)
                }
                className={`cursor-pointer ${
                  status === statusOption ? " bg-black text-white" : ""
                }`}
                onClick={() => handleBadgeSelect(statusOption)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="h-4 w-4" />
            <DropDown
              value={searchParams.get("sort") || "totalStudents"}
              onValueChange={(v) =>
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set("sort", v);
                  return params;
                })
              }
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

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead>Instructeur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {course.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.instructor?.name}</TableCell>
                  <TableCell>
                    <Badge text={course.category} />
                  </TableCell>
                  <TableCell>{course.price}</TableCell>
                  <TableCell>
                    <Badge text={course.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button label="Voir" />
                    <Button label="Éditer" />
                    <Button variant="ghost" label="Supprimer" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Affichage de {Math.min((currentPage - 1) * limit + 1, totalCourses)}
            à {Math.min(currentPage * limit, totalCourses)} sur {totalCourses}
            courses
          </div>
          <div className="flex">
            <Button
              label="Précédent"
              onClick={() => handleChangePage(currentPage - 1)}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                label={page}
                className={`${
                  currentPage === page
                    ? " bg-black text-white"
                    : "bg-white text-black "
                }`}
                onClick={() => handleChangePage(page)}
              />
            ))}
            <Button
              label="Suivant"
              onClick={() => handleChangePage(currentPage + 1)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GestionCour;
