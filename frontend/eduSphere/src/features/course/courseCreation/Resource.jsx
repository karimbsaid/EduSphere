/* eslint-disable react/prop-types */
import React from "react";
import Input from "../../../ui/Input";
import FileUploader from "../../../components/FileUploader";
import { HiTrash } from "react-icons/hi2";

export default function Resource({ resource, setCourseData, resourceIndex }) {
  const handleEditResource = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      resources: prev.resources.map((res, i) => {
        if (i !== resourceIndex) return res;
        return {
          ...res,
          [field]: value,
          ...(prev.isEdit ? { updated: true } : {}),
        };
      }),
    }));
  };

  const handleDeleteResource = () => {
    setCourseData((prev) => ({
      ...prev,
      resources: prev.resources.filter((res, i) => {
        if (i !== resourceIndex) return true;
        return prev.isEdit && !res.isNew ? { ...res, deleted: true } : false;
      }),
    }));
  };

  const handleFileSelect = (file) => {
    handleEditResource("file", file);
  };

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
    </div>
  );
}
