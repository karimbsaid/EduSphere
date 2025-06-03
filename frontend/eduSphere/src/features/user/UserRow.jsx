/* eslint-disable react/prop-types */
import Table from "../../ui/Table";
import Badge from "../../ui/Badge";
import { Modal } from "../../ui/Modal";
import Button from "../../ui/Button";
import UserForm from "./UserForm";
import ConfirmDelete from "../../components/ConfirmDelete";
import { useAuth } from "../../context/authContext";
import { deleteUser, editUser } from "../../services/apiProfile";
import {
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi2";
import BlockUser from "./BlockUser";
import { formatDate } from "../../utils/formatDate";
import { useSearchParams } from "react-router-dom";
export default function UserRow({ user, UpdateUser, onRefetch }) {
  const { user: authenifiedUser } = useAuth();
  const { token } = authenifiedUser;
  const [searchParams, setSearchParams] = useSearchParams();

  const badgeVariant = {
    admin: "success",
    instructor: "warning",
    student: "secondary",
  };
  const badgeStatusVariant = {
    active: "success",
    blocked: "ghost",
  };
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(token, userId);
      onRefetch();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleBlockUser = async () => {
    if (user) {
      if (user.status === "active") {
        const { user: updatedUser } = await editUser(token, {
          status: "blocked",
          _id: user._id,
        });
        UpdateUser({ ...updatedUser, role: user.role });
      } else {
        const { user: updatedUser } = await editUser(token, {
          status: "active",
          _id: user._id,
        });
        UpdateUser({ ...updatedUser, role: user.role });
      }
    }
  };

  return (
    <>
      <Modal>
        <Table.Row>
          <Table.Cell>
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
          </Table.Cell>
          <Table.Cell>
            <Badge
              variant={badgeVariant[user?.role?.name]}
              text={user?.role?.name}
            />
          </Table.Cell>
          <Table.Cell>
            <Badge
              variant={badgeStatusVariant[user.status || "active"]}
              text={user.status || "active"}
            />
          </Table.Cell>
          <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
          <Table.Cell>
            <div className="flex justify-center items-center gap-2">
              <Modal.Open opens="editUser">
                <Button>
                  <HiOutlinePencil />
                </Button>
              </Modal.Open>
              <Modal.Open opens="blockUser">
                {user.status === "active" ? (
                  <HiOutlineLockOpen />
                ) : (
                  <HiOutlineLockClosed />
                )}
              </Modal.Open>
              <Modal.Open opens="deleteUser">
                <Button>
                  <HiOutlineTrash color="red" />
                </Button>
              </Modal.Open>
            </div>

            <Modal.Window name="editUser">
              <UserForm user={user} handleUpdateUser={UpdateUser} />
            </Modal.Window>

            <Modal.Window name="blockUser">
              <BlockUser selectedUser={user} blockUser={handleBlockUser} />
            </Modal.Window>

            <Modal.Window name="deleteUser">
              <ConfirmDelete
                user={user}
                confirmationText={`je suis sure de supprimer l'utilisateur ${user.name}`}
                onConfirm={() => handleDeleteUser(user._id)}
              />
            </Modal.Window>
          </Table.Cell>
        </Table.Row>
      </Modal>
    </>
  );
}
