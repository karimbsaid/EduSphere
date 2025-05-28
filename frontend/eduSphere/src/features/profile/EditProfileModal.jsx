/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { FiCamera, FiX } from "react-icons/fi";

const EditProfileModal = ({
  isOpen,
  formData,
  handleChange,
  handleSubmit,
  setIsDialogOpen,
}) => {
  const [previewImage, setPreviewImage] = useState(
    formData.avatar || "/placeholder.svg"
  );

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleChange("avatar", file);
      setPreviewImage(imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">Modifier le profil</h3>
            <p className="text-sm text-gray-500 mt-1">
              Mettez à jour vos informations personnelles ici. Cliquez sur
              enregistrer lorsque vous avez terminé.
            </p>
          </div>
          <button
            onClick={() => setIsDialogOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="mx-auto mb-4 flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1 text-white cursor-pointer"
                >
                  <FiCamera className="h-4 w-4" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Enter bio "
                rows={4}
                className="mt-1 w-full rounded border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 p-6 border-t">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditProfileModal;
