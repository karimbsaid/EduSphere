import Button from "../../ui/Button";
import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";
import Input from "../../ui/Input";
import { Modal } from "../../ui/Modal";
import AddRoleForm from "./AddRoleForm";
import { createRole } from "../../services/apiRole";

export default function RoleTableOperation({
  handleAddRole,
  searchTerm,
  setSearchTerm,
}) {
  const AddRole = async (name) => {
    const role = await createRole("", name);
    handleAddRole({ name, _id: role.data.data._id });
  };

  return (
    <Modal>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        {/* Left Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500">
            Manage roles and their permissions
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input using custom Input */}
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={HiMagnifyingGlass}
            className="w-full md:w-64"
          />

          {/* Add Role Button */}
          <Modal.Open opens="addrolemodal">
            <Button variant="simple" className="flex items-center gap-2">
              <HiPlus className="text-lg" />
              Add Role
            </Button>
          </Modal.Open>
        </div>
      </div>

      <Modal.Window name="addrolemodal">
        <AddRoleForm SubmitRole={AddRole} />
      </Modal.Window>
    </Modal>
  );
}
