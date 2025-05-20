'use client';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  name: string;
  email: string;
  password: string;
  image?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: TokenPayload = jwtDecode(token);
      setUser(decoded);
      if (decoded.image) {
        setImage(decoded.image);
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      // 🔁 You can send `file` to backend here (e.g. upload to Cloudinary/S3)
    }
  };

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {image ? (
            <img
              src={image}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-4 border-blue-500"
            />
          ) : (
            <label className="w-full h-full flex flex-col justify-center items-center border-2 border-dashed border-gray-400 rounded-full cursor-pointer">
              <span className="text-sm text-gray-500">Upload</span>
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-400 text-sm mt-1">
          Password: <span className="font-mono">{user.password}</span>
        </p>
      </div>
    </div>
  );
}
