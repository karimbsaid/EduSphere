/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import Table from "../../ui/TableOff";
import Badge from "../../ui/Badge";
import { Modal, ModalContext } from "../../ui/ModalOff";
import ConfirmDelete from "../../components/ConfirmDelete";
import ActionMenu from "../../ui/ActionMenu";
import RejetCourForm from "../../components/RejetCourForm";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import {
  deleteCourse,
  submitCourseForApproval,
  createCourseUpdate,
  approuveRejetCour,
} from "../../services/apiCourse";
import { toast } from "react-hot-toast";

export default function CourseRow({ course }) {
  const { user } = useAuth();
  const { token } = user;
  const { close } = useContext(ModalContext);
  const navigate = useNavigate();

  // Vérification des données pour éviter les erreurs
  if (!course || !user) {
    return null;
  }

  const isAdmin = user.role.name === "Admin";
  const isInstructor = user.role.name === "Instructor";
  const isCourseOwner = isInstructor && course.instructor?._id === user._id;

  const badgeVariant = {
    published: "success",
    draft: "warning",
    pending: "secondary",
    rejected: "danger",
  };

  const badgeCategoryVariant = {
    PROGRAMMING: "success",
    MARKETING: "warning",
    pending: "secondary",
  };

  // Fonction pour vérifier les permissions
  const hasPermission = (permission) => {
    return (
      user?.role?.permissions?.some(
        (perm) => perm.feature.name === permission && perm.authorized
      ) || false
    );
  };

  // Fonctions pour gérer les actions
  const handleView = () => {
    console.log(`Voir le cours ${course._id}`);
    navigate(`/course/${course._id}/preview`);
  };

  const handleEdit = async () => {
    console.log(`Éditer le cours ${course._id}`);
    try {
      if (course.status === "published") {
        // Si le cours est publié, vérifier s'il y a déjà une copie brouillon
        if (course.updatedVersionId) {
          // Rediriger vers la copie brouillon existante
          navigate(`/my-courses/${course.updatedVersionId}/edit`);
        } else {
          // Créer une nouvelle copie brouillon
          const { data: newDraft } = await createCourseUpdate(
            course._id,
            token
          );
          console.log(newDraft);
          navigate(`/my-courses/${newDraft._id}`);
        }
      } else {
        // Si le cours est en draft ou rejected, modifier directement
        navigate(`/my-courses/${course._id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l’édition du cours.");
    }
  };

  const handleDelete = async () => {
    try {
      console.log(`Supprimer le cours ${course._id}`);
      await deleteCourse(course._id, token);
      toast.success("Cours supprimé avec succès !");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible de supprimer le cours.");
    }
  };

  const handleApprove = async () => {
    console.log(`Approuver le cours ${course._id}`);
    const { status } = await approuveRejetCour(
      course._id,
      "published",
      "félication votre cour est en public",
      token
    );
    if (status === "success") {
      toast.success("Cours approuvé avec succès !");
    } else {
      toast.success("Cours approuvé fail !");
    }

    // Logique pour approuver (déjà gérée côté backend)
  };

  const handleReject = async (id, reason) => {
    console.log(`Rejeter le cours ${id} avec motif : ${reason}`);
    const { status } = await approuveRejetCour(
      course._id,
      "rejected",
      reason,
      token
    );
    if (status === "success") {
      toast.success("Cours rejecté avec succès !");
    } else {
      toast.success("Cours rejecté fail !");
    }
    // Logique pour rejeter (déjà gérée côté backend)
  };

  const handleSubmitForApproval = async () => {
    try {
      console.log(`Soumettre le cours ${course._id} pour approbation`);
      await submitCourseForApproval(course._id, token);
      toast.success("Cours soumis pour approbation !");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible de soumettre le cours.");
    }
  };

  const handleResubmit = async () => {
    try {
      console.log(`Resoumettre le cours ${course._id}`);
      await submitCourseForApproval(course._id, token);
      toast.success("Cours resoumis pour approbation !");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible de resoumettre le cours.");
    }
  };

  // Conditions pour afficher les boutons
  const showApproveReject =
    isAdmin &&
    hasPermission("approve_reject_courses") &&
    course.status === "pending";
  const canEdit =
    isCourseOwner &&
    hasPermission("edit_courses") &&
    course.status !== "pending"; // Disponible sauf si pending
  const canDelete =
    isCourseOwner &&
    hasPermission("delete_courses") &&
    course.status !== "pending" && // Non disponible si pending
    course.totalStudents === 0; // Non disponible si totalStudents > 0
  const canSubmit =
    isCourseOwner && hasPermission("edit_courses") && course.status === "draft"; // Disponible si draft
  const canResubmit =
    isCourseOwner &&
    hasPermission("edit_courses") &&
    course.status === "rejected"; // Disponible si rejected

  return (
    <Table.Row key={course._id}>
      <Table.Cell>{course.title}</Table.Cell>
      <Table.Cell>{course.instructor?.name || "N/A"}</Table.Cell>
      <Table.Cell>
        <Badge
          variant={badgeCategoryVariant[course.category] || "secondary"}
          text={course.category || "N/A"}
        />
      </Table.Cell>
      <Table.Cell>{course.price ?? 0}</Table.Cell>
      <Table.Cell>
        <Badge
          variant={badgeVariant[course.status] || "secondary"}
          text={course.status || "N/A"}
        />
      </Table.Cell>
      <Table.Cell className="text-right">
        <Modal>
          <ActionMenu>
            <ActionMenu.Item onClick={handleView}>Voir</ActionMenu.Item>

            {canEdit && (
              <ActionMenu.Item onClick={handleEdit}>Éditer</ActionMenu.Item>
            )}

            {canDelete && (
              <>
                <Modal.Open opens={`delete-${course._id}`}>
                  <ActionMenu.Item>Supprimer</ActionMenu.Item>
                </Modal.Open>
                <Modal.Window name={`delete-${course._id}`}>
                  <ConfirmDelete
                    user={course}
                    confirmationText={`Je suis sûr de supprimer le cours ${course.title}`}
                    onConfirm={handleDelete}
                  />
                </Modal.Window>
              </>
            )}

            {canSubmit && (
              <ActionMenu.Item onClick={handleSubmitForApproval}>
                Soumettre pour approbation
              </ActionMenu.Item>
            )}

            {canResubmit && (
              <ActionMenu.Item onClick={handleResubmit}>
                Resoumettre
              </ActionMenu.Item>
            )}

            {showApproveReject && (
              <>
                <ActionMenu.Item onClick={handleApprove}>
                  Approuver
                </ActionMenu.Item>
                <Modal.Open opens={`reject-${course._id}`}>
                  <ActionMenu.Item>Rejeter</ActionMenu.Item>
                </Modal.Open>
                <Modal.Window name={`reject-${course._id}`}>
                  <RejetCourForm id={course._id} onConfirm={handleReject} />
                </Modal.Window>
              </>
            )}
          </ActionMenu>
        </Modal>
      </Table.Cell>
    </Table.Row>
  );
}
