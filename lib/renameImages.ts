import { ImageFile, Mapping } from "@/types/files";

// Function to rename images based on Excel mapping
export const renameImages = (
  images: ImageFile[],
  mappings: Mapping
): ImageFile[] => {
  return images.map((image) => {
    const originalNameParts = image.originalName.match(/HFYC-(\d+)/); // Extract HFYC number
    if (originalNameParts) {
      const hfycNumber = originalNameParts[1]; // Extracted HFYC number from filename
      const newName = `${mappings["HFYC-" + hfycNumber]}_HFYC${hfycNumber}.jpg`; // Construct new name
      return { ...image, newName }; // Return renamed image
    }
    return image; // Return image unchanged if pattern doesn't match
  });
};