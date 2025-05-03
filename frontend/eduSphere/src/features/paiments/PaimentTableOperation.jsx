import React, { useEffect, useRef, useState } from "react";
import DropDown from "../../ui/DropDownn";
import { FaFilter, FaSearch } from "react-icons/fa";
import FilterButtons from "../../components/FilterButtons";
import Input from "../../ui/Input";
import { useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";

export default function PaimentTableOperation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [querySearch, setQuerySearch] = useState("");
  const inputRef = useRef(null);
  const sort = searchParams.get("sort");
  const rawStartDate = searchParams.get("startDate");
  const rawEndDate = searchParams.get("endDate");

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const startDate = rawStartDate ? new Date(rawStartDate) : firstDayOfMonth;
  const endDate = rawEndDate ? new Date(rawEndDate) : today;

  const filterOptions = [
    { value: "all", label: "Tous" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
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
          <h1>Gestion des paiments</h1>
          <h2>Gérez les paiments de la plateforme</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              ref={inputRef}
              placeholder="Rechercher des transactions..."
              className="pl-8 w-full"
              value={querySearch}
              onChange={(e) => setQuerySearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex  justify-between items-center">
        <FilterButtons options={filterOptions} filterField="paymentStatus" />
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">Date début</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                searchParams.set("startDate", date.toISOString());
                setSearchParams(searchParams);
              }}
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
              onChange={(date) => {
                searchParams.set("endDate", date.toISOString());
                setSearchParams(searchParams);
              }}
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
              <DropDown.Item value="-amount">amount</DropDown.Item>
            </DropDown.Content>
          </DropDown>
        </div>
      </div>
    </>
  );
}
