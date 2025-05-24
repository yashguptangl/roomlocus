import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>

      <p className="mb-4">
        <strong>Last Updated:</strong> 11/05/2025
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>
          This website is owned and operated by Roomlocus. These Terms govern your
          use of our site and services. By accessing or using our website, you
          agree to be bound by these Terms. If you disagree with any part of the
          terms, please do not use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Services Offered</h2>
        <p>
          We provide digital rental services, including verified listings for PGs,
          rental flats, and hourly rooms across India.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Use of Website</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>You agree to use this site for lawful purposes only.</li>
          <li>You must not damage, disable, or impair the website.</li>
          <li>
            Providing false information, placing fake properties, or attempting fraud is
            strictly prohibited.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Payments and Refunds</h2>
        <p>
          All payments are processed securely via Razorpay or other authorized
          payment gateways. Refunds may be issued within 7 days of purchase,
          subject to our refund policy and proof of a valid issue.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Privacy</h2>
        <p>
          We respect your privacy and are committed to protecting your personal data.
          Please review our Privacy Policy for more details.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Changes to Terms</h2>
        <p>
          We reserve the right to modify or update these Terms at any time. Any
          changes will be posted on this page with an updated revision date.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
        <p>
          If you have any questions about these Terms, feel free to contact us:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Email: roomlocus@gmail.com</li>
          <li>Phone: +91-9045668197</li>
          <li>
            Address: 310, Ramdaspur Urf Nagal, Post Nagal, Distt Saharanpur, Uttar
            Pradesh (247551) India
          </li>
        </ul>
      </section>
    </div>
  );
}

