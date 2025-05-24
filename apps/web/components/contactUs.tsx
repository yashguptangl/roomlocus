export default function Conatct(){
    return (
    <>
     
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 border-b pb-3 text-center">
            Contact Us
          </h1>

          <div className="space-y-6 text-gray-700 text-base sm:text-lg">
            <div>
              <span className="font-semibold">Phone:</span>{" "}
              <a
                href="tel:9045668197"
                className="text-blue-600 hover:underline break-all"
              >
                9045668197
              </a>
            </div>

            <div>
              <span className="font-semibold">Customer Support:</span>{" "}
              <a
                href="mailto:roomlocus@gmail.com"
                className="text-blue-600 hover:underline break-all"
              >
                roomlocus@gmail.com
              </a>
            </div>

            <div>
              <span className="font-semibold">Business Email:</span>{" "}
              <a
                href="mailto:roomlocusbusiness@gmail.com"
                className="text-blue-600 hover:underline break-all"
              >
                roomlocusbusiness@gmail.com
              </a>
            </div>

            <div>
              <span className="font-semibold">Address:</span>
              <p className="mt-1">
                310, Ramdaspur Urf Nagal, Post Nagal, <br />
                District Saharanpur, Uttar Pradesh (247551), India
              </p>
            </div>
          </div>

          <div className="mt-8">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps?q=310,+Ramdaspur+Urf+Nagal,+Saharanpur,+Uttar+Pradesh,+India&output=embed"
              className="w-full h-56 sm:h-64 md:h-72 rounded-lg border"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
     
    </>
  );
}