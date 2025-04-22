"use client";
import { useEffect, useState } from "react";
import ListingData from "../../../types/listing";
import contactInfo from "../../../types/contactData";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

export default function ListingDetail() {
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [newownerData, setNewOwnerData] = useState<contactInfo | null>(null);
  const [alreadyContactData, setAlreadyContactData] = useState<contactInfo | null>(null);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedListing = sessionStorage.getItem("selectedListing");

    if (storedListing) {
      setListing(JSON.parse(storedListing));
    }

    if (token) {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64 || ""));
      if (payload?.id) {
        contactAlreadyShow(token, payload.id);
      }
    }
  }, []);

  if (!listing) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  async function contact() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/user/signin");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/contact-owner/`, {
        method: 'POST',
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: listing?.id,
          propertyType: listing?.Type,
          ownerId: listing?.ownerId,
          address: listing?.Adress,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/user/signin");
        return;
      }
      if(response.status === 403){
        alert("You can't contact yourself");
        return;
      }
      
      const data = await response.json();
      setNewOwnerData(data);
      setShowContact(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function contactAlreadyShow(token: string, userId: number) {
    try {
      const alreadyContact = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing/contact-logs/${userId}`,
        { headers: { 'token': token, 'Content-Type': 'application/json' } }
      );
      setAlreadyContactData(alreadyContact.data || null);
    } catch (err) {
      console.error("Failed:", err);
    }
  }
  interface Log {
    listingId: number;
    propertyType: string;
    ownerName: string;
    ownerPhone: string;
  }

  const matchedLog: Log | undefined = alreadyContactData?.logs?.find(
    (log: Log) => log.listingId === listing?.id && log.propertyType === listing?.Type
  );


  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-md p-4 shadow-md">
        <div className="flex flex-col lg:flex-row lg:gap-8 gap-6">
          {/* Left Section */}
          <div className="flex-1">
            {listing.images && (
              <>
                {listing.images[0] && (
                  <Image
                    src={listing.images[0]}
                    alt="Room"
                    className="w-full rounded-md object-cover"
                    width={600}
                    height={400}
                  />
                )}
                <div className="flex justify-center gap-2 p-4 flex-wrap">
                  {listing.images.slice(1, 5).map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      className="w-1/4 rounded object-cover"
                      alt="Listing image"
                      width={150}
                      height={100}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">
              {listing.location}, {listing.city}, {listing.townSector}
            </h1>
            <div className="flex items-center gap-4 my-2">
              <span className="text-green-600 font-bold">VERIFIED</span>
              <span className="text-red-500">Security</span>
              <span className="text-purple-500">Maintenance</span>
            </div>
            <h2 className="text-2xl font-bold text-green-600 my-4">
              {listing.MinPrice} - {listing.MaxPrice} Rs
            </h2>

            <div className="mt-6">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <ul className="list-none text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <li>✔ Security: {listing.security} Rs</li>
                <li>✔ Maintenance: {listing.maintenance} Rs</li>
                <li>✔ Notice Period: {listing.noticePeriod}</li>
                <li>✔ Furnishing Type: {listing.furnishingType}</li>
                <li>✔ Accommodation Type: {listing.accomoType}</li>
                <li>✔ Gender Preferences: {listing.genderPrefer}</li>
                <li>✔ Pets Allowed: {listing.petAllowed}</li>
                <li>✔ Power Backup: {listing.powerBackup}</li>
                <li>✔ Water Supply: {listing.waterSupply}</li>
                <li>✔ Flat Type: {listing.flatType}</li>
                <li>✔ Total Flats: {listing.totalFlat}</li>
                <li>✔ Any Offer: {listing.Offer}</li>
              </ul>
            </div>

            <div>
            <p>BHK : {listing.BHK} {listing.Type}</p>
            <p>Adress : {listing.Adress}</p>
            <p>LandMark : {listing.landmark}</p>

          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg">Parking</h3>
            <ul>
              {listing.parking.map((parking : string, index : number) => (
                <li key={index}>&#10003; {parking}</li>
              ))}
            </ul>
          </div>


          <div className="mt-6">
            <h3 className="font-semibold text-lg">Prefer Tenants</h3>
            <ul>
              {listing.preferTenants.map((preferTenants : string, index : number) => (
                <li key={index}>&#10003; {preferTenants}</li>
              ))}
            </ul>
          </div>
        
          <div className="mt-6">
            <h3 className="font-semibold text-lg">Flat Inside Facilities</h3>
            <ul>
              {listing.flatInside.map((inside : string, index : number) => (
                <li key={index}>&#10003; {inside}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg">Prefer Tenants</h3>
            <ul>
              {listing.flatOutside.map((outside :  string , index : number) => (
                <li key={index}>&#10003; {outside}</li>
              ))}
            </ul>
          </div>


            {!matchedLog ? (
              <button
                onClick={contact}
                className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Contact Owner
              </button>
            ) : (
              <div className="mt-6 border p-4 rounded bg-gray-100">
                <p>Owner Name: {matchedLog.ownerName}</p>
                <p>Owner Mobile No: {matchedLog.ownerPhone}</p>
              </div>
            )}

            {showContact && newownerData && (
              <div className="mt-6 border p-4 rounded bg-gray-100">
                <p>Owner Name: {newownerData?.logs?.ownerName}</p>
                <p>Owner Mobile No: {newownerData?.logs?.ownerMobile}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}