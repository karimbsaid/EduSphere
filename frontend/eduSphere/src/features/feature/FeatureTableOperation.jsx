import React from "react";
import { Modal } from "../../ui/Modal";
import Input from "../../ui/Input";
import { HiMagnifyingGlass, HiPlus } from "react-icons/hi2";
import Button from "../../ui/Button";
import AddFeatureForm from "./AddFeatureForm";
import { createFeature } from "../../services/apiRole";

export default function FeatureTableOperation({
  handleAddFeature,
  searchTerm,
  setSearchTerm,
}) {
  const addFeature = async (name) => {
    const feature = await createFeature("", name);
    handleAddFeature({ name, _id: feature.data.data._id });
  };
  return (
    <Modal>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Features</h1>
          <p className="text-sm text-gray-500">Manage features</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={HiMagnifyingGlass}
            className="w-full md:w-64"
          />

          <Modal.Open opens="addrolemodal">
            <Button variant="simple" className="flex items-center gap-2">
              <HiPlus className="text-lg" />
              Add feature
            </Button>
          </Modal.Open>
        </div>
      </div>

      <Modal.Window name="addrolemodal">
        <AddFeatureForm SubmitFeature={addFeature} />
      </Modal.Window>
    </Modal>
  );
}
