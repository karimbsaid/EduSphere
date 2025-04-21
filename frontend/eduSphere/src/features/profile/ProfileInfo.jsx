/* eslint-disable react/prop-types */
import { FiMail, FiPhone } from "react-icons/fi";
import Modal from "../../ui/ModalOff";
import Button from "../../ui/Button";
import ProfileForm from "./ProfileForm";
const ProfileInfo = ({ profile, handleSubmit }) => {
  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Informations personnelles</h2>
          <p className="text-gray-500 text-sm mt-1">
            Vos informations personnelles telles qu&apos;elles apparaissent sur
            la plateforme
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start sm:justify-start">
            <div className="relative">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img
                  src={profile.avatar || "/placeholder.svg"}
                  alt={profile.name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold">{profile.name}</h3>
              <div className="flex flex-col gap-2 text-gray-500">
                <div className="flex items-center gap-2">
                  <FiMail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
                <div className=" gap-2">
                  <h3 className="text-lg font-medium">bio </h3>
                  <span>{profile.bio}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t my-6"></div>

          <div className="flex justify-end">
            <Modal>
              <Modal.Open opens="editProfile">
                <Button label="Modifier le profil" size="sm" />
              </Modal.Open>

              <Modal.Window name="editProfile">
                <ProfileForm formData={profile} handleSubmit={handleSubmit} />
              </Modal.Window>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileInfo;
