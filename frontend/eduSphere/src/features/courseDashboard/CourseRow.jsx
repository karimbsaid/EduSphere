/* eslint-disable react/prop-types */
import { useContext } from "react";
import Table from "../../ui/Table";
import Badge from "../../ui/Badge";
import { Modal, ModalContext } from "../../ui/Modal";
import ConfirmDelete from "../../components/ConfirmDelete";
import RejetCourForm from "../../components/RejetCourForm";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import {
  deleteCourse,
  submitCourseForApproval,
  createCourseUpdate,
  approuveRejetCour,
} from "../../services/apiCourse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-hot-toast";
import DropDown from "../../ui/DropDown";

export default function CourseRow({ course }) {
  const { user } = useAuth();
  const { token } = user;
  const { close } = useContext(ModalContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { setOpenName } = useContext(ModalContext);
  const deleteMutation = useMutation({
    mutationFn: (courseId) => deleteCourse(courseId, token),
    onSuccess: () => {
      toast.success("Cours supprimé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression.");
    },
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      approuveRejetCour(course._id, "published", "Félicitation !", token),
    onSuccess: () => {
      toast.success("Cours approuvé !");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => toast.error("Échec de l’approbation."),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason) =>
      approuveRejetCour(course._id, "rejected", reason, token),
    onSuccess: () => {
      toast.success("Cours rejeté !");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => toast.error("Échec du rejet."),
  });

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
    navigate(`/course/${course._id}/preview`);
  };

  const handleEdit = async () => {
    try {
      if (course.status === "published") {
        if (course.updatedVersionId) {
          navigate(`/my-courses/${course.updatedVersionId}/edit`);
        } else {
          const { data: newDraft } = await createCourseUpdate(
            course._id,
            token
          );
          navigate(`/my-courses/${newDraft._id}`);
        }
      } else {
        navigate(`/my-courses/${course._id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l’édition du cours.");
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(course._id);
  };

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const handleReject = (id, reason) => {
    rejectMutation.mutate(reason);
  };

  const handleSubmitForApproval = async () => {
    try {
      await submitCourseForApproval(course._id, token);
      toast.success("Cours soumis pour approbation !");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible de soumettre le cours.");
    }
  };

  const handleResubmit = async () => {
    try {
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
    course.status !== "pending" &&
    course.totalStudents === 0;
  console.log(
    course.title,
    "delte",
    canDelete,
    course.totalStudents,
    course.status,
    hasPermission("delete_courses"),
    isCourseOwner
  );

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
        <DropDown>
          <DropDown.Button label="actions" />
          <DropDown.Content>
            <DropDown.Item type="action" onClick={handleView}>
              voir
            </DropDown.Item>
            {canEdit && (
              <DropDown.Item type="action" onClick={handleEdit}>
                Éditer
              </DropDown.Item>
            )}
            {canDelete && (
              <>
                <DropDown.Item
                  type="action"
                  onClick={() => setOpenName(`delete-${course._id}`)}
                >
                  Supprimer
                </DropDown.Item>
              </>
            )}

            {canSubmit && (
              <DropDown.Item type="action" onClick={handleSubmitForApproval}>
                Soumettre pour approbation
              </DropDown.Item>
            )}

            {canResubmit && (
              <DropDown.Item type="action" onClick={handleResubmit}>
                Resoumettre
              </DropDown.Item>
            )}

            {showApproveReject && (
              <>
                <DropDown.Item type="action" onClick={handleApprove}>
                  Approuver
                </DropDown.Item>
                <DropDown.Item
                  type="action"
                  onClick={() => setOpenName(`reject-${course._id}`)}
                >
                  Rejeter
                </DropDown.Item>
              </>
            )}
          </DropDown.Content>
        </DropDown>
        {/* <ActionMenu>
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
          </ActionMenu> */}

        <Modal.Window name={`delete-${course._id}`}>
          <ConfirmDelete
            user={course}
            confirmationText={`Je suis sûr de supprimer le cours ${course.title}`}
            onConfirm={handleDelete}
          />
        </Modal.Window>

        <Modal.Window name={`reject-${course._id}`}>
          <RejetCourForm id={course._id} onConfirm={handleReject} />
        </Modal.Window>
      </Table.Cell>
    </Table.Row>
  );
}
