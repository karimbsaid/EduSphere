/* eslint-disable react/prop-types */
import React, { useContext, useState } from "react";
import Resource from "./Resource";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";
import { HiPlus, HiTrash } from "react-icons/hi2";
import { splitPdfFile } from "../../../services/apiSplitter";
import Input from "../../../ui/Input";
import { CourseContext } from "../../../context/courseContext";

export default function CourseResources() {
  const { state, dispatch } = useContext(CourseContext);

  const { resources } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isThereFileToSplit = resources.some((res) => res.isSpliter === true);
  const handleFaqChange = (index, field, value) => {
    dispatch({
      type: "UPDATE_FAQ_FIELD",
      index,
      field,
      value,
    });
  };

  const handleAddFAQ = () => {
    dispatch({ type: "ADD_FAQ" });
  };

  const handleDeleteFaq = (index) => {
    dispatch({ type: "DELETE_FAQ", index });
  };

  const handleOpenModal = async () => {
    try {
      setIsLoading(true);
      let allFaqs = [];

      for (const res of resources) {
        if (res.isSpliter === true) {
          const extractedSections = await splitPdfFile(res);
          allFaqs = allFaqs.concat(extractedSections);
        }
      }

      dispatch({ type: "SET_FAQ", payload: allFaqs });
    } catch (error) {
      console.error("Error splitting PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = () => {
    dispatch({ type: "ADD_RESOURCE" });
  };

  return (
    <div>
      {resources.map((res, index) => {
        return <Resource resource={res} key={index} resourceIndex={index} />; // Added return here
      })}
      <Button
        label="add new Resource"
        className="bg-black text-white"
        onClick={handleAddResource}
      />

      <button
        onClick={handleOpenModal}
        disabled={isLoading}
        className={`px-4 py-2 bg-blue-500 text-white rounded ${
          !isThereFileToSplit && "hidden"
        }`}
      >
        {isLoading ? "Analyse en cours..." : "Prévisualiser les sections"}
      </button>
      <div>
        {/*<Modal>
          <Modal.Trigger
            className={`px-4 py-2 bg-blue-500 text-white rounded ${
              isLoading && "hidden"
            }`}
          >
            prévisualiser les faq
          </Modal.Trigger>
          <Modal.Content>
            <Modal.Header>Éditer les sections</Modal.Header>
            <Modal.Body>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {courseData.faq?.map((faq, index) => (
                  <div
                    key={index}
                    className="group relative space-y-2 p-4 border rounded"
                  >
                    <Input
                      label="Titre de la section"
                      value={faq.title}
                      onChange={(e) =>
                        handleFaqChange(index, "title", e.target.value)
                      }
                    />
                    <textarea
                      className="w-full p-2 border rounded"
                      rows="4"
                      value={faq.content}
                      onChange={(e) =>
                        handleFaqChange(index, "content", e.target.value)
                      }
                    />
                    <button
                      onClick={() => handleDeleteFaq(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddFAQ}
                className="mt-4 flex items-center gap-2 text-blue-500 hover:text-blue-700"
              >
                <HiPlus size={18} />
                Ajouter une section
              </button>
            </Modal.Body>
            <Modal.Footer>
              <Modal.CloseButton className="px-4 py-2 bg-gray-500 text-white rounded">
                Fermer
              </Modal.CloseButton>
            </Modal.Footer>
          </Modal.Content>
        </Modal>*/}
      </div>
    </div>
  );
}
