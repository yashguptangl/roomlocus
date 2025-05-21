"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ImageUpload from "../../../components/imagesUpload";
import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import imageCompression from "browser-image-compression";
import { useForm } from "react-hook-form";

interface UploadedFiles {
  selfiewithaadhar: File | null;
  frontbuildingview: File | null;
  [key: string]: File | null; // Index signature for other potential keys
}

export default function UploadDocuments() {
  const [ownerId, setOwnerId] = useState<number | null>(null);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
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
      <Content ownerId={ownerId} />
    </Suspense>
  );
}

function Content({ ownerId }: { ownerId: number | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    selfiewithaadhar: null,
    frontbuildingview: null,
  });
  const { handleSubmit , formState : {isSubmitting} } = useForm();


  const handleUpload = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!ownerId || !token) {
        console.log("Owner ID or token is missing");
        return;
      }

      const requiredFiles = ["selfiewithaadhar", "frontbuildingview"];
      for (const fileKey of requiredFiles) {
        if (!uploadedFiles[fileKey]) {
          const readableKey =
            fileKey === "selfiewithaadhar"
              ? "Selfie with Aadhar"
              : "Front Building View";
          alert(`Please upload ${readableKey}!`);
          return;
        }
      }

      // Step 1: Create the verification request
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/self/verification-request`,
        {
          listingId: parseInt(searchParams.get("id") as string),
          listingType: searchParams.get("listingType"),
          listingShowNo: searchParams.get("listingShowNo"),
          adress : searchParams.get("adress"),
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 201) {
        alert("Failed to create verification request. Please try again.");
        return;
      }

      const { imageUrls } = response.data;

      // Step 2: Upload each file using its corresponding presigned URL
      const uploadPromises = Object.keys(imageUrls).map(async (category) => {
        const file = uploadedFiles[category];
        if (file) {
          await axios.put(imageUrls[category], file, {
            headers: {
              "Content-Type": file.type,
            },
          });
        }
      });

      await Promise.all(uploadPromises);

      alert("Your Property is Verified with 4-5 working days");
      router.push("/owner/dashboard");
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Failed to upload images. Please try again.");
    }
  };

  const handleFileChange = async (key: keyof UploadedFiles, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
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
          label="Owner Image with Aadhar Card"
          onFileChange={(file) => handleFileChange("selfiewithaadhar", file)}
        />
        <ImageUpload
          label="Front Building Photo"
          onFileChange={(file) => handleFileChange("frontbuildingview", file)}
        />
        <form onSubmit={handleSubmit(handleUpload)}>
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