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
  [key: string]: File | null;
}

export default function UploadDocuments() {
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [presignedUrls, setPresignedUrls] = useState<{ [key: string]: string } | null>(null);

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
      <Content
        ownerId={ownerId}
        existingRequest={existingRequest}
        presignedUrls={presignedUrls}
        setPresignedUrls={setPresignedUrls}
        setExistingRequest={setExistingRequest}
      />
    </Suspense>
  );
}

function Content({
  ownerId,
  existingRequest,
  presignedUrls,
  setPresignedUrls,
  setExistingRequest,
}: {
  ownerId: number | null;
  existingRequest: any;
  presignedUrls: { [key: string]: string } | null;
  setPresignedUrls: (urls: { [key: string]: string } | null) => void;
  setExistingRequest: (req: any) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    selfiewithaadhar: null,
    frontbuildingview: null,
  });
  const { handleSubmit, formState: { isSubmitting } } = useForm();

  // Helper to get presigned URLs for an existing request
  const fetchPresignedUrls = async (requestId: string) => {
    const token = localStorage.getItem("token");
    const urlRes = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/self/presigned-urls/${requestId}`,
      { headers: { token } }
    );
    setPresignedUrls(urlRes.data.imageUrls);
    return urlRes.data.imageUrls;
  };

  useEffect(() => {
    const fetchExistingRequest = async () => {
      const token = localStorage.getItem("token");
      if (!token || !ownerId) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/self/verified-requests?listingId=${searchParams.get("id")}&listingType=${searchParams.get("listingType")}`,
        { headers: { token } }
      );
      // response.data is array of requests
      const pendingSelf = response.data.find(
        (req: any) =>
          req.status === "PENDING" && req.verificationType === "SELF"
      );
      if (pendingSelf) {
        setExistingRequest(pendingSelf);
        // Optionally, fetch presigned URLs for this request if needed
        if (!pendingSelf.imagesUploaded) {
          // Get presigned URLs for existing request
          const urlRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/self/presigned-urls/${pendingSelf.id}`,
            { headers: { token } }
          );
          setPresignedUrls(urlRes.data.imageUrls);
        }
      } else {
        setExistingRequest(null);
        setPresignedUrls(null);
      }
    };
    fetchExistingRequest();
  }, [ownerId, searchParams]);

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

      let verificationRequestId = existingRequest?.id;
      let imageUrls = presignedUrls;

      // If no existing request, create one and get presigned URLs
      if (!verificationRequestId) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/self/verification-request`,
          {
            listingId: parseInt(searchParams.get("id") as string),
            listingType: searchParams.get("listingType"),
            listingShowNo: searchParams.get("listingShowNo"),
            city: searchParams.get("city"),
            townSector: searchParams.get("townSector"),
            location: searchParams.get("location"),
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

        verificationRequestId = response.data.verification.id;
        imageUrls = response.data.imageUrls;
        setExistingRequest(response.data.verification);
        setPresignedUrls(response.data.imageUrls);
      } else if (!imageUrls) {
        // If request exists but no presigned URLs, fetch them
        imageUrls = await fetchPresignedUrls(verificationRequestId);
      }

      // Step 2: Upload each file using its corresponding presigned URL
      if (!imageUrls) {
        throw new Error("Presigned URLs are missing.");
      }
      const uploadPromises = Object.keys(imageUrls).map(async (category) => {
        const file = uploadedFiles[category];
        const url = imageUrls[category];
        if (file && typeof url === "string") {
          await axios.put(url, file, {
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
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
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