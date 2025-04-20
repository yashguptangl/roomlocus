"use client";
import Footer from "../../components/footer";
import zone from "../../assets/zone.png";
import userIcon from "../../assets/user-icon.png";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return (<>
        <div className="flex h-16 w-full bg-blue-400 justify-between p-3 items-center">
            {/* Logo Image */}
            <div className="relative w-32 h-12 ml-3">
                <Image src={zone} alt="logo" fill className="object-contain" 
                onClick={() => router.push("/")}
                />
            </div>

            {/* User Icon Image */}
            <div className="relative w-8 h-8 mr-8">
                <Image src={userIcon} alt="user-logo" fill className="object-contain" />
            </div>
        </div>
        {children}
        <Footer />
    </>
    )
}