"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ImageUpload from "../../../components/imagesUpload";
import { jwtDecode, JwtPayload } from "jwt-decode";
import imageCompression from "browser-image-compression";

export default function UploadDocuments() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decodedToken= jwtDecode<JwtPayload & { id?: number }>(storedToken);
        console.log("Decoded Token:", decodedToken); // Debugging log to inspect token structure

        // Ensure the token contains the ownerId
        if (decodedToken &&  decodedToken.id) {
          const extractedOwnerId = decodedToken.id;
          setOwnerId(extractedOwnerId);
          console.log("Decoded Owner ID:", extractedOwnerId);
        } else {
          console.log("Owner ID not found in token");
        }
      } catch (err) {
        console.log("Error decoding token:", err);
      }
    } else {
      console.log("Token not found");
    }
  }, []);

  const handleUpload = async () => {
    try {
      if (!ownerId) {
        console.log("Owner ID is missing");
        return;
      }

      // Check if all required files are uploaded
      const requiredFiles = ["ownerImage", "aadharFront", "aadharBack", "otherId"]; // Fixed key
      for (const fileKey of requiredFiles) {
        if (!uploadedFiles[fileKey]) {
          alert(`Please upload ${fileKey.replace(/([A-Z])/g, " $1").toLowerCase()}!`);
          return;
        }
      }

      // Fetch presigned URLs from the backend
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/owner-kyc`,
        { ownerId },
        {
          headers: {
            token : token, // Corrected header
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
        <h2 className="text-xl font-semibold text-blue-500 text-center mb-10">
          Upload Documents for KYC
        </h2>
        <ImageUpload label="Owner Image" onFileChange={(file) => handleFileChange("ownerImage", file)} />
        <ImageUpload label="Aadhar Front" onFileChange={(file) => handleFileChange("aadharFront", file)} />
        <ImageUpload label="Aadhar Back" onFileChange={(file) => handleFileChange("aadharBack", file)} />
        <ImageUpload label="Other Id" onFileChange={(file) => handleFileChange("otherId", file)} />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white p-2 rounded text-center"
        >
          Submit
        </button>
        <button 
          className="bg-gray-600 text-white p-2 rounded text-center ml-10"
          onClick={() => {
            router.push("/owner/dashboard");
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
