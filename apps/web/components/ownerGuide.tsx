import { useState } from "react";

const guideContent = {
    en: [
        "According to the guidelines of ROOMLOCUS, there is currently a fee of 5 rupees per lead, which is counted when a customer clicks on the owner's contact details.",
        "The customer details displayed in the owner's lead dashboard are only valid for 15 days, after which they are automatically deleted.",
        "When there are 0 leads, the profile of all your properties gets automatically turned off and will not be shown on the listing page of the WEBSITE. Please continue to buy leads.",
    ],
    hi: [
        "ROOMLOCUS के दिशानिर्देशों के अनुसार, वर्तमान में प्रति लीड 5 रुपये शुल्क है, जो तब गिना जाता है जब कोई ग्राहक मालिक के संपर्क विवरण पर क्लिक करता है।",
        "मालिक के लीड डैशबोर्ड में दिखाए गए ग्राहक विवरण केवल 15 दिनों के लिए मान्य हैं, उसके बाद वे स्वचालित रूप से हटा दिए जाते हैं।",
        "जब लीड्स 0 हो जाती हैं, तो आपकी सभी संपत्तियों की प्रोफ़ाइल स्वचालित रूप से बंद हो जाती है और वेबसाइट की लिस्टिंग पेज पर नहीं दिखाई जाएगी। कृपया लीड्स खरीदना जारी रखें।",
    ],
};

export default function OwnerGuide() {
    const [lang, setLang] = useState<"en" | "hi">("en");

    return (
        <div className="mt-4 w-full max-w-2xl mx-auto flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="w-full flex justify-end mb-4">
                <button
                    className={`px-1 py-0.5 rounded-l ${lang === "en" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setLang("en")}
                >
                    Eng
                </button>
                <button
                    className={`px-1 py-0.5 rounded-r ${lang === "hi" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setLang("hi")}
                >
                    हिन्दी
                </button>
            </div>
            <div className="pb-8 w-full">
                <h2 className="text-base m-1 font-semibold">
                    {lang === "en" ? "For Lead Service" : "लीड सेवा के लिए"}
                </h2>
                <ul className="space-y-4 list-disc pl-5">
                    {guideContent[lang].map((text, idx) => (
                        <li key={idx} className="text-sm sm:text-base text-blue-400 text-justify">
                            {text}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="pb-8 w-full">
                <h2 className="text-base m-1 font-semibold">
                    {lang === "en" ? "Property Verification Service" : "प्रॉपर्टी वेरिफिकेशन सेवा"}
                </h2>
                <ul className="space-y-4 list-disc pl-5">
                    {lang === "en" ? (
                        <>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Verified Property shows trust and our customers rely only on verified properties. This improves the ranking of the property listing and shows it at the top.
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                On owner KYC, you will get 10 extra leads.
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                The owner can change rent, security, maintenance, etc. details of their property only once per month.
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                The owner can manually turn ON or OFF their property to hide or show it in the listing.
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Property verification is an annual process and will be renewed every year upon payment. After one year, verified property will automatically become Not Verified. The property will be re-verified after annual fee payment and self-verification or agent verification.
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Self-verification by owner may take up to 7 working days by Roomlocus Admin Team, while agent verification is instant and the agent will also advertise your property, bringing more customers.
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Property will be shown in the Near me option only after verification.
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                ROOMLOCUS के दिशानिर्देशों के अनुसार, Verified Property विश्वास को दर्शाती है और हमारे ग्राहक केवल Verified प्रॉपर्टी पर ही भरोसा करते हैं। इससे प्रॉपर्टी लिस्टिंग की रैंकिंग बेहतर होती है और यह टॉप पर दिखाई देती है।
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Owner KYC होने पर आपको 10 अतिरिक्त लीड्स मिलेंगी।
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Owner अपनी प्रॉपर्टी का किराया, सिक्योरिटी, मेंटिनेंस आदि विवरण केवल महीने में एक बार बदल सकता है।
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Owner अपनी प्रॉपर्टी को मैन्युअली ON या OFF करके लिस्टिंग में दिखा या छुपा सकता है।
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                प्रॉपर्टी वेरिफिकेशन एक वार्षिक प्रक्रिया है, जो हर साल पेमेंट करने पर रिन्यू होगी। एक वर्ष बाद Verified प्रॉपर्टी अपने आप Not Verified हो जाएगी। वार्षिक फीस और Self verification या Agent verification के बाद प्रॉपर्टी फिर से Verified हो जाएगी।
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Owner द्वारा Self verification कराने पर Roomlocus Admin Team को 7 कार्य दिवस लग सकते हैं, जबकि Agent verification तुरंत होता है और एजेंट आपकी प्रॉपर्टी का प्रचार भी करेगा, जिससे अधिक ग्राहक मिल सकते हैं।
                            </li>
                            <li className="text-sm sm:text-base text-blue-400 text-justify">
                                Near me विकल्प में प्रॉपर्टी केवल वेरिफिकेशन के बाद ही दिखाई देगी।
                            </li>
                        </>
                    )}
                </ul>
            </div>
            <div className="w-full bg-yellow-50 border border-yellow-300 rounded p-4 text-xs text-yellow-800 mt-2 text-justify mb-4">
                {lang === "en" ? (
                    <>
                        <strong>Note:</strong>
                        <br />
                        If the owner posts property details or photos illegally or incorrectly on the website, the Roomlocus team can block your ID and may also take legal action against you.
                        <br />
                        The owner will be fully responsible for any illegal or incorrect posting of property details or photos on the website.
                    </>
                ) : (
                    <>
                        <strong>नोट:</strong>
                        <br />
                        यदि owner द्वारा प्रॉपर्टी की डिटेल व फोटो अवैध व गलत तरीके से वेबसाइट पर पोस्ट किये गये तो Roomlocus की टीम आपकी id ब्लॉक कर सकती है और आपके खिलाफ क़ानूनी कार्यवाही भी कर सकती है।
                        <br />
                        प्रॉपर्टी की डिटेल व फोटो अवैध व गलत तरीके से वेबसाइट पर पोस्ट करने पर सभी प्रकार की जिम्मेदारी owner की होगी।
                    </>
                )}
            </div>
        </div>
    );
}
