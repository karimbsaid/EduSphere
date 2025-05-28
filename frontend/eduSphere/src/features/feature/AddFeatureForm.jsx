import React, { useState } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function AddFeatureForm({
  onClose,
  SubmitFeature,
  feature = {},
}) {
  const [featureName, setFeatureName] = useState(() => feature.name || "");

  const handleSubmitFeature = () => {
    if (!featureName.trim()) return;
    SubmitFeature(featureName.trim());
    onClose();
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-1">
          {feature.name ? "Edit Feature" : "Add New Feature"}
        </h4>
        <p className="text-sm text-gray-500">
          {feature.name
            ? "Update the Feature name and save your changes."
            : "Enter a name for the new Feature you want to create."}
        </p>
      </div>

      <Input
        label="Feature Name"
        placeholder="e.g. ADD_COURSES, DELETE_COURSES"
        value={featureName}
        onChange={(e) => setFeatureName(e.target.value)}
      />

      <div className="flex justify-between gap-3">
        <Button variant="simple" outline onClick={onClose}>
          Cancel
        </Button>
        <Button variant="simple" onClick={handleSubmitFeature}>
          {feature.name ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
