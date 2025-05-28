import Table from "../../ui/Table";
import Button from "../../ui/Button";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "../../ui/Modal";
import { deleteFeature, updateFeature } from "../../services/apiRole";
import ConfirmDelete from "../../components/ConfirmDelete";
import AddFeatureForm from "./AddFeatureForm";

export default function FeatureRow({
  feature,
  handleupdateFeature,
  handleDeleteFeature,
}) {
  const handleEditFeature = async (name) => {
    await updateFeature("", name, feature._id);
    handleupdateFeature({ ...feature, name });
  };
  const DeleteFeature = async () => {
    await deleteFeature("", feature._id);
    handleDeleteFeature(feature._id);
  };

  return (
    <>
      <Modal>
        <Table.Row>
          <Table.Cell>
            <div className="font-medium text-gray-900">{feature.name}</div>
          </Table.Cell>
          <Table.Cell>{feature.createdAt || "01-01-2025"}</Table.Cell>
          <Table.Cell>
            <div className="flex justify-start space-x-2">
              <Modal.Open opens="editFeatureModal">
                <Button>
                  <HiOutlinePencil />
                </Button>
              </Modal.Open>
              <Modal.Open opens="confirmDeleteFeature">
                <Button>
                  <HiOutlineTrash color="red" />
                </Button>
              </Modal.Open>
            </div>
          </Table.Cell>
        </Table.Row>

        <Modal.Window name="editFeatureModal">
          <AddFeatureForm feature={feature} SubmitFeature={handleEditFeature} />
        </Modal.Window>
        <Modal.Window name="confirmDeleteFeature">
          <ConfirmDelete
            confirmationText={`supprimer le feature ${feature.name}`}
            onConfirm={DeleteFeature}
          />
        </Modal.Window>
      </Modal>
    </>
  );
}
