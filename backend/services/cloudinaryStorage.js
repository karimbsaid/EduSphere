// storage/CloudinaryStorage.js

class CloudinaryStorage {
  constructor(cloudinaryInstance) {
    if (!cloudinaryInstance) throw new Error("Cloudinary instance is required");
    this.cloudinary = cloudinaryInstance;
  }

  async upload(file, folder = "default", type = "auto") {
    console.log("uploade file", file, folder, type);
    const response = await this.cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: type,
      use_filename: true,
      unique_filename: false,
      filename_override: file.name,
      folder,
    });
    console.log(response);
    return response;
  }

  async delete(publicId, resourceType = "image") {
    return await this.cloudinary.api.delete_resources([publicId], {
      type: "upload",
      resource_type: resourceType,
    });
  }

  async move(publicId, newFolder) {
    const newPublicId = `${newFolder}/${publicId.split("/").pop()}`;
    await this.cloudinary.uploader.rename(publicId, newPublicId, {
      overwrite: true,
      invalidate: true,
    });
    return newPublicId;
  }

  async deleteFolder(folderPath) {
    await this.cloudinary.api.delete_resources_by_prefix(folderPath);
    await this.cloudinary.api.delete_folder(folderPath);
  }

  getPublicIdFromUrl(url) {
    const decodedImageUrl = decodeURIComponent(url);
    const parts = decodedImageUrl.split("/upload/")[1];
    const subParts = parts.split("/");
    const publicIdWithExtension = subParts.slice(1).join("/");
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
    return publicId;
  }

  async updateFile({ file, existingUrl, assetFolder, type = "auto" }) {
    if (!file) return null;
    console.log("file", file);
    console.log("existing url", existingUrl);
    console.log("asset folder", assetFolder);
    console.log(type);
    try {
      if (existingUrl) {
        const publicId = this.getPublicIdFromUrl(existingUrl);
        console.log("publicId");

        if (publicId) {
          await this.delete(publicId, type);
        }
      }

      const result = await this.upload(file, assetFolder, type);
      return result.secure_url;
    } catch (error) {
      console.error("Error in Cloudinary file handler:", error);
      throw error;
    }
  }
}

module.exports = CloudinaryStorage;
