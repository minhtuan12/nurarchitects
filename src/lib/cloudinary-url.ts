export function buildCloudinaryUrl(publicId: string, transforms: string[] = []) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return "";
  }

  const transformation = transforms.length > 0 ? `${transforms.join(",")}/` : "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}${publicId}`;
}
