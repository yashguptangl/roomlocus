"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import banglore from "../assets/Banglore.jpg";
import dehradun from "../assets/dehradun.jpg";
import delhi from "../assets/delhi.jpg";
import gaziabad from "../assets/gaziabad.jpg";
import hydrabad from "../assets/Hydrabad.jpg";
import gurugram from "../assets/Gurugram.jpg";
import mumbai from "../assets/Mumbai.jpg";
import noida from "../assets/Noida.jpg";
import rent from "../assets/ad-rent.png";
import ComboBox from "../components/searchBox";
import Navbar from "../components/navbar";
import MainFooter from "../components/mainfooter";
import { citiesData } from "../data/cities";

export default function Home() {
  const [lookingFor, setLookingFor] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTownSector, setSelectedTownSector] = useState("");
  const [isMounted, setIsMounted] = useState(false); // Track if the component is mounted
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // Set mounted state to true after the component mounts
  }, []);

  const handleTownChange = (townSector: string) => {
    setSelectedTownSector(townSector);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedTownSector("");
  };

  const handleSearch = () => {
    router.push(`/${lookingFor}?look=${lookingFor}&city=${selectedCity}&townSector=${selectedTownSector}`);
  };

  if (!isMounted) {
    return (
      <div>
        {/* Render a placeholder or skeleton UI to avoid mismatches */}
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex overflow-x-auto scrollbar-hide gap-3 ml-1 mt-4 px-4 snap-x snap-mandatory lg:pl-20">
        {[banglore, dehradun, delhi, gaziabad, hydrabad, gurugram, mumbai, noida].map((image, index) => (
          <div
            key={index}
            className="relative h-24 w-[calc(100%/3)] mod:w-[calc(100%/3)] md:w-[calc(100%/6)] lg:w-[calc(100%/9)] flex-shrink-0"
          >
            <Image
              src={image}
              alt={`City ${index + 1}`}
              fill
              priority
              className="object-cover snap-start "
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center mt-14 space-y-4 text-black-300 px-4">
        <p className="bg-gray-500 px-3 py-1 rounded text-left relative font-medium ssm:mr-[11.5rem] mod:mr-[15.5rem] ml:mr-[18.5rem] sm:mr-[18rem] top-4">
          For Rent
        </p>
        <div className="flex items-center border border-gray-300 rounded-lg p-3 max-w-[18rem] ssm:min-w-[19.5rem] mod:min-w-[22.2rem] sm:min-w-[24rem] ml:min-w-[24rem] md:min-w-[24rem]">
          <select
            className="flex-grow bg-transparent text-gray-600 outline-none"
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
          >
            <option value="" disabled>
              Looking for
            </option>
            <option value="pg">PG</option>
            <option value="room">Room</option>
            <option value="flat">Flat</option>
            <option value="officespace">Office Space</option>
          </select>
        </div>

        <ComboBox options={Object.keys(citiesData)} placeholder="City" onChange={handleCityChange} />
        <ComboBox options={selectedCity && citiesData[selectedCity] ? citiesData[selectedCity] : []} placeholder="Town & Sector" onChange={handleTownChange} />

        <button className="w-full sm:w-96 bg-blue-300 text-white p-1 text-lg sm:text-xl rounded-lg" onClick={handleSearch}>
          Let&apos;s Search ...
        </button>

        <div className="h-6 w-40 ml-28 ssm:ml-32 mod:ml-44 ml:ml-56 relative">
          <Image
            src={rent}
            alt="sec"
            layout="fill"
            objectFit="contain"
            onClick={() => router.push("/owner/signin")}
          />
        </div>

        <div className="text-end mt-4">
          <p className="text-blue-300 text-lg ml-20 ssm:ml-6 mod:ml-20 sm:ml-28 ml:ml-32 sm:text-lg md:text-xl font-semibold">
            India&apos;s Largest Room Collection
          </p>
          <p className="font-semibold text-lg sm:text-end md:text-lg ">Trust on Verified Rooms</p>
        </div>
      </div>
      <MainFooter />
    </>
  );
}
