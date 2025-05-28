/* eslint-disable react/prop-types */
import React from "react";
import { useSearchParams } from "react-router-dom";
import Badge from "../ui/Badge";

export default function FilterButtons({ options, filterField }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = searchParams.get(filterField) || options[0].value;

  function handleSetFilter(value) {
    searchParams.set(filterField, value);
    searchParams.set("page", 1);
    setSearchParams(searchParams);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Badge
          key={option.value}
          onClick={() => handleSetFilter(option.value)}
          className={`cursor-pointer ${
            option.value === currentFilter
              ? " bg-black text-white p-1 mb-0 rounded-xl"
              : "p-1"
          }`}
          text={option.label}
        />
      ))}
    </div>
  );
}
