/* eslint-disable react/prop-types */
import { useContext } from "react";
import Input from "../../../ui/Input";
import FileUploader from "../../../components/FileUploader";
import { HiTrash } from "react-icons/hi2";
import { CourseContext } from "../../../context/courseContext";

export default function Resource({ resource, resourceIndex }) {
  const { dispatch } = useContext(CourseContext);

  const handleEditResource = (field, value) => {
    dispatch({ type: "UPDATE_RESOURCE_FIELD", resourceIndex, field, value });
  };

  const handleDeleteResource = () => {
    dispatch({ type: "DELETE_RESOURCE", resourceIndex });
  };

  const handleFileSelect = (file) => {
    handleEditResource("file", file);
  };

  const isPDF = resource.file?.type === "application/pdf";
  console.log(resource.file);
  console.log("isPDF", isPDF);

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

      <label className="block text-gray-700 font-medium mb-1">PDF File</label>
      <FileUploader
        acceptedTypes=".pdf , .doc,.docx,.xls,.xlsx"
        file={resource.file || resource.resourceUrl}
        onFileSelect={handleFileSelect}
      />

      {isPDF && (
        <>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id="isSplitter"
              checked={resource.isSplitter === true}
              onChange={(e) =>
                handleEditResource(
                  "isSplitter",
                  e.target.checked ? true : false
                )
              }
              className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-black checked:border-black"
            />
            <label htmlFor="gratuit">extract faq depuis ce document</label>
          </div>
          {resource.isSplitter && (
            <div className="flex flex-wrap">
              <Input
                label="Page de début "
                type="number"
                placeholder="ex: 5"
                value={resource.debut_document || ""}
                onChange={(e) =>
                  handleEditResource("debut_document", e.target.value)
                }
              />
              <Input
                label="Taille min titre "
                type="number"
                placeholder="ex: 12"
                value={resource.heading_font_threshold || ""}
                onChange={(e) =>
                  handleEditResource("heading_font_threshold", e.target.value)
                }
              />
              <Input
                label="Espace entre mots "
                type="number"
                placeholder="ex: 1.5"
                value={resource.space_threshold || ""}
                onChange={(e) =>
                  handleEditResource("space_threshold", e.target.value)
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
