import React from "react";

export default function Refund() {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-20">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
                    Privacy Policy Payment and Refund
                </h1>
                <p className="text-gray-600 text-center">Post Date: 13.06.2025</p>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mt-4">Annual Subscription Fee</h2>
                    <p className="text-gray-600 mt-2 text-justify">
                        The current annual subscription fee charged from the owner is <span className="font-bold">Rs 365</span> as per Roomlocus policy after verifying the property of the owner. Property verification charges may change every year.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mt-4">Privacy Commitment</h2>
                    <p className="text-gray-600 mt-2 text-justify">
                        We value your privacy and are committed to protecting your personal data in accordance with the Digital Personal Data Protection Act (DPDPA), 2023, and other applicable Indian laws. This Privacy Policy outlines how we collect, use, store, and disclose your personal information, particularly in relation to payments and refunds, when you use our website, mobile application, or services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mt-4">1. Information We Collect</h2>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 text-justify">
                        <li>
                            <span className="font-medium">Personal Details:</span> Name, email address, phone number, address, and details provided during account creation.
                        </li>
                        <li>
                            <span className="font-medium">Financial Information:</span> Bank account details, credit/debit card information (masked), payment transaction data, and GSTIN (if applicable), collected when you make payments for our Service.
                        </li>
                        <li>
                            <span className="font-medium">Identification Information:</span> Government-issued ID (e.g., Aadhaar, passport, or other ID details) for verification, if required. Providing Aadhaar is voluntary.
                        </li>
                        <li>
                            <span className="font-medium">Transaction Data:</span> Details of payments and refund requests, including reference numbers and payment history.
                        </li>
                        <li>
                            <span className="font-medium">Technical Data:</span> IP address, browser type, device information, and cookies to enhance your experience and track website usage.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mt-4">2. How We Use Your Information</h2>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 text-justify">
                        <li>To process payments for verification property transactions and buy lead transactions.</li>
                        <li>To facilitate refunds as per our Refund Policy.</li>
                        <li>To verify your identity for secure transactions, in compliance with applicable laws.</li>
                        <li>To communicate with you about your account, refunds, or policy updates.</li>
                        <li>To improve our website and services through analytics and user feedback.</li>
                        <li>To comply with legal obligations, such as tax reporting or fraud prevention.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mt-4">3. Payment Processing</h2>
                    <p className="text-gray-600 mt-2 text-justify">
                        We use third-party payment gateways to process payments. These gateways have their own privacy policies, which we recommend you review. Your payment data is encrypted per the Payment Card Industry Data Security Standard (PCI-DSS) and is not stored on our servers after the transaction is complete. We only retain transaction data necessary for refunds or dispute resolution.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mt-4">4. Sharing Your Information</h2>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 text-justify">
                        <li>
                            <span className="font-medium">Service Providers:</span> Third-party payment processors, IT service providers, and customer support teams to facilitate payments and refunds.
                        </li>
                        <li>
                            <span className="font-medium">Property Owners:</span> Limited information (e.g., name, contact details) to confirm payment transactions or resolve disputes.
                        </li>
                        <li>
                            <span className="font-medium">Legal Authorities:</span> When required by law, such as for fraud prevention or tax compliance.
                        </li>
                    </ul>
                    <p className="text-gray-600 mt-2 text-justify">
                        We do not sell or share your personal information for marketing purposes without your consent.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mt-4">5. Policy Updates</h2>
                    <p className="text-gray-600 mt-2 text-justify">
                        We may update this Privacy Policy periodically. Changes will be posted on our website, and significant updates will be communicated via email. Your continued use of our services constitutes acceptance of the updated policy.
                    </p>
                </section>
            </div>
        </div>
    );
}
