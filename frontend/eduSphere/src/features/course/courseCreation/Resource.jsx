/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Input from "../../../ui/Input";
import FileUploader from "../../../components/FileUploader";
import { HiPlus, HiTrash } from "react-icons/hi2";
import { splitPdfFile } from "../../../services/apiSplitter";
import Modal from "../../../ui/Modal";
import Spinner from "../../../ui/Spinner";

export default function Resource({ resource, setCourseData, resourceIndex }) {
  const handleEditResource = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      resources: prev.resources.map((res, i) => {
        if (i !== resourceIndex) return res;
        return {
          ...res,
          [field]: value,
          ...(prev.isEdit && !res.isNew && { updated: true }),
        };
      }),
    }));
  };

  const handleDeleteResource = () => {
    setCourseData((prev) => ({
      ...prev,
      resources: prev.resources
        .map((res, i) =>
          i === resourceIndex
            ? prev.isEdit && !res.isNew
              ? { ...res, deleted: true }
              : null
            : res
        )
        .filter(Boolean),
    }));
  };

  const handleFileSelect = (file) => {
    handleEditResource("file", file);
  };

  const isPDF = resource.file?.type === "application/pdf";

  return (
    <div className="flex flex-col space-y-4 p-4 border m-2 rounded-md">
      <div className="flex items-center justify-between  space-x-6 ">
        <div className="flex-1">
          <Input
            label="Resource Name"
            placeholder="Entrer nom de resource"
            value={resource.title}
            onChange={(e) => handleEditResource("title", e.target.value)}
          />
        </div>

        <HiTrash
          onClick={handleDeleteResource}
          className="hover:text-red-500"
          size={25}
        />
      </div>

      <span className="text-gray-500">
        Si laissé vide, le nom du fichier sera utilisé
      </span>
      <label className="block text-gray-700 font-medium mb-1">PDF File</label>
      <FileUploader
        acceptedTypes=".pdf , .doc,.docx,.xls,.xlsx"
        file={resource.file || resource.resourceUrl}
        onFileSelect={handleFileSelect}
      />

      {/* {isPDF && (
        <>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id="isSplitter"
              checked={resource.isSpliter === true}
              onChange={(e) =>
                handleEditResource("isSpliter", e.target.checked ? true : false)
              }
              className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
            />
            <label htmlFor="gratuit">extract faq depuis ce document</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Page de début (optionnel)"
              type="number"
              placeholder="ex: 5"
              value={resource.debut_document || ""}
              onChange={(e) =>
                handleEditResource("debut_document", e.target.value)
              }
            />
            <Input
              label="Taille min titre (optionnel)"
              type="number"
              placeholder="ex: 12"
              value={resource.heading_font_threshold || ""}
              onChange={(e) =>
                handleEditResource("heading_font_threshold", e.target.value)
              }
            />
            <Input
              label="Espace entre mots (optionnel)"
              type="number"
              placeholder="ex: 1.5"
              value={resource.space_threshold || ""}
              onChange={(e) =>
                handleEditResource("space_threshold", e.target.value)
              }
            />
          </div>
        </>
      )} */}
    </div>
  );
}
