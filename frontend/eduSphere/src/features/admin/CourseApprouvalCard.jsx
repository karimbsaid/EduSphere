/* eslint-disable react/prop-types */
import { FaBookOpen } from "react-icons/fa"; // Assure-toi que tu as bien installé react-icons
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Modal from "../../ui/ModalOff";
import ConfirmDelete from "../../components/ConfirmDelete";
import { useState } from "react";
import RejetCourForm from "../../components/RejetCourForm";

const CourseApprovalCard = ({ course, isAdmin = true, onConfirm }) => {
  const { id, title, instructor } = course;
  const { name: instructorName } = instructor;
  return (
    <>
      <div className="flex items-center gap-4 mb-4 p-4 border rounded-lg w-fit">
        <div className="w-12 h-12 bg-amber-100 rounded-md flex items-center justify-center">
          <FaBookOpen className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <div className="text-sm text-slate-500">
            Soumis par: {instructorName}
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Modal>
              <Modal.Open opens="refuse">
                <Button
                  variant="ghost"
                  label="Refuser"
                  size="sm"
                  className="text-red-500"
                />
              </Modal.Open>

              <Modal.Window name="refuse">
                <RejetCourForm id={id} onConfirm={onConfirm} />
              </Modal.Window>
            </Modal>

            <Button
              label="Approuver"
              onClick={() => onConfirm(id, "", "published")}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CourseApprovalCard;
