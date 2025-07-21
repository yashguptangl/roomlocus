import fb from "../assets/fb.png";
import ig from "../assets/ig.png";
import linkdin from "../assets/in.png";
import Image from "next/image";
import Link from "next/link";

export default function MainFooter() {
  return (
    <div className="flex flex-col items-center bg-gray-400 w-full gap-4 mt-32 relative bottom-0 ">     

      <div className="relative flex justify-center gap-5 mt-4">
        <div className="relative h-8 sm:h-10 w-8 sm:w-10">
          <Image 
          src={fb}
          alt="Facebook" 
          fill
          onClick={() => window.open("https://www.facebook.com/roomlocus/", "_blank")}
          className="object-contain" />
        </div>
        <div className="relative h-8 sm:h-10 w-8 sm:w-10">
          <Image 
          src={linkdin}
          alt="LinkedIn" 
          fill 
          onClick={() => window.open("https://in.linkedin.com/company/roomlocus", "_blank")}
          className="object-contain" />
        </div>
        <div className="relative h-8 sm:h-10 w-8 sm:w-10 ">
          <Image 
          src={ig} 
          alt="Instagram" 
          onClick={() => window.open("https://www.instagram.com/roomlocus/", "_blank")}
          fill 
          className="object-contain rounded-full" />
        </div>
      </div>
      <p className="text-sm sm:text-base sm:font-semibold">
        <Link href="/about-us">About Us</Link> |{" "}
        <Link href="/contact-us">Contact Us</Link>
      </p>

      <p className="sm:font-semibold  text-xs sm:text-xl text-center">
        <Link href="/privacy-policy">Privacy Policy</Link> |{" "}
        <Link href="/refund">Payment Refund Policy</Link> |{" "} 
        <Link href="/terms-and-condition">Terms & Conditions</Link>
      </p>

      <p className="bg-gray-500 w-full  text-center text-xs sm:text-lg py-2">
        Copyright &copy; 2025 Roomlocus India Pvt. Ltd. All Rights Reserved
      </p>
    </div>
  );
}
