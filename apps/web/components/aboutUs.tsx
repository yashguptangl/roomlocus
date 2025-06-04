// components/AboutUs.tsx
export default function AboutUs() {
  return (
    <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-20 xl:px-40 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        <h1 className="text-xl sm:text-4xl font-bold text-center text-gray-800 mb-8 border-b pb-4">
          About Us – Roomlocus
        </h1>

        <div className="space-y-6 text-gray-700 text-base sm:text-lg leading-relaxed">
          <p>
            At <strong>Roomlocus</strong>, we believe finding a place to live shouldn’t be complicated or costly. That’s
            why we created a platform where seekers (tenants) can search for rental properties completely free—no hidden
            fees, no middlemen. Whether you&apos;re looking for a room, flat, PG, or hourly room, we bring you listings in
            one easy-to-use website.
          </p>

          <p>
            <strong>Roomlocus.com</strong> is one of India’s top rental services for rooms, hourly rooms, PGs, houses, and
            flats. Launched in 2025 under the startup Roomlocus, our mission is to solve rental challenges across India by
            offering a safe, fast, and simple platform with advanced features—available across the country.
          </p>

          <p>
            Owners can easily list their properties (Room, PG, Hourly Room, Flat, etc.), and verify them either
            self-initiated or with the help of our agents, guided every step of the way.
          </p>

          <p>
            Our mission is to connect people with affordable housing options while making the process simple, transparent,
            and fast.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-6">How Tenants Can Find Rooms on Roomlocus</h2>

          <ol className="list-decimal list-inside space-y-2 mt-4">
            <li>
              On the homepage, the seeker chooses the type of rental (Room, PG, Flat, Hourly Room), along with city,
              town & sector using 3 dropdowns.
            </li>
            <li>
              Clicking the <strong>“Let’s Search”</strong> button navigates the seeker to a results page with listings and filters.
            </li>
            <li>
              The seeker selects a listing to view detailed information, including images, features, address, offers, and
              nearby details.
            </li>
            <li>
              To save the listing or view the contact details, the seeker must first log in. After login, the profile
              dashboard opens with saved listings in their wishlist.
            </li>
          </ol>

          <p>
            With Roomlocus, finding your ideal rental is just a few clicks away—fast, free, and hassle-free.
          </p>
        </div>
      </div>
    </div>
  );
}
