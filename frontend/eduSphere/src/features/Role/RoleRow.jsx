import React, { useEffect, useState } from "react";
import Table from "../../ui/Table";
import Button from "../../ui/Button";
import { HiOutlineKey, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "../../ui/Modal";
import RolePermissions from "./RolePermissions";
import {
  deleteRole,
  getPermissionsByRole,
  updatePermission,
  updateRole,
} from "../../services/apiRole";
import AddRoleForm from "./AddRoleForm";
import ConfirmDelete from "../../components/ConfirmDelete";

export default function RoleRow({
  role,
  features,
  handleupdateRole,
  handleDeleteRole,
}) {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const getRolePermissions = async () => {
      const reponse = await getPermissionsByRole(role._id, "");
      setPermissions(reponse);
    };
    getRolePermissions();
  }, []);
  const handleEditRole = async (name) => {
    await updateRole("", name, role._id);
    handleupdateRole({ ...role, name });
  };
  const DeleteRole = async () => {
    await deleteRole("", role._id);
    handleDeleteRole(role._id);
  };

  const findPermssionByFeatureId = (featureId) => {
    return permissions.find((perm) => perm.feature === featureId);
  };
  const handleTogglePermission = async (featureId) => {
    setPermissions((prevPermissions) => {
      const existing = prevPermissions.find(
        (perm) => perm.feature === featureId
      );
      if (existing) {
        return prevPermissions.map((perm) =>
          perm.feature === featureId
            ? { ...perm, authorized: !perm.authorized }
            : perm
        );
      } else {
        return [
          ...prevPermissions,
          {
            role: role._id,
            feature: featureId,
            authorized: true,
          },
        ];
      }
    });

    const permission = findPermssionByFeatureId(featureId);
    if (permission) {
      return await updatePermission(
        "",
        role._id,
        featureId,
        !permission.authorized
      );
    }
    return await updatePermission("", role._id, featureId, true);
  };
  return (
    <>
      <Modal>
        <Table.Row>
          <Table.Cell>
            <div className="font-medium text-gray-900">{role.name}</div>
          </Table.Cell>
          <Table.Cell>{role.createdAt || "01-01-2025"}</Table.Cell>
          <Table.Cell>
            <div className="flex justify-start space-x-2">
              <Modal.Open opens="permission_modal">
                <Button>
                  <HiOutlineKey />
                </Button>
              </Modal.Open>
              <Modal.Open opens="editrolemodal">
                <Button>
                  <HiOutlinePencil />
                </Button>
              </Modal.Open>
              <Modal.Open opens="confirmdeleterole">
                <Button>
                  <HiOutlineTrash color="red" />
                </Button>
              </Modal.Open>
            </div>
          </Table.Cell>
        </Table.Row>
        <Modal.Window name="permission_modal">
          <RolePermissions
            permissions={permissions}
            features={features}
            handleTogglePermission={handleTogglePermission}
          />
        </Modal.Window>
        <Modal.Window name="editrolemodal">
          <AddRoleForm role={role} SubmitRole={handleEditRole} />
        </Modal.Window>
        <Modal.Window name="confirmdeleterole">
          <ConfirmDelete
            confirmationText={`supprimer le role ${role.name}`}
            onConfirm={DeleteRole}
          />
        </Modal.Window>
      </Modal>
    </>
  );
}
