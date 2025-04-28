"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ImageUpload from "../../../components/imagesUpload";
import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useForm } from "react-hook-form";

export default function UploadDocuments() {
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { handleSubmit, formState: { isSubmitting } } = useForm();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      try {
        const decodedToken = jwtDecode<JwtPayload & { id?: number }>(token);
        if (decodedToken && decodedToken.id) {
          setOwnerId(decodedToken.id);
        } else {
          console.log("ID not found in token");
        }
      } catch (err) {
        console.log("Error decoding token:", err);
      }
    } else {
      console.log("Token not found");
    }
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content ownerId={ownerId} token={token} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </Suspense>
  );
}

function Content({ ownerId, token, handleSubmit, isSubmitting }: { ownerId: number | null; token: string | null; handleSubmit : any ; isSubmitting: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});

  const handleUpload = async () => {
    try {
      console.log("Uploaded Files:", uploadedFiles); // Debugging log
      if (!ownerId) {
        console.log("Owner ID is missing");
        return;
      }

      const requiredFiles = ["selfieWithOwner", "frontbuildingview"]; // Match backend keys
      for (const fileKey of requiredFiles) {
        if (!uploadedFiles[fileKey]) {
          const readableKey =
            fileKey === "selfieWithOwner" ? "Selfie with Owner" : "Front Building View";
          alert(`Please upload ${readableKey}!`);
          return;
        }
      }

      const requestId = searchParams.get("id");
      const agentId = searchParams.get("agentId");

      if (!requestId) {
        alert("Missing requestId or agentId");
        return;
      }

      // Step 1: Send a request to update the verification status and get presigned URLs
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/agent-accept-request/?requestId=${requestId}&agentId=${agentId}`,
        {},
        {
          headers: {
            token: token || "",
          },
        }
      );

      const { urls } = data;

      // Step 2: Upload each file using its corresponding presigned URL
      const uploadPromises = Object.keys(urls).map(async (category) => {
        const file = uploadedFiles[category]; // Ensure keys match backend expectations
        if (file) {
          await axios.put(urls[category], file, {
            headers: {
              "Content-Type": file.type,
            },
          });
        }
      });

      await Promise.all(uploadPromises);

      alert("Property is Verified By Agent and Company will check after some time");
      router.push("/agent/dashboard");
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Failed to upload images. Please try again.");
    }
  };

  const handleFileChange = (key: string, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG and PNG files are allowed!");
      return;
    }
    setUploadedFiles((prev) => {
      const updatedFiles = { ...prev, [key]: file };
      console.log("Updated uploadedFiles state:", updatedFiles); // Debugging log
      return updatedFiles;
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-500">
          Upload Documents
        </h2>
        <form onSubmit={handleSubmit(handleUpload)}>
          <ImageUpload
        label="Selfie With Owner"
        onFileChange={(file) => handleFileChange("selfieWithOwner", file)} // Fixed key name
          />
          <ImageUpload
        label="Other ID"
        onFileChange={(file) => handleFileChange("frontbuildingview", file)} // Fixed key name
          />
          <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white p-2 rounded mt-4 w-full"
          >
        {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
