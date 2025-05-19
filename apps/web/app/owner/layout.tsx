"use client";
import Footer from "../../components/footer";
import Navbar from "../../components/navbar";
import { useRouter } from "next/navigation";


export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return (<>
        <Navbar />  
        {children}
        <Footer />
    </>
    )
}