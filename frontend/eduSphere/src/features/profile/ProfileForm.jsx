/* eslint-disable react/prop-types */
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiCamera } from "react-icons/fi";
import Avatar from "../../components/Avatar";

export default function ProfileForm({
  formData,
  handleSubmit: onSave,
  onClose,
}) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone || "",
      bio: formData.bio || "",
      avatar: formData.avatar || null,
    },
  });

  const avatarFile = watch("avatar");
  const [previewImage, setPreviewImage] = useState(
    formData.avatar || "/placeholder.svg"
  );

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setValue("avatar", file);
    }
  };

  const onSubmit = (data) => {
    onSave(data);
    onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h3 className="text-lg font-semibold">Modifier le profil</h3>
          <p className="text-sm text-gray-500 mt-1">
            Mettez à jour vos informations personnelles ici. Cliquez sur
            enregistrer lorsque vous avez terminé.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6 space-y-4">
          <div className="mx-auto mb-4 flex justify-center">
            <Avatar
              image={previewImage}
              alt="user image"
              size={24}
              onClick={handleImageClick}
            >
              <div className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1 text-white cursor-pointer">
                <FiCamera className="h-4 w-4" />
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
            </Avatar>
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
              {...register("name")}
              type="text"
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
              {...register("email")}
              type="email"
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
              {...register("phone")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              Bio
            </label>
            <textarea
              id="bio"
              {...register("bio")}
              rows={4}
              placeholder="Enter bio"
              className="mt-1 w-full rounded border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
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
  );
}
