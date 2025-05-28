import React from "react";
import Switch from "../../components/Switch";

export default function Permission({
  feature,
  isAuthorized,
  handleTogglePermission,
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <h4 className="font-medium text-gray-900">{feature.name}</h4>
      <Switch
        enabled={isAuthorized()} // <-- CALL the function here
        onChange={() => handleTogglePermission(feature._id)}
      />
    </div>
  );
}
