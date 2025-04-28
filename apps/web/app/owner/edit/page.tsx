"use client";
import { useState, useEffect, Suspense } from "react";
import { useForm,SubmitHandler } from "react-hook-form";
import { useRouter , useSearchParams } from "next/navigation";

interface FormData {
  security?: string;
  maintenance?: string;
  offer?: string;
  minPrice?: string;
  maxPrice?: string;
  listingShowNo?: string;
  careTaker?: string;
  bedCount?: number;
  noOfGuests?: number;
  manager?: string;
}

function EditFormContent() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormData>();
  const searchParams = useSearchParams();
  
  const listingType = searchParams.get("listingType");
  const listingId = searchParams.get("listingId");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    } else {
      console.log("Token not found");
    }
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/edit-listing`, {
        method: "PUT",
        headers: {
          token: token || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          listingType,
          listingId,
        }),
      });

      if (response.status === 200) {
        alert("Listing updated successfully");
        router.push("/owner/dashboard");
      } else if (response.status === 403) {
        alert("You can only update listing once in a month");
        router.push("/owner/dashboard");
      }
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-xl sm:text-3xl font-semibold text-blue-500 mb-4 text-center">
        Edit {listingType} Details
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
       {/* Conditional Fields based on listingType */}
       {listingType === "flat" && (
                    <div className="flex flex-col gap-4 mt-4">
                        {[
                            { label: "Security", name: "security", type: "text" },
                            { label: "Maintenance", name: "maintenance", type: "text" },
                            { label: "Offer if any", name: "offer", type: "text" },
                            { label: "Min Price", name: "minPrice", type: "text" },
                            { label: "Max Price", name: "maxPrice", type: "text" },
                            { label: "Contact Number", name: "listingShowNo", type: "text" },
                        ].map(({ label, name, type }) => (
                            <div key={name} className="flex items-center gap-4">
                                <label className="text-sm w-1/3 sm:text-xl">{label}</label>
                                <input
                                    {...register(name as keyof FormData)}
                                    type={type}
                                    className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                                />
                            </div>
                        ))}
                        <div className="flex items-center gap-4">
                            <label className="text-sm w-1/3 sm:text-xl">Care Taker</label>
                            <input
                                {...register("careTaker")}
                                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                                placeholder="Name if any"
                            />
                        </div>
                    </div>
                )}

{listingType === "pg" && (
                    <div className="flex flex-col gap-4 mt-4">
                        {[
                            { label: "Security", name: "security", type: "text" },
                            { label: "Maintenance", name: "maintenance", type: "text" },
                            { label: "Min Price", name: "minPrice", type: "text" },
                            { label: "Max Price", name: "maxPrice", type: "text" },
                            { label: "Offer if any", name: "offer", type: "text" },
                            { label: "Bed Count", name: "bedCount", type: "number" },
                            { label: "Contact Number", name: "listingShowNo", type: "text" },
                        ].map(({ label, name, type }) => (
                            <div key={name} className="flex items-center gap-4">
                                <label className="text-sm w-1/3 sm:text-xl">{label}</label>
                                <input
                                    {...register(name as keyof FormData)}
                                    type={type}
                                    className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                                />
                            </div>
                        ))}
                        <div className="flex items-center gap-4">
                            <label className="text-sm w-1/3 sm:text-xl">Care Taker</label>
                            <input
                                {...register("careTaker")}
                                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                                placeholder="Name if any"
                            />
                        </div>
                    </div>
                )}

                {listingType === "room" && (
                    <div className="flex flex-col gap-4 mt-4">
                        {[
                            { label: "Security", name: "security", type: "text" },
                            { label: "Maintenance", name: "maintenance", type: "text" },
                            { label: "Min Price", name: "minPrice", type: "text" },
                            { label: "Max Price", name: "maxPrice", type: "text" },
                            { label: "Offer if any", name: "offer", type: "text" },
                            { label: "Contact Number", name: "listingShowNo", type: "text" },
                        ].map(({ label, name, type }) => (
                            <div key={name} className="flex items-center gap-4">
                                <label className="text-sm w-1/3 sm:text-xl">{label}</label>
                                <input
                                    {...register(name as keyof FormData)}
                                    type={type}
                                    className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                                />
                            </div>
                        ))}
                        <div className="flex items-center gap-4">
                            <label className="text-sm w-1/3 sm:text-xl">Care Taker</label>
                            <input
                                {...register("careTaker")}
                                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                                placeholder="Name if any"
                            />
                        </div>
                    </div>
                )}

                {listingType === "hourlyroom" && (
                    <div className="flex flex-col gap-4 mt-4">
                        {[
                            { label: "Min Price", name: "minPrice", type: "text" },
                            { label: "Max Price", name: "maxPrice", type: "text" },
                            { label: "Number of Guests", name: "noOfGuests", type: "number" },
                            { label: "Manager Name", name: "manager", type: "text" },
                            { label: "Manager Contact", name: "listingShowNo", type: "number" },
                        ].map(({ label, name, type }) => (
                            <div key={name} className="flex items-center gap-4">
                                <label className="text-sm w-1/3 sm:text-xl">{label}</label>
                                <input
                                    {...register(name as keyof FormData)}
                                    type={type}
                                    className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                                />
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className="bg-blue-400 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                        Update Listing
                    </button>
                </div>
      </form>
    </div>
  );
}

export default function Edit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditFormContent />
    </Suspense>
  );
}