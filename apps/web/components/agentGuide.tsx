import { useState } from "react";

export default function OwnerGuide() {
    const [lang, setLang] = useState<"en" | "hi">("en");

    return (
        <div className="mt-4 w-full max-w-2xl mx-auto flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="mb-4 w-full flex justify-end">
                <button
                    className={`px-1 py-0.5 rounded ${lang === "en" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setLang("en")}
                >
                    Eng
                </button>
                <button
                    className={`px-1 py-0.5 rounded ${lang === "hi" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setLang("hi")}
                >
                    हिन्दी
                </button>
            </div>
            <ul className="space-y-4 list-disc pl-5">
                {lang === "en" ? (
                    <>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            According to ROOMLOCUS guidelines, agents currently receive a commission of ₹200 per property for verifying a property.
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            While verifying a property, the agent must carefully check the owner&apos;s Aadhaar, other ID, and property photos and details. If verification is done incorrectly, the agent&apos;s ID may be blocked or marked as not verified, and you may not be able to withdraw money of that particular listing commission from your wallet.
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            Property verification is an annual process and will be renewed every year. After one year, a verified property will automatically become not verified. Upon annual fee payment, the property will be re-verified by the agent and become verified again.
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            The commission shown in the agent's wallet is transferred to their UPI or bank account once a week.
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            A 5% charge is deducted from the commission amount shown in the wallet during withdrawal.
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            If the property verification is done incorrectly, you will not get commission for that property and its commission will be rejected by the admin team.
                        </li>
                        <h3 className="font-semibold text-black">How to talk to the owner while verifying their property:</h3>
                        <p className="text-sm sm:text-base text-blue-400 text-justify">Sir, if you get your property verified by an agent, your property will be instantly verified. We will also advertise your property so that more and more customers can reach you.</p>

                        <h3 className="font-semibold text-black">Our Future Plan</h3>
                        <p className="text-sm sm:text-base text-blue-400 text-justify">According to Roomlocus guidelines, the property verification commission may be set at ₹250, ₹300, ₹400, ₹500, etc.</p>
                        <p className="text-sm sm:text-base text-blue-400 text-justify">The agent cannot make any claim on Roomlocus or its services</p>
                        <p className="text-sm sm:text-base text-blue-400 text-justify">Roomlocus may change its policy and terms &amp; conditions from time to time.</p> 
                    </>
                ) : (
                    <>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            ROOMLOCUS की गाइडलाइन के अनुसार एजेंट द्वारा प्रॉपर्टी वेरीफाई करने पर वर्तमान में 200 रु प्रति प्रॉपर्टी कमीशन दिया जाता है।
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            प्रॉपर्टी वेरीफाई करते समय owner का आधार, अन्य ID और प्रॉपर्टी की फोटो और डिटेल अच्छे से देखनी होगी। गलत तरीके से वेरिफिकेशन करने पर एजेंट की ID ब्लॉक या नॉट वेरीफाई हो सकती है, जिस कारण आप अपने वॉलेट से  लिस्टिंग का कमीशन के पैसे नहीं निकाल सकते हैं।
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            प्रॉपर्टी वेरिफिकेशन एक वार्षिक प्रक्रिया है, जो प्रति वर्ष रिन्यू की जाएगी। एक वर्ष बाद Verified प्रॉपर्टी अपने आप Not Verified हो जाएगी। वार्षिक फीस पेमेंट करने पर Agent द्वारा वेरिफिकेशन करके पुनः verified हो जाएगी।
                        </li>
                         <li className="text-sm sm:text-base text-blue-400 text-justify">
                            एजेंट के वॉलेट में दर्शाया गया कमिशन हफ्ते में एक बार उसके यूपीआई या अकाउंट में ट्रांसफर किया जाता है
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            वॉलेट में दिखाए गए कमीशन अमाउंट से निकासी के समय 5% चार्ज काटा जाता है।
                        </li>
                        <li className="text-sm sm:text-base text-blue-400 text-justify">
                            अगर प्रॉपर्टी वेरिफिकेशन गलत तरीके से किया गया तो उस प्रॉपर्टी के लिए आपको कमीशन नहीं मिलेगा और उसका कमीशन एडमिन टीम द्वारा रिजेक्ट कर दिया जाएगा।
                        </li>
                        <h3 className="font-semibold text-black">OWNER की PROPERTY VERIFY करते समय owner से कैसे बात करें:</h3>
                        <p className="text-sm sm:text-base text-blue-400 text-justify">सर, अगर आप एजेंट के द्वारा अपनी प्रॉपर्टी वेरीफाई कराते हैं तो आपकी प्रॉपर्टी तुरंत वेरीफाई हो जाएगी। हम आपकी प्रॉपर्टी की विज्ञापन भी करेंगे जिससे ज्यादा से ज्यादा ग्राहक आप तक पहुंच सकें।</p>

                        <h3 className="font-semibold text-black">Our Future Plan</h3> 
                        <p className="text-sm sm:text-base text-blue-400 text-justify">Roomlocus की गाइडलाइन के अनुसार Property Verify कमीशन 250, 300, 400, 500 आदि किया जा सकता है।</p>
                        <p className="text-sm sm:text-base text-blue-400 text-justify">एजेंट Roomlocus या उसकी सर्विस पर किसी भी प्रकार का दावा नहीं कर सकता है।</p>
                        <p className="text-sm sm:text-base text-blue-400 text-justify">Roomlocus समय-समय पर अपनी पालिसी और टर्म्स एंड कंडीशन बदल सकता है।</p>
                    </>
                )}
            </ul>
        </div>
    );
}
