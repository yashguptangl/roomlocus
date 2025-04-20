"use client";
import React, { useState } from "react";
import photo from "../assets/photos.png";
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  onFileChange: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, onFileChange }) => {
  const [image, setImage] = useState<string>(photo.src);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
      onFileChange(file); // Notify parent of file change
    }
  };

  return (
    <div className="flex flex-col items-start gap-3 sm:items-center">
    {/* Image Preview Box */}
    <div className="relative w-full ssm:w-24 ssm:h-24 mod:w-28 mod:h-28 ml:w-32 ml:h-32 sm:w-48 sm:h-48 border-2 border-dashed border-gray-400 flex items-center justify-center">
      {image ? (
        <Image
          src={image}
          alt="Uploaded Preview"
          fill
          className="object-cover rounded-md"
        />
      ) : (
        <p className="text-gray-500">No Image</p>
      )}
    </div>
  
    {/* Label */}
    <label className="text-lg font-medium">{label}</label>
  
    {/* File Input */}
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      className="ssm:text-xs sm:text-sm text-gray-900 cursor-pointer mb-8 sm:ml-4"
    />
  </div>
    );
};

export default ImageUpload;
