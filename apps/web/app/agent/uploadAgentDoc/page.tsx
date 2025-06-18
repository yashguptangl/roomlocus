"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "../../../components/imagesUpload";
import axios from "axios";
import imageCompression from "browser-image-compression";

export default function UploadDocuments() {
  const router = useRouter();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({});
  const [token, setToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    const agentId = localStorage.getItem("agentId");
    setAgentId(agentId);
  }, []);

  const handleUpload = async () => {
    try {
      if (!agentId) {
        console.log("Agent ID is missing");
        return;
      }

      // Check if all required files are uploaded
      const requiredFiles = ["agentImage", "aadharFront", "aadharBack", "panCard" , "passbook"];
      for (const fileKey of requiredFiles) {
        if (!uploadedFiles[fileKey]) {
          alert(`Please upload ${fileKey.replace(/([A-Z])/g, ' $1').toLowerCase()}!`);
          return;
        }
      }

      // Fetch presigned URLs from the backend
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/upload-agent-doc`,
        { agentId },
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
      router.push("/agent/bankDetail");
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Failed to upload images. Please try again.");
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-500">
          Upload Documents
        </h2>
        <ImageUpload
          label="Agent Image"
          onFileChange={(file) => handleFileChange("agentImage", file)}
        />
        <ImageUpload
          label="Aadhar Front"
          onFileChange={(file) => handleFileChange("aadharFront", file)}
        />
        <ImageUpload
          label="Aadhar Back"
          onFileChange={(file) => handleFileChange("aadharBack", file)}
        />
        <ImageUpload
          label="Pan Card"
          onFileChange={(file) => handleFileChange("panCard", file)}
        />
        <ImageUpload
          label="Bank Passbook"
          onFileChange={(file) => handleFileChange("passbook", file)}
        />
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="bg-blue-500 text-white p-2 rounded mt-4 w-full"
        >
          {isUploading ? "Uploading..." : "Upload Documents"}
        </button>
      </div>
    </div>
  );
}
