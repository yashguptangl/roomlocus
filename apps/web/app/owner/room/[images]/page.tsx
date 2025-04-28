"use client";
import React, { useState, useEffect } from "react";
import ImageUpload from "../../../../components/imagesUpload";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Upload() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({});
  const [roomId] = useState(localStorage.getItem("roomId"));
  const [token, setToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // To disable button during upload

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    console.log(token?.toString());
  }, []);

  const handleUpload = async () => {
    try {
      // Check if all required images are uploaded
      const requiredCategories = ["front", "lobby", "inside", "kitchen", "bathroom", "toilet"];
      const missingCategories = requiredCategories.filter((category) => !uploadedFiles[category]);

      if (missingCategories.length > 0) {
        alert(`Please upload images for: ${missingCategories.join(", ")}`);
        return;
      }

      if (!roomId) {
        console.log("Room ID is missing");
        return;
      }

      setIsUploading(true); // Disable button during upload

      // Fetch presigned URLs from the backend
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/room/images/presigned-urls`,
        { roomId },
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

  const handleFileChange = (key: string, file: File) => {
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG and PNG files are allowed!");
      return;
    }
    setUploadedFiles((prev) => ({ ...prev, [key]: file }));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-blue-500 text-center mb-10">
        Upload Room Images
      </h1>

      <ImageUpload
        label="Front"
        onFileChange={(file) => handleFileChange("front", file)}
      />
      <ImageUpload
        label="Lobby"
        onFileChange={(file) => handleFileChange("lobby", file)}
      />
      <ImageUpload
        label="Inside"
        onFileChange={(file) => handleFileChange("inside", file)}
      />
      <ImageUpload
        label="Kitchen"
        onFileChange={(file) => handleFileChange("kitchen", file)}
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
        label="Care Taker if any"
        onFileChange={(file) => handleFileChange("caretaker", file)}
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