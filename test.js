const url =
  "https://res.cloudinary.com/dzrdmikt2/video/upload/v1742312593/courses/blockchain/section-1-hello/twgpof1blk6wuqa8jm1u.mp4";

// On récupère la partie après "/upload/"
const parts = url.split("/upload/")[1];
const subParts = parts.split("/");
const publicIdWithExtension = subParts.slice(1);

console.log(publicIdWithExtension);
