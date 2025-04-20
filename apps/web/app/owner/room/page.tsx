"use client";
import React, { useState, useEffect } from "react";
import ComboBox from "../../../components/searchBox";
import { citiesData } from "../../../data/cities";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FormData } from "../../../types/formData";

export default function RoomListingForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [token, setToken] = useState<string | null>(null);


  const handleTownChange = (town: React.SetStateAction<string>) => {
    setSelectedTown(town);
  };

  const handleCityChange = (city: React.SetStateAction<string>) => {
    setSelectedCity(city);
    setSelectedTown(""); // Reset town/sector when city changes
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    console.log(token?.toString());
  }, []);


  const onSubmit = async (data: FormData) : Promise<void> => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...data, city: selectedCity, townSector: selectedTown,

      };
      const response = await axios.post("http://localhost:3001/api/v1/owner/room",
        formData,
        {
          headers: {
            'token': token,
          },
        },
      );
      console.log(response);
      if (response.status === 201) {
        localStorage.setItem("roomId", response.data.room.id);
        router.push("/owner/room/images");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to list flat. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-xl sm:text-3xl font-semibold text-blue-500 mb-4 text-center">
        I&apos;m listing my Room
      </h2>
      <h3 className="text-lg sm:text-2xl font-semibold">I&apos;m Owner</h3>

      {/* Location and Details */}
      <form onSubmit={handleSubmit(onSubmit)} >
        <div className="flex flex-col gap-4 mt-4">
          {/* City ComboBox */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            <label className="text-sm sm:text-xl">City</label>
            <ComboBox
              options={Object.keys(citiesData)} // City options from citiesData (keys)
              placeholder="City"
              onChange={handleCityChange}
            />
            {errors.city && <span className="text-red-500 text-sm">City is required</span>}
          </div>

          {/* Town & Sector ComboBox */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            <label className="text-sm sm:text-xl">Town & Sector</label>
            <ComboBox
              options={citiesData[selectedCity] || []} // Filtered town/sector options based on selected city
              placeholder="Town & Sector"
              onChange={handleTownChange}
            />
            {errors.city && <span className="text-red-500 text-sm">Town & Sector is required</span>}
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {[
            { label: "Location", name: "location", type: "text" },
            { label: "Landmark", name: "landmark", type: "text" },
            { label: "BHK" , name: "Bhk", type: "text" },
            { label: "Minimum Price", name: "minprice", type: "text" },
            { label: "Maximum Price", name: "maxprice", type: "text" },
            { label: "Age of Property", name: "ageOfProperty", type: "text" },
            { label: "Water Supply", name: "waterSupply", type: "text" },
            { label: "Power Backup", name: "powerBackup", type: "text" },
            { label: "Notice Period", name: "noticePeriod", type: "text" },
            { label: "Security", name: "security", type: "text" },
            { label: "Maintenance", name: "maintenance", type: "text" },
            { label: "Total Room", name: "totalRoom", type: "number" },
            { label: "Offer if any", name: "offer", type: "text" },
            { label: "Contact Number", name: "listingShowNo", type: "text" },
          ].map(({ label, name, type }) => (
            <div
              key={name}
              className="flex items-center gap-4"
            >
              <label htmlFor={name} className="text-sm w-1/3 sm:text-xl">
                {label}
              </label>
              <input
                {...register(name as keyof FormData, { required: `${label} is required` })}
                id={name}
                type={type}
                name={name}
                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base placeholder-gray-500"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              {errors[name as keyof FormData] && <span className="text-red-500 text-sm">{String(errors[name as keyof FormData]?.message)}</span>}
            </div>
          ))}
           <div className="flex items-center gap-4">
            <label htmlFor="description" className="text-sm w-1/3 sm:text-xl">Care Taker if any</label>
            <input
              id="description"
              {...register("careTaker")}
              name="careTaker"
              className="w-2/3  sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base resize-none placeholder-gray-500"
              placeholder="Care Taker Name"
            />
            {errors.careTaker && <span className="text-red-500 text-sm">{String(errors.careTaker?.message)}</span>}
           </div>

          {/* Full Address Textarea */}
          <div className="flex items-center gap-4">
            <label className="text-sm w-1/3 sm:text-xl" htmlFor="text-fill" >Full Address</label>
            <textarea
              id="text-fill"
              {...register("adress")}
              name="adress"
              className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-2 text-sm sm:text-base resize-none placeholder-gray-500"
              rows={4}
              placeholder="Enter full address"
            />
            {errors.adress && <span className="text-red-500 text-sm">{String(errors.adress?.message)}</span>}
          </div>
        </div>


        {/* Radio Buttons */}
        {[
          {
            title : "Available For *",
            options : ["Montly Basis" , "Yearly Basis" ],
            name : "RoomAvailable",
          },
          {
            title: "Furnishing Type *",
            options: ["Fully furnished", "Semi furnished", "Unfurnished"],
            name: "furnishingType",
          },
          {
            title: "Accomodation Type",
            options: ["Independent", "Apartment"],
            name: "accomoType",
          },
          { title: "Pets Allowed", options: ["Yes", "No"], name: "petsAllowed" },
          {
            title: "Gender Preferences",
            options: ["Male", "Female", "Both M & F"],
            name: "genderPrefer",
          },
          {
            title: "Room Type",
            options: ["Shared Room", "Private Room"],
            name: "roomType",
          },
        ].map(({ title, options, name }) => (
          <div key={name} className="mt-4">
            <p className="text-sm sm:text-xl">{title}</p>
            <div className="flex flex-col gap-2 mt-2 text-blue-400">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm sm:text-base font-medium "
                >
                  <input
                    {...register(name as keyof FormData, { required: `${title} is required` })}
                    type="radio"
                    name={name}
                    value={option} />
                  {option}
                </label>
              ))}
            </div>
            {errors[name as keyof FormData] && <span className="text-red-500 text-sm">{String(errors[name as keyof FormData]?.message)}</span>}
          </div>
        ))}

        {[
          {
            title: "Parking",
            options: ["Car", "Bike"],
            name: "parking",
            isMultiple: true,
          },
          {
            title: "Prefer Tenant Type",
            options: ["Family", "Bachelors", "Girls", "Boys", "Professionals"],
            name: "preferTenants",
            isMultiple: true,
          },
          {
            title: "Room Inside Facility",
            name: "insideFacilities",
            options: ["Fan", "TV", "AC", "Table", "Chair", "Clipboard"],
            isMultiple: true,
          },
          {
            title: "Room Outside Facility",
            name: "outsideFacilities",
            options: ["Gym", "School", "Park", "Lift", "Near Metro Station"],
            isMultiple: true,
          },
        ].map(({ title, options, name, isMultiple }) => (
          <div key={name} className="mt-4">
            <p className="text-sm sm:text-xl">{title}</p>
            <div className="flex flex-col gap-2 mt-2">
              {options.map((option) => (
                <div
                  key={option}
                  className="flex items-center gap-2 text-sm sm:text-base font-medium text-blue-400"
                >
                  <input
                    {...register(name as keyof FormData)}
                    type={isMultiple ? "checkbox" : "radio"} // Adjust type for multiple selections
                    value={option}
                  />
                  {option}
                </div>
              ))}
            </div>
            {errors[name as keyof FormData] && (
              <span className="text-red-500 text-sm">{String(errors[name as keyof FormData]?.message)}</span>
            )}
          </div>
        ))}


        {/* Submit and Cancel buttons */}
        <div className="flex justify-center sm:justify-start gap-4 mt-6">
          <button
            disabled={isSubmitting}
            type="submit"
            className="bg-blue-400 hover:bg-blue-600 text-white py-2 px-4 rounded">
            {isSubmitting ? "Next..." : "Next"}
          </button>
          <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}