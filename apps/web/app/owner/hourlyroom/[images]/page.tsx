"use client";
import React, { useState, useEffect } from "react";
import ImageUpload from "../../../../components/imagesUpload";
import axios from "axios";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export default function Upload() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({});
  const [hourlyroomId, setHourlyRoomId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // To disable button during upload

  useEffect(() => {
    const token = localStorage.getItem("token");
    const hourlyroomId = localStorage.getItem("hourlyroomId");
    setHourlyRoomId(hourlyroomId ? parseInt(hourlyroomId) : null);
    setToken(token);
    console.log(token?.toString());
  }, []);

  const handleUpload = async () => {
    try {
      // Check if all required images are uploaded
      const requiredCategories = ["front", "inside", "anotherinsideview", "bathroom", "toilet"];
      const missingCategories = requiredCategories.filter((category) => !uploadedFiles[category]);

      if (missingCategories.length > 0) {
        alert(`Please upload images for: ${missingCategories.join(", ")}`);
        return;
      }

      if (!hourlyroomId) {
        console.log("Room ID is missing");
        return;
      }

      setIsUploading(true); // Disable button during upload

      // Fetch presigned URLs from the backend
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/hourlyroom/images/presigned-urls`,
        { hourlyroomId },
        {
          headers: {
            token: token,
          },
        }
      );
      const { presignedUrls } = data;

      // Upload each file using its corresponding presigned URL
      const uploadPromises = Object.keys(presignedUrls).map(async (category) => {
        const file = uploadedFiles[category];
        if (file) {
          await axios.put(presignedUrls[category], file, {
            headers: {
              "Content-Type": file.type,
            },
          });
        }
      });

      await Promise.all(uploadPromises);
      alert("Images uploaded successfully!");
      router.push("/owner/dashboard");
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false); // Re-enable button after upload
    }
  };

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  const handleFileChange = async (key: string, file: File) => {
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG and PNG files are allowed!");
      return;
    }
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 0.5, // reduce to under 500KB
            maxWidthOrHeight: 1024, // resize dimensions if needed
            useWebWorker: true,
          });
    
          setUploadedFiles((prev) => ({ ...prev, [key]: compressedFile }));
        } catch (error) {
          console.error("Image compression error:", error);
          alert("Failed to compress image.");
        }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-blue-500 text-center mb-10">
        Upload Hourly Room Images
      </h1>

      <ImageUpload
        label="Front"
        onFileChange={(file) => handleFileChange("front", file)}
      />
      <ImageUpload
        label="Inside"
        onFileChange={(file) => handleFileChange("inside", file)}
      />
      <ImageUpload
        label="Another Inside View"
        onFileChange={(file) => handleFileChange("anotherinsideview", file)}
      />
      <ImageUpload
        label="Bathroom"
        onFileChange={(file) => handleFileChange("bathroom", file)}
      />
      <ImageUpload
        label="Toilet"
        onFileChange={(file) => handleFileChange("toilet", file)}
      />
      <ImageUpload
        label="manager"
        onFileChange={(file) => handleFileChange("manager", file)}
      />
      <center>
        <button
          onClick={handleUpload}
          disabled={isUploading} // Disable button during upload
          className={`mt-6 py-2 px-4 rounded text-white ${
            isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload Images"}
        </button>
      </center>
    </div>
  );
}