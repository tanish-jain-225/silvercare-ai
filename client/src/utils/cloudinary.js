// cloudinary.js
// Utility to upload images to Cloudinary
import axios from "axios";

export async function uploadToCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/dnihe4ihi/image/upload";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "SilverCare-AI"); // Set this in your Cloudinary settings

  const response = await axios.post(url, formData);
  return response.data.secure_url;
}
