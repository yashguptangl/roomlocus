import fb from "../assets/fb.png";
import tw from "../assets/tw.png";
import linkdin from "../assets/in.png";
import Image from "next/image";

export default function MainFooter() {
  return (
    <div className="flex flex-col items-center bg-gray-400 w-full gap-4 mt-32 relative bottom-0 ">
      <p className="text-sm sm:text-base">English</p>
      <p className="text-sm sm:text-base">+91-9719507080</p>
      <p className="text-sm sm:text-base">info@roomlocus.com</p>

      <div className="relative flex justify-center gap-5">
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
        <div className="relative h-8 sm:h-10 w-8 sm:w-10">
          <Image 
          src={tw} 
          alt="Instagram" 
          onClick={() => window.open("https://www.instagram.com/roomlocus/", "_blank")}
          fill 
          className="object-contain" />
        </div>
      </div>

      <p className="font-semibold text-xs sm:text-xl text-center">
        About Us | Terms of Use | Contact us | Help
      </p>

      <p className="bg-gray-500 w-full  text-center text-xs sm:text-lg py-2">
        Copyright &copy; 2019 roomlocus Pvt Ltd. All Rights Reserved
      </p>
    </div>
  );
}
