/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/authContext";
import Card from "../../ui/Card";
import { FaFilter, FaSearch } from "react-icons/fa";
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
import { formatDate } from "../../utils/formatDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
export default function GestionPayment({
  payment,
  setSearchParams,
  searchParams,
  currentPage,
  totalPayments,
  limit,
}) {
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { permissions } = user;
  const paymentStatus = searchParams.get("paymentStatus") ?? "ALL";
  const [startDate, setStartDate] = useState(() => {
    const s = searchParams.get("startDate");
    return s ? new Date(s) : null;
  });
  const [endDate, setEndDate] = useState(() => {
    const e = searchParams.get("endDate");
    return e ? new Date(e) : null;
  });

  // Memoized handleKeyDown to avoid re-creations
  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        document.activeElement === inputRef.current
      ) {
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          if (inputRef.current.value.trim() != "") {
            params.set("search", inputRef.current.value);
          } else {
            params.delete("search");
          }
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

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (startDate) params.set("startDate", startDate.toISOString());
    else params.delete("startDate");
    if (endDate) params.set("endDate", endDate.toISOString());
    else params.delete("endDate");

    setSearchParams(params);
  }, [startDate, endDate]);

  const handleBadgeSelect = useCallback(
    (value) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("paymentStatus", value);
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

  const totalPages = Math.ceil(totalPayments / limit);
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
              placeholder="Rechercher des transactions..."
              className="pl-8 w-full"
              defaultValue={searchParams.get("search") || ""}
            />
          </div>
          <Button label="Ajouter un cour" />
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            {["ALL", "failed", "pending", "paid"].map((statusOption) => (
              <Badge
                key={statusOption}
                text={
                  statusOption === "ALL"
                    ? "Tous"
                    : statusOption.charAt(0).toUpperCase() +
                      statusOption.slice(1)
                }
                className={`cursor-pointer ${
                  paymentStatus === statusOption ? " bg-black text-white" : ""
                }`}
                onClick={() => handleBadgeSelect(statusOption)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex flex-col">
              <label className="text-sm text-slate-600">Date début</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Début"
                className="border rounded-md px-3 py-1 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-slate-600">Date fin</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="Fin"
                className="border rounded-md px-3 py-1 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="h-4 w-4" />
            <DropDown
              value={searchParams.get("sort") || "-createdAt"}
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
                <DropDown.Item value="-amount">amount</DropDown.Item>
              </DropDown.Content>
            </DropDown>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transaction</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payment.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>{payment.paymentId}</TableCell>
                  <TableCell>{payment.studentId.name}</TableCell>
                  <TableCell>{payment.courseId.title}</TableCell>
                  <TableCell>
                    {formatDate(payment.createdAt) || "today"}
                  </TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>
                    <Badge text={payment.paymentStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Affichage de{" "}
            {Math.min((currentPage - 1) * limit + 1, totalPayments)}à{" "}
            {Math.min(currentPage * limit, totalPayments)} sur {totalPayments}
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
}
