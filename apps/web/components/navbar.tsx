"use client";

import { useState, useRef, useEffect } from "react";
import logo from "../assets/logo.png";
import userIcon from "../assets/user-icon.png";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // ✅ Sync state with localStorage changes
  const syncAuth = () => {
    setRole(localStorage.getItem("role"));
    setToken(localStorage.getItem("token"));
  };

  useEffect(() => {
    syncAuth(); // initial load

    const handleStorageChange = () => {
      syncAuth(); // update on localStorage change (in same tab)
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Also update state on every render (useEffect) to catch updates
  useEffect(() => {
    syncAuth();
  }, [typeof window !== "undefined" && localStorage.getItem("role")]);

  // Dropdown outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setRole(null);
    setToken(null);
    router.push("/");
  };

  const getDashboardLink = () => {
    if (role === "user") return "/user/dashboard";
    if (role === "owner") return "/owner/dashboard";
    if (role === "agent") return "/agent/dashboard";
    return "/";
  };

  return (
    <nav className="flex h-16 w-full bg-blue-400 justify-between items-center px-4 shadow-md">
      {/* Logo */}
      <div className="relative h-10 w-32 cursor-pointer" onClick={() => router.push("/")}>
        <Image src={logo} fill className="object-contain" alt="Company Logo" priority />
      </div>

      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <div
          className="relative h-10 w-10 cursor-pointer"
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={showDropdown}
        >
          <Image src={userIcon} fill className="object-contain rounded-full border-2 border-white" alt="User Profile" />
        </div>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-[9.5rem] bg-white shadow-lg rounded-md z-50 overflow-hidden">
            <ul>
              {!token ? (
                <>
                  <li className="hover:bg-gray-100 transition-colors">
                    <Link href="/user/signin" className="block px-3 py-1 text-gray-800" onClick={() => setShowDropdown(false)}>
                      User Login
                    </Link>
                  </li>
                  <li className="hover:bg-gray-100 transition-colors">
                    <Link href="/owner/signin" className="block px-3 py-1 text-gray-800" onClick={() => setShowDropdown(false)}>
                      Owner Login
                    </Link>
                  </li>
                  <li className="hover:bg-gray-100 transition-colors">
                    <Link href="/agent/signin" className="block px-3 py-1 text-gray-800" onClick={() => setShowDropdown(false)}>
                      Agent Login
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="hover:bg-gray-100 transition-colors">
                    <Link href={getDashboardLink()} className="block px-4 py-2 text-gray-800 text-sm font-normal" onClick={() => setShowDropdown(false)}>
                      {role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : ""} Dashboard
                    </Link>
                  </li>
                  <li className="hover:bg-gray-100 transition-colors">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-800 text-sm font-normal">
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
