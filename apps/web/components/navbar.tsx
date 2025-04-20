"use client";
import { useState } from "react";
import logo from "../assets/logo.png";
import userIcon from "../assets/user-icon.png";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="flex h-16 w-full max-w-full bg-blue-400 justify-between p-3">
  {/* Logo Image */}
  <div className="relative h-10 w-32">
    <Image
      src={logo}
      fill
      className="object-contain cursor-pointer"
      alt="logo"
      onClick={() => router.push("/")}
    />
  </div>

  {/* User Icon */}
  <div className="relative h-10 w-10">
    <Image
      src={userIcon}
      fill
      className="object-contain cursor-pointer"
      alt="user-logo"
      onClick={toggleDropdown}
    />
    
    {showDropdown && (
      <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md">
        <ul className="text-black">
          <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
            <Link href="/user/signin">User Login</Link>
          </li>
          <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
            <Link href="/owner/signin">Owner Login</Link>
          </li>
          <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
            <Link href="/agent/signin">Agent Login</Link>
          </li>
        </ul>
      </div>
    )}
  </div>
</div>

  );
}
