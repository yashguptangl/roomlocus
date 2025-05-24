import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
          Privacy Policy
        </h1>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">1. Purpose</h2>
          <p className="text-gray-600 mt-2">
            This policy describes how Roomlocus collects, uses, and protects personal information obtained from users of our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">2. Information We Collect</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Personal identification information (name, email, phone number)</li>
            <li>Token and tracking technologies</li>
            <li>Form Information for Future Growth Plan</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">3. How We Collect Information</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Forms completed on our website</li>
            <li>User account registration</li>
            <li>Website analytics tools</li>
            <li>Token and similar technologies</li>
            <li>Images and multimedia content</li>
            <li>Display content and user interactions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">4. Use of Information</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Provide and improve our services</li>
            <li>Communicate with users</li>
            <li>Personalize user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">5. Sharing of Information</h2>
          <p className="text-gray-600 mt-2">
            We do not sell your personal data. We are not sharing information with third-party service providers under strict confidentiality and with authorities when required by law. Roomlocus uses industry-standard security measures to protect your information. Roomlocus use your personal data to enhace company services and provide a better user experience. 
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">6. Data Security</h2>
          <p className="text-gray-600 mt-2">
            We implement security measures to protect personal data, including encryption, access controls, and regular audits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">7. User Rights</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Access, update, or delete their personal data</li>
            <li>Opt out of communications</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">8. Changes to This Policy</h2>
          <p className="text-gray-600 mt-2">
            We may update this policy from time to time. Any changes will be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700">Contact Us</h2>
          <p className="text-gray-600 mt-2">
            Email: <a href="mailto:roomlocus@gmail.com" className="text-blue-600">roomlocus@gmail.com</a><br />
            Phone: +91-9045668197<br />
            Address: 310, Ramdaspur Urf Nagal, Post Nagal,<br />
            Distt Saharanpur, Uttar Pradesh (247551) India
          </p>
        </section>
      </div>
    </div>
  );
}
