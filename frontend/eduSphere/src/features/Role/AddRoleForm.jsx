import React, { useState } from "react";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

export default function AddRoleForm({ onClose, SubmitRole, role = {} }) {
  const [roleName, setRoleName] = useState(() => role.name || "");

  const handleSubmitRole = () => {
    if (!roleName.trim()) return;
    SubmitRole(roleName.trim());
    onClose();
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-1">
          {role.name ? "Edit Role" : "Add New Role"}
        </h4>
        <p className="text-sm text-gray-500">
          {role.name
            ? "Update the role name and save your changes."
            : "Enter a name for the new role you want to create."}
        </p>
      </div>

      <Input
        label="Role Name"
        placeholder="e.g. Instructor, Admin, Student"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
      />

      <div className="flex justify-between gap-3">
        <Button variant="simple" outline onClick={onClose}>
          Cancel
        </Button>
        <Button variant="simple" onClick={handleSubmitRole}>
          {role.name ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
