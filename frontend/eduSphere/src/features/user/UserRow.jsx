/* eslint-disable react/prop-types */
import React from "react";
import Table from "../../ui/TableOff";
import Badge from "../../ui/Badge";
import Modal from "../../ui/ModalOff";
import Button from "../../ui/Button";
import UserForm from "./UserForm";
import ConfirmDelete from "../../components/ConfirmDelete";
import { useAuth } from "../../context/authContext";
import { deleteUser } from "../../services/apiProfile";
export default function UserRow({ user }) {
  const { user: authenifiedUser } = useAuth();
  const { permissions } = authenifiedUser;
  const { token } = authenifiedUser;
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const badgeVariant = {
    admin: "success",
    instructor: "warning",
    student: "secondary",
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(token, userId);
      console.log("delete user successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <>
      <Table.Row>
        <Table.Cell>
          <div className="flex items-center gap-3">
            {/* <img
                        src={user?.additionalDetail.photo}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      /> */}
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
          </div>
        </Table.Cell>
        <Table.Cell>
          <Badge variant={badgeVariant[user.role]} text={user.role} />
        </Table.Cell>
        <Table.Cell>{formatDate(user.dateInscription)}</Table.Cell>
        <Table.Cell>
          <div className="flex justify-end gap-2">
            {permissions?.includes("editUser") && (
              <Modal>
                <Modal.Open opens="editUser">
                  <Button label="Éditer" />
                </Modal.Open>

                <Modal.Window name="editUser">
                  <UserForm user={user} />
                </Modal.Window>
              </Modal>
            )}
            {permissions?.includes("deleteUser") && (
              <Modal>
                <Modal.Open opens="deleteUser">
                  <Button
                    variant="ghost"
                    label="supprimer"
                    size="sm"
                    className="text-red-500"
                  />
                </Modal.Open>

                <Modal.Window name="deleteUser">
                  <ConfirmDelete
                    user={user}
                    confirmationText={`je suis sure de supprimer l'utilisateur ${user.name}`}
                    onConfirm={() => handleDeleteUser(user._id)}
                  />
                </Modal.Window>
              </Modal>
            )}
          </div>
        </Table.Cell>
      </Table.Row>
    </>
  );
}
