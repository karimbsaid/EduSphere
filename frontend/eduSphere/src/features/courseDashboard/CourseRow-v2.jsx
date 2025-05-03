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
import { deleteCourse } from "../../services/apiCourse";
import { toast } from "react-hot-toast"; // Assure-toi que tu as importé ça en haut

export default function CourseRow({ course }) {
  const { user } = useAuth();
  const { token } = user;
  const { close } = useContext(ModalContext);
  const navigate = useNavigate();

  // Vérification des données pour éviter les erreurs
  if (!course || !user) {
    return null; // Retourne null si course ou user est undefined
  }

  const badgeVariant = {
    published: "success",
    draft: "warning",
    pending: "secondary",
  };

  const badgeCategoryVariant = {
    PROGRAMMING: "success",
    MARKETING: "warning",
    pending: "secondary",
  };

  // Fonctions pour gérer les actions
  const handleView = () => {
    console.log(`Voir le cours ${course._id}`);
    navigate(`/course/${course._id}/preview`);
    // Ajoute ici la logique pour naviguer vers la page du cours
  };

  const handleEdit = () => {
    console.log(`Éditer le cours ${course._id}`);
    // Ajoute ici la logique pour naviguer vers la page d'édition
  };

  const handleDelete = async () => {
    try {
      console.log(`Supprimer le cours ${course._id}`);
      await deleteCourse(course._id, token);
      toast.success("Cours supprimé avec succès !");
      // Ici tu peux aussi rafraîchir la liste des cours si besoin
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible de supprimer le cours.");
    }
  };

  const handleApprove = () => {
    console.log(`Approuver le cours ${course._id}`);
    // Ajoute ici la logique pour mettre à jour le statut à "published"
  };

  const handleReject = (id, reason) => {
    console.log(`Rejeter le cours ${id} avec motif : ${reason}`);
    // Ajoute ici la logique pour mettre à jour le statut à "rejected"
  };

  // Détermine si les actions "Approuver" et "Rejeter" doivent être affichées
  const showApproveReject =
    course.status === "pending" && course.instructor?.name !== user?.name;

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
            <ActionMenu.Item onClick={handleEdit}>Éditer</ActionMenu.Item>
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
            {showApproveReject ? (
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
            ) : null}
          </ActionMenu>
        </Modal>
      </Table.Cell>
    </Table.Row>
  );
}
