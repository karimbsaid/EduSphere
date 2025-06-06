const cloudinary = require("../config/cloudinary");

// Télécharger un fichier sur Cloudinary
const uploadToCloudinary = async (file, folder) => {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "auto",
    use_filename: true,
    unique_filename: false,
    filename_override: file.name,
    folder,
  });
};

// Supprimer une ressource sur Cloudinary
const deleteResourceFromCloudinary = async (publicId, resource_type) => {
  return await cloudinary.api.delete_resources([publicId], {
    type: "upload",
    resource_type: resource_type,
  });
};

// Déplacer une ressource vers un autre dossier
const moveResourceOnCloudinary = async (publicId, newFolder) => {
  const newPublicId = `${newFolder}/${publicId.split("/").pop()}`;
  await cloudinary.uploader.rename(publicId, newPublicId, {
    overwrite: true,
    invalidate: true,
  });
  return newPublicId;
};

// Supprimer un dossier et son contenu
const deleteFolderOnCloudinary = async (folderPath) => {
  await cloudinary.api.delete_resources_by_prefix(folderPath);
  await cloudinary.api.delete_folder(folderPath);
};

const getPublicId = (url) => {
  const decodedImageUrl = decodeURIComponent(url);
  const parts = decodedImageUrl.split("/upload/")[1];
  const subParts = parts.split("/");
  const publicIdWithExtension = subParts.slice(1).join("/");
  const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
  return publicId;
};

const handleCloudinaryFileUpdate = async ({
  file,
  existingUrl,
  assetFolder,
  type = "image",
}) => {
  if (!file) return null;

  try {
    if (existingUrl) {
      const publicId = getPublicId(existingUrl);
      if (publicId) {
        await deleteResourceFromCloudinary(publicId, type);
      }
    }

    const result = await uploadToCloudinary(file, assetFolder, type);
    return result.secure_url;
  } catch (error) {
    console.error("Error in Cloudinary file handler:", error.message);
    throw error;
  }
};

// Exporter toutes les fonctions
module.exports = {
  handleCloudinaryFileUpdate,
  uploadToCloudinary,
  deleteResourceFromCloudinary,
  moveResourceOnCloudinary,
  deleteFolderOnCloudinary,
  getPublicId,
};
