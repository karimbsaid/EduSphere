import React from "react";
import Permission from "./Permission";

export default function RolePermissions({
  features,
  permissions = [],
  handleTogglePermission,
}) {
  const isAuthorized = (permission) => permission.authorized;

  const isPermissionAuthorized = (permId) => {
    const permission = permissions.find((perm) => perm.feature === permId);
    return permission ? isAuthorized(permission) : false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium text-gray-700">
          Role Feature Permissions
        </h3>
        <p className="text-sm text-gray-500">
          Select the features this role should have access to:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Permission
            key={feature._id}
            feature={feature}
            isAuthorized={() => isPermissionAuthorized(feature._id)}
            handleTogglePermission={handleTogglePermission}
          />
        ))}
      </div>
    </div>
  );
}
